import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@angular/material/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatTreeFlatDataSource } from '@angular/material/tree';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'angular-highcharts';
import { combineLatest, forkJoin, interval, Observable, Subscription } from 'rxjs';
import {
  FeatureItemFlatNode,
  FeatureItemNode,
  Hierarchy,
  ProductModel,
  TagParameters
} from '../../../../models/index';
import {
  CommonService,
  EnergyService,
  PlantServiceService,
  SiteService
} from '../../../../services/index';
import {
  AppUtils,
  Constants,
  Highcharts$,
  Moment$,
  WarningDialog
} from '../../../../shared/index';
import { RealTimeEbyQModal } from './real-time-eq-modal/real-time-eq-modal.component';
// require('highcharts/modules/exporting')(Highcharts$);
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import { RealTimeEbyQTargetModal } from './real-time-ebyq-target-modal/real-time-ebyq-target-modal.component';
HC_exporting(Highcharts$);
HC_exportData(Highcharts$);

@Component({
  selector: 'app-specific-energy',
  templateUrl: './specific-energy.component.html',
  styleUrls: ['./specific-energy.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: Constants.DATE_RANGES_PROVIDER_FORMAT
    }
  ]
})
export class SpecificEnergyComponent
  extends Hierarchy
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('tree') tree;
  @ViewChild('tree1') tree1;

  siteId: string;
  startDate: string;
  endDate: string;
  isST_load: boolean;
  isMeter: undefined | boolean = undefined;
  isFirstLoaded = true;
  shifts: any;
  dateRange: any;
  alwaysShowCalendars: boolean;
  ranges: any = {
    Yesterday: [Moment$().subtract(1, 'days'), Moment$().subtract(1, 'days')],
    'Last 7 Days': [Moment$().subtract(6, 'days'), Moment$()],
    'Last 30 Days': [Moment$().subtract(29, 'days'), Moment$()],
    'This Month': [Moment$().startOf('month'), Moment$().toDate()]
  };
  totalEnergy = '';
  columnchart: Chart;
  rateChart: Chart;
  currentNode: {
    nodeData: any;
    metersId: any;
    nodeTitle: string;
    nodeType: string;
    loadId: string;
    meterId: string;
    loadRId: string;
    kwRating: any;
  } = Object.assign({});
  treeRadioControl: any;
  variantList: string[];
  filteredOptions: Observable<string[]>;
  displayUpdateTagAlert = true;
  tagParameters: TagParameters;
  isNotViewFull = true;
  buttons: any;
  firstLeaftNode: any;
  productsOfSite: ProductModel[];
  selectedProducts = 'all';
  selectedVariants: 'all';
  liveEQChartDataToExcel: any;
  liveEQAnalysisChartConfig: any;
  useShiftwise = 'no';
  currentData: any;
  hasChart = false;
  isVarient = false;
  isAdmin = false;
  //
  currentSuccessPercent: any;
  currentSuccessMessage = '';
  //
  DEFAULT_SUCCESS_PERCENT = 50.00;
  MESSAGE_MEET_TARGET = 'E/Q met the Target for selected date range';
  MESSAGE_NOT_MEET_TARGET =
    'E/Q does not meet the Target for selected date range';
  DEFAULT_CHART_HEIGHT = 585;
  //
  currentDisplayItem: String; // all, energy, production, specific, target
  DISPLAY_ALL = 'all';
  DISPLAY_ENERGY = 'energy';
  DISPLAY_PRODUCTION = 'production';
  DISPLAY_TARGET = 'target';
  //
  TIME_RANGE_DAILY = 'daily';
  TIME_RANGE_HOURLY = 'hourly';
  TIME_RANGE_WEEKLY = 'weekly';
  TIME_RANGE_MONTHLY = 'monthly';
  TIME_RANGE_YEARLY = 'yearly';
  currentTimeRange = this.TIME_RANGE_DAILY;
  MONTHS_LIST = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  treeform: FormGroup;
  dataProductionSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  variantModel: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private activeRoute: ActivatedRoute,
    private plantService: PlantServiceService,
    private siteService: SiteService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private energyService: EnergyService,
    private fb: FormBuilder
  ) {
    super();
    this.tagParameters = new TagParameters();
    this.alwaysShowCalendars = true;
    this.dateRange = {
      startDate: Moment$().subtract(1, 'days'),
      endDate: Moment$().subtract(1, 'days')
    };
    this.treeRadioControl = 'Energy';
    this.variantModel = {}
    this.treeform = this.fb.group({
      product: [''],
      variant: ['',Validators.required],
      variantFilterCtrl: ['']

    });

  }

  ngOnInit() {
    this.variantList = [];
    // Combine them both into a single observable
    const urlParams = combineLatest(
      this.activeRoute.params,
      this.activeRoute.queryParams,
      (params, queryParams) => ({ ...params, ...queryParams })
    );
    // Subscribe to the single observable, giving us both
    urlParams.subscribe((routeParams) => {
      this.siteId = routeParams.siteId;
      forkJoin(
        this.plantService.getShiftsBySiteId(this.siteId),
        this.siteService.getTreeConfiguration(this.siteId)
      ).subscribe(([shifts, treeConfig]) => {
        this.shifts = shifts;
        this.dataSource.data = [];
        this.dataProductionSource.data = [];
        if (treeConfig !== undefined && treeConfig.treeData !== undefined) {
          // Data api is wrong. Can not use checkbox
          const dataPaser = JSON.parse(treeConfig.treeData);
          this.dataSource.data = this.buildFileTree(dataPaser[0], this.dataSource.data, null);
          this.tree && this.tree.treeControl ? this.tree.treeControl.expandAll(): '';

          // Check if current user is Admin or not -> allow select more than 10 days
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if(currentUser && currentUser.role && currentUser.role.code){
            this.isAdmin = 'admin' === currentUser.role.code.toLowerCase();
          }
          this.getFirstLoad(this.dataSource.data);
          //this.getFirstLoad(this.dataProductionSource.data);
        }
        if (treeConfig !== undefined && treeConfig.productionTreeData !== undefined) {
          const dataProductionPaser = JSON.parse(treeConfig.productionTreeData);

          this.dataProductionSource.data = this.buildFileTree(dataProductionPaser[0], this.dataProductionSource.data, null);
          this.tree1 && this.tree1.treeControl ? this.tree1.treeControl.expandAll(): '';

          // Check if current user is Admin or not -> allow select more than 10 days
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if(currentUser && currentUser.role && currentUser.role.code){
            this.isAdmin = 'admin' === currentUser.role.code.toLowerCase();
          }

          console.log("active node", this.activeNode, this.currentNode, this.currentData);
          this.getFirstLoad(this.dataProductionSource.data);
          //this.getFirstLoad(this.dataProductionSource.data);
        }
      });
    });
    this.initSolidGauge(0);
  }
    
  ngAfterViewInit(): void {
    this.tree && this.tree.treeControl ? this.tree.treeControl.expandAll(): '';
    this.tree1 && this.tree1.treeControl ? this.tree1.treeControl.expandAll(): '';

    // collapseAll
    const seft = this;
    window.onresize = function () {
      const dom = document.getElementById('chartContainer');
      if (seft.commonService.isNullOrUndefined(dom)) {
        return;
      }
      if (dom && dom.clientHeight > seft.DEFAULT_CHART_HEIGHT) {
        setTimeout(() => {
          dom.setAttribute('height', seft.DEFAULT_CHART_HEIGHT + '');
        }, 200);
      }
      if (document.fullscreenElement) {
        seft.columnchart.ref.setSize(
          document.documentElement.clientWidth,
          document.documentElement.clientHeight
        );
      } else {
        seft.columnchart.ref.setSize(
          dom.clientWidth,
          dom.clientHeight < seft.DEFAULT_CHART_HEIGHT
            ? dom.clientHeight
            : seft.DEFAULT_CHART_HEIGHT
        );
      }
    };
    this.buttons = Highcharts$ && Highcharts$.getOptions().exporting && Highcharts$.getOptions().exporting.buttons ? Highcharts$.getOptions().exporting.buttons : '';
    Highcharts$.setOptions({
      exporting: {
        buttons: {
          contextButton: {
            menuItems: this.buttons && this.buttons.contextButton && this.buttons.contextButton.menuItems ? this.buttons.contextButton.menuItems.slice(0, 2) : ''
          }
        }
      }
    });
    Highcharts$.setOptions({
      colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
  });
  
    document.addEventListener('fullscreenchange', function () {
      if (seft.columnchart.ref) {
        seft.columnchart.ref.update({
          exporting: {
            buttons: {
              contextButton: {
                menuItems: seft.isNotViewFull
                ? seft.buttons.contextButton.menuItems.slice(1, 2)
                : seft.buttons.contextButton.menuItems.slice(0, 2)
            }
            }
          }
        });
      }
      seft.isNotViewFull = !seft.isNotViewFull;
    });

  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', function () {});
  }
  private onChartLoaded = () => {
    const self = this;
    setTimeout(function () {
      if (self.rateChart !== undefined) {
        const point = <any>self.rateChart.ref.series[0].points[0];
        point.onMouseOver();
        self.rateChart.ref.tooltip.refresh(point);
      }
    }, 200);
  };

  private initSolidGauge = (dataChart?: any, isEnergy = false) => {
    const textColor =
      this.currentSuccessPercent >= this.DEFAULT_SUCCESS_PERCENT
        ? '#307bbb'
        : '#f15c80';
    const text =
      this.currentSuccessPercent >= this.DEFAULT_SUCCESS_PERCENT
        ? 'Success'
        : 'Failed';

    const options = {
      chart: {
        type: 'solidgauge',
        height: 120,
        width: 120,
        events: {
          load: this.onChartLoaded
        }
      },
      title: {
        text: '',
        style: {
          fontSize: '12px'
        }
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      tooltip: {
        alwaysVisible: true,
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
        style: {
          fontSize: '14px'
        },
        pointFormat: `<span style="font-size:15px; color: ${textColor}; font-weight: bold">${text}</span>`,
        positioner: function (labelWidth, labelHeight) {
          return {
            x: (this.chart.chartWidth - labelWidth) / 2,
            y: this.chart.plotHeight / 2 - 5
          };
        }
      },
      pane: {
        startAngle: 0,
        endAngle: 360,
        background: [
          {
            // Track for Stand
            innerRadius: '100%',
            backgroundColor: '#E7EBEF',
            borderWidth: 0
          }
        ]
      },
      yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickPositions: []
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: false
          },
          linecap: 'round',
          stickyTracking: false,
          rounded: true
        }
      },
      series: [
        {
          name: text,
          data: [
            {
              color: '#307bbb',
              radius: '100%',
              innerRadius: '90%',
              y: dataChart
            }
          ]
        }
      ]
    };
    this.alwaysVisibleTooltip();
    this.rateChart = new Chart(<any>options);
  };

  private alwaysVisibleTooltip = () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    Highcharts$.wrap(
      Highcharts$.Tooltip.prototype,
      'hide',
      function (p, delay) {
        if (this.options.alwaysVisible) {
          return this.refresh(this.chart.series[0].data[0]);
        }
        p.call(this, delay);
      }
    );
  };

  buildFileTree(
    obj: any,
    nodes: FeatureItemNode[],
    currentSelected: FeatureItemFlatNode
  ): FeatureItemNode[] {
    const node = new FeatureItemNode();
    node.title = obj.title;
    node.id = obj.id;
    node.nodeType = obj.nodeType;
    node.subType = obj.subType;
    node.processRId = obj.processRId !== undefined ? obj.processRId : 'NA';
    node.meterId = obj.meterId !== undefined ? obj.meterId : 'NA';
    node.loadId = obj.loadId !== undefined ? obj.loadId : 'NA';
    node.loadRId = obj.loadRId !== undefined ? obj.loadRId : 'NA';
    node.kwRating = obj.kwRating;
    if (currentSelected != null && currentSelected.id === obj.id) {
      node.selected = true;
    }
    if (obj.nodes.length > 0) {
      node.nodes = [];
      obj.nodes.forEach((element) => {
        node.nodes = this.buildFileTree(element, node.nodes, currentSelected);
      });
    }


    return nodes.concat(node);
  }

  /** Toggle the feature item selection. Select/deselect all the descendants node */
  public featureItemSelectionToggle(node: FeatureItemFlatNode): void {
    this.activeNode = node;
    this.setCurrentNode(node);
    this.resetData();
    this.processDataAndDrawChart();
  }

  /** Toggle a leaf feature item selection. Check all the parents to see if they changed */
  public featureLeafItemSelectionToggle(node: FeatureItemFlatNode): void {
    this.activeNode = node;
    this.setCurrentNode(node);
    this.resetData();
    this.processDataAndDrawChart();
  }

  private getAllMetersIdOfNode = (node: any, metersId: any) => {
    if (node.meterId !== 'NA') {
      metersId.push(node.meterId);
    }
    if (node.nodes !== undefined && node.nodes.length > 0) {
      for (let i = 0; i < node.nodes.length; i++) {
        metersId = this.getAllMetersIdOfNode(node.nodes[i], metersId);
      }
    }
    return metersId;
  };

  private getFirstLoad = (tree: any) => {
    const firstLeaf = this.getFirstLeafOfTree(tree);
    this.activeNode = firstLeaf;
    if (
      typeof firstLeaf.is_ST_Load !== 'undefined' &&
      firstLeaf.is_ST_Load != null &&
      firstLeaf.is_ST_Load
    ) {
      this.isST_load = true;
    } else {
      this.isST_load = false;
    }
    this.setCurrentNode(firstLeaf);
    const node = document.getElementById(firstLeaf.title);
    if (node && node != null) {
      node.dispatchEvent(new Event('click'));
      // this.resetData();
      // this.processDataAndDrawChart();
      this.isFirstLoaded = false;
    }
  };

  private getFirstLeafOfTree = (tree: any, conditions: any = undefined) => {
    let result;
    if (tree !== undefined) {
      for (let i = 0; i < tree.length; i++) {
        if (this.hasChildNode(tree[i])) {
          result = this.getFirstLeafOfTree(tree[i].nodes, conditions);
        } else {
          let conditionEvaluated = true;
          if (conditions !== undefined) {
            const propNames = Object.keys(conditions);
            for (let j = 0; j < propNames.length; j++) {
              conditionEvaluated =
                conditionEvaluated &&
                tree[i][propNames[j]] === conditions[propNames[j]];
              if (conditionEvaluated === false) {
                break;
              }
            }
          }
          if (tree[i].loadId !== undefined && conditionEvaluated) {
            result = tree[i];
            tree[i].selected = true;
            break;
          } else {
            continue;
          }
        }
        if (result !== undefined) {
          break;
        }
      }
    }
    return result;
  };

  private hasChildNode = (branch: any): boolean => {
    return branch.nodes === undefined || branch.nodes.length === 0
      ? false
      : true;
  };

  private setCurrentNode = (node: FeatureItemNode | FeatureItemFlatNode) => {
    this.isST_load = true;
    this.currentNode.nodeData = node;
    const metersId = this.getAllMetersIdOfNode(node, []);
    this.currentNode.metersId = AppUtils.uniqueArray(metersId);
    this.currentNode.nodeTitle = node.title;
    this.currentNode.nodeType = node.nodeType;
    if (node.nodeType === Constants.NODE_TYPE.METER) {
      this.isMeter = true;
      this.currentNode.meterId = node.meterId;
      this.currentNode.loadId = node.meterId;
      this.isST_load = false;
    } else if (node.nodeType === Constants.NODE_TYPE.PROCESS || node.nodeType == Constants.NODE_TYPE.TEXT) {
      this.isST_load = false;
      this.currentNode.loadId = node.loadId;
      this.currentNode.loadRId = node.loadRId;
      this.currentNode.kwRating = node.kwRating;
    } else if (node.nodeType === Constants.NODE_TYPE.LOAD) {
      this.isMeter = false;
      this.isST_load = false;
      this.currentNode.meterId = node.meterId;
      this.currentNode.loadId = node.loadId;
      this.currentNode.loadRId = node.loadRId;
      this.currentNode.kwRating = node.kwRating;
      
      if (node.subType !== undefined && node.subType === 'StratificationTank') {
        this.isST_load = true;
      }
    }
    let productModel = {
      siteId: this.siteId,
      loadIds: [node.loadId],
      nodeName: node.title,
      nodeType: node.nodeType

    }
    this.energyService
      .getProductsBySiteId(productModel)
      .subscribe((data) => {
        this.productsOfSite = data;
      });
      this.variantModel = {
        siteId: this.siteId,
        loadIds: [node.loadId],
        nodeName: node.title,
        nodeType: node.nodeType,
        product:  this.selectedProducts === 'all' ? null : this.selectedProducts,
      }

  };

  

  public onChangeDateRange = () => {
    if (
      Moment$(this.dateRange.endDate).diff(
        Moment$(this.dateRange.startDate),
        'days'
      ) >= 31
    ) {
      this.commonService.showDialogMessage(
        'Note: Data display limited to 31 days. Please select duration not more than 31 days'
      );
      return;
    }

    if (this.commonService.isLaterThanCurentDate(this.dateRange.endDate)) {
      this.commonService.showDialogMessage(Constants.FUTURE_DATE_NOT_ALLOW);
      return;
    }
    if (
      (this.isFirstLoaded === false && this.siteId !== null) ||
      this.siteId !== undefined
    ) {
      this.resetData();
      this.processDataAndDrawChart();
    }
  };

  // datesUpdated(event) {
  //   this.resetData();
  //   this.processDataAndDrawChart();
  // }

  private transformDate = () => {
    this.startDate = Moment$(this.dateRange.startDate).format(
      Constants.MOMENT_DATE_FORMAT.DATE_FORMAT
    );
    this.endDate = Moment$(this.dateRange.endDate).format(
      Constants.MOMENT_DATE_FORMAT.DATE_FORMAT
    );
  };
  
//product and variant chart data process and draw chart
  public processDataAndDrawChart = () => {
    if (this.isST_load === false) {
      this.transformDate();
      // Validate date range
      // Admin Users can view data for > 10 Days
      // Site Users cannot View data > 10 Days
      if (
        Moment$(this.dateRange.endDate).diff(
          Moment$(this.dateRange.startDate),
          'days'
        ) > 10 &&
        !this.isAdmin
      ) {
        this.onOpenAlertBox(
          'Note: Data display limited to 10 days. Please select duration not more than 10 days'
        );
      } else {
        let params = {
          siteId: this.siteId,
          //     "startDate":"2022-03-05",
          //     "endDate":"2022-03-06"          
          startDate: this.startDate,
          // startDate: '2018-03-28',
          endDate: this.endDate,
          // endDate: '2018-04-29',
          meterIds: this.currentNode.metersId,
          // meterIds: ['719'],
          nodeId: this.currentNode.loadId,
          // loadId: 'MakHeating1143',
          nodeType: this.currentNode.nodeType,
          product:
            this.selectedProducts === 'all' ? null : this.selectedProducts,
          variantType: 
            this.selectedVariants === 'all' ? null : this.selectedVariants,
          shift: null,
          kpi: "Energy"
        };
        if(this.isVarient == false){
          delete params.variantType;
          // delete params.product;
        } 
        const t = this;
        setTimeout(() => {
          t.energyService.fetchDataForEbyQAnalysis(params).subscribe((data) => {
            if (data && data.result && data.result.length > 0) {
              this.hasChart = true;

              t.currentData = Object.assign({}, data);

              //Process pie chart data
              let successCount = 0;
              let sum = 0;
              let totalActualDays=0;
              for (var i = 0; i < data.result.length; i++) {
                if (data.result[i].actualEbyQ >= data.result[i].plannedEbyQ) {
                  totalActualDays += 1;
                }
              }
              if(totalActualDays>0){
                t.currentSuccessPercent = 100 * ((data.result.length - totalActualDays)/ data.result.length) ;
// 100 * [ total count of days in the selction - no. of days, actual > target value ) / ( total count of days in the selction) ]
              } else{
                t.currentSuccessPercent = 0;
              }
              console.log("currentSuccessPercent",totalActualDays,data.result.length,t.currentSuccessPercent);
              t.currentSuccessPercent = parseFloat(t.currentSuccessPercent.toString()).toFixed(2);
              let defaultSuccessPer = parseFloat(t.DEFAULT_SUCCESS_PERCENT.toString()).toFixed(2);
              t.currentSuccessMessage =
                t.currentSuccessPercent >= defaultSuccessPer
                  ? t.MESSAGE_MEET_TARGET
                  : t.MESSAGE_NOT_MEET_TARGET;
              let successPercent = Math.round(t.currentSuccessPercent);
              t.initSolidGauge(successPercent);
              // Draw column chart
              t.drawChart();
            }
          });
        }, 600);
      }
    } else {
      // Show message box
      this.onOpenAlertBox('Please choose any relevant load to view data.');
    }
  };

  private getAreaChartConfigOption = () => {
    const self = this;
    const option = {
      chart: {
        zoomType: 'x',
        height: self.DEFAULT_CHART_HEIGHT
      },
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      yAxis: [
        {
          min: 0,
          startOnTick: false,
          endOnTick: false,
          labels: {
            format: '{value}',
            style: {
              color: '#7CB5EC', //blue
              fontSize: '14px'
            }
          },
          title: {
            text: 'Actual daily(parts produced)',
            style: {
              color: '#7CB5EC',
              fontweight: 'bold',
              fontSize: '14px'
            }
          },
          reversedStacks: false
        },
        {
          min: 0,
          labels: {
            format: '{value}',
            style: {
              color: '#434348', //purple
              fontSize: '14px'
            }
          },
          title: {
            text: 'kWh/Day',
            style: {
              color: '#434348',
              fontweight: 'bold',
              fontSize: '14px'
            }
          },

          opposite: true,
          reversedStacks: false
        },
        {
          min: 0,
          title: {
            text: 'kWh/PC', //'Actual kWh/PC',
            style: {
              color: '#434348', //'#90ED7D',//red
              fontSize: '14px'
            }
          },
          labels: {
            format: '{value} ',
            style: {
              color: '#434348', //'#90ED7D',
              fontSize: '14px'
            }
          },
          opposite: true
        }
      ],
      xAxis: {
        title: {
          text: ''
        },
        type: 'date',
        labels: {},
        tickLength: 10,
        startOnTick: true,
        endOnTick: true,
        categories: [],
        crosshair: true,
        events: {}
      },
      plotOptions: {
        series: {
          marker: {
            enabled: true
          },
          turboThreshold: 0,
          threshold: null,
          point: {
            events: {
              click: function (callback) {
                return callback;
              }
            }
          }
        }
      },
      series: [],
      tooltip: {
        shared: true,
        crosshairs: true,
        formatter: function () {
          // eslint-disable-next-line max-len
          let toolTipData = '';
          if (self.currentTimeRange === self.TIME_RANGE_DAILY) {
            toolTipData =
              '<b><font style="font-size: 10px;">' +
              Moment$(this.x).format(Constants.MOMENT_DATE_FORMAT.DATE_FORMAT) +
              '</font></b><br/>';
          } else {
            toolTipData =
              '<b><font style="font-size: 10px;">' +
              this.x +
              '</font></b><br/>';
          }

          for (let i = 0; i < this.points.length; i++) {
            const myPoint = this.points[i];
            // eslint-disable-next-line max-len
            let suffix =
              '<span style="color:' +
              myPoint.series.data[myPoint.point.index].color +
              '">\u25CF</span>   ' +
              myPoint.series.name +
              ': ';
            if (myPoint.point.low && myPoint.point.high) {
              suffix +=
                '<b>' +
                Highcharts$.numberFormat(
                  myPoint.point.low,
                  Constants.DECIMAL_FORMAT.DECIMAL_NO
                ) +
                ' - ' +
                Highcharts$.numberFormat(
                  myPoint.point.high,
                  Constants.DECIMAL_FORMAT.DECIMAL_NO
                ) +
                '</b><br/>';
            } else {
              suffix +=
                '<b>' +
                Highcharts$.numberFormat(
                  myPoint.y,
                  Constants.DECIMAL_FORMAT.DECIMAL_NO
                ) +
                '</b><br/>';
            }

            if (myPoint.series.name.indexOf('Data Tags') !== -1) {
              // eslint-disable-next-line max-len
              suffix =
                '<span style="color:' +
                myPoint.series.data[myPoint.point.index].color +
                '">\u25CF</span>  ' +
                myPoint.series.name +
                ' : Present <br/>';
            }
            if (myPoint.series.name.indexOf('Fuel Consumption') !== -1) {
              // eslint-disable-next-line max-len
              suffix =
                '<span style="color:' +
                myPoint.series.data[myPoint.point.index].color +
                '">\u25CF</span>   ' +
                myPoint.series.name +
                ': ' +
                Highcharts$.numberFormat(
                  myPoint.y,
                  Constants.DECIMAL_FORMAT.DECIMAL_NO
                ) +
                ' (Litres)<br/>';
            }

            toolTipData += suffix;
          }
          return toolTipData;
        }
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: ["viewFullscreen", "printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG","downloadXLS"],
          },
        },

      }


    };
    return option;
  };

  private onOpenAlertBox = (description: string) => {
    const dialogRef = this.dialog.open(WarningDialog, { width: '50%' });
    dialogRef.componentInstance.confirmMessage = description;
  };

  clickAll(event) {}
  clickEnergy(event) {}
  clickProduction(event) {}
  clickSpecificEnergy(event) {}
  clickTarget(event) {}

  drawChart() {
    if (this.currentData === undefined || this.currentData === null) {
      return;
    }
    let data = this.currentData.result;
    //
    var categoryArr = [];
    var actualQArr = [];
    var actualEArr = [];
    var actualEbyQArr = [];
    var taragetEbyQArr = [];
    //
    var plannedQArr = [];
    var EfirstShiftArr = [];
    var EsecondShiftArr = [];
    var EnightShiftArr = [];
    var EfourthShiftArr = [];
    var QfirstShiftArr = [];
    var QsecondShiftArr = [];
    var QnightShiftArr = [];
    var QfourthShiftArr = [];
    //product
    var actualQ_P0Arr = [];
    var firstshiftactualQ_P1Arr = [];
    var secondshiftactualQ_P1Arr = [];
    var nightshiftactualQ_P1Arr = [];
    var fourthshiftactualQ_P1Arr = [];

    //variant
    var firstshiftactualQ_V1Arr = [];
    var secondshiftactualQ_V1Arr = [];
    var nightshiftactualQ_V1Arr = [];
    var fourthshiftactualQ_V1Arr = [];

    if (this.currentTimeRange === this.TIME_RANGE_DAILY) {
      for (var i = 0; i < data.length; i++) {
        categoryArr.push(data[i].date);
        //console.log('the data is->' + JSON.stringify(data));
        //console.log('the firstshiftq-->' + data[i].firstshiftactualQ);
        //actualQArr.push(Number(Highcharts$.numberFormat(data[i].actualQ, Constants.DECIMAL_FORMAT.DECIMAL_NO)));
        var num = data[i].actualQ;
        actualQArr.push(num);
        // console.log('actual q-->' + data[i].actualQ.toFixed);
        actualEArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].actualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        actualEbyQArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].actualEbyQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        taragetEbyQArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].plannedEbyQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        //
        plannedQArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].plannedQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        EfirstShiftArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].firstshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        EsecondShiftArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].secondshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        EnightShiftArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].nightshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        EfourthShiftArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].fourthshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
        QfirstShiftArr.push(data[i].firstshiftactualQ);
        QsecondShiftArr.push(data[i].secondshiftactualQ);
        QnightShiftArr.push(data[i].nightshiftactualQ);

        QfourthShiftArr.push(
          Number(
            Highcharts$.numberFormat(
              data[i].fourthshiftactualQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
        );
          actualQ_P0Arr.push(
            Number(
                data[i] && data[i].product && data[i].product.actualQ ? data[i].product.actualQ : '',
            )
          );

          firstshiftactualQ_P1Arr.push(
            Number(
              Highcharts$.numberFormat(
                data[i] && data[i].product && data[i].product.firstshiftactualQ ? data[i].product.firstshiftactualQ: '',
                Constants.DECIMAL_FORMAT.DECIMAL_NO
              )
            )
          );
          secondshiftactualQ_P1Arr.push(
            Number(
              Highcharts$.numberFormat(
                data[i] && data[i].product && data[i].product.secondshiftactualQ ? data[i].product.secondshiftactualQ: '',
                Constants.DECIMAL_FORMAT.DECIMAL_NO
              )
            )
          );
          nightshiftactualQ_P1Arr.push(
            Number(
              Highcharts$.numberFormat(
                data[i] && data[i].product && data[i].product.nightshiftactualQ ? data[i].product.nightshiftactualQ: '',
                Constants.DECIMAL_FORMAT.DECIMAL_NO
              )
            )
          );
          
          fourthshiftactualQ_P1Arr.push(
            Number(
              Highcharts$.numberFormat(
                data[i] && data[i].product && data[i].product.fourthshiftactualQ ? data[i].product.fourthshiftactualQ: '',
                Constants.DECIMAL_FORMAT.DECIMAL_NO
              )
            )
          );

        // firstshiftactualQ_P1Arr.push(data[i].product.firstshiftactualQ);
        // secondshiftactualQ_P1Arr.push(data[i].secondshiftactualQ_P1);
        // nightshiftactualQ_P1Arr.push(data[i].nightshiftactualQ_P1);
       // console.log('nightshiftactualQ_P1Arr in else-->' + nightshiftactualQ_P1Arr);
      //Variant
       firstshiftactualQ_V1Arr.push(
        Number(
          Highcharts$.numberFormat(
            data[i] && data[i].variant && data[i].variant.firstshiftactualQ ? data[i].variant.firstshiftactualQ: '',
            Constants.DECIMAL_FORMAT.DECIMAL_NO
          )
        )
      );
      secondshiftactualQ_V1Arr.push(
        Number(
          Highcharts$.numberFormat(
            data[i] && data[i].variant && data[i].variant.secondshiftactualQ ? data[i].variant.secondshiftactualQ: '',
            Constants.DECIMAL_FORMAT.DECIMAL_NO
          )
        )
      );
      nightshiftactualQ_V1Arr.push(
        Number(
          Highcharts$.numberFormat(
            data[i] && data[i].variant && data[i].variant.nightshiftactualQ ? data[i].variant.nightshiftactualQ: '',
            Constants.DECIMAL_FORMAT.DECIMAL_NO
          )
        )
      );
      
      fourthshiftactualQ_V1Arr.push(
        Number(
          Highcharts$.numberFormat(
            data[i] && data[i].variant && data[i].variant.fourthshiftactualQ ? data[i].variant.fourthshiftactualQ: '',
            Constants.DECIMAL_FORMAT.DECIMAL_NO
          )
        )
      );

        //console.log('QsecondShiftArr in else-->' + QsecondShiftArr);
      } //end for loop   
    } else {
      let dataMap = this.getMapData(this.currentTimeRange, data);
      for (let key of Array.from(dataMap.keys())) {
        categoryArr.push(key);

        let mapData = dataMap.get(key);
        //
        actualQArr.push(mapData.get('actualQArr'));
        actualEArr.push(mapData.get('actualEArr'));
        actualEbyQArr.push(mapData.get('actualEbyQArr'));
        taragetEbyQArr.push(mapData.get('taragetEbyQArr'));
        //
        plannedQArr.push(mapData.get('plannedQArr'));
        EfirstShiftArr.push(mapData.get('EfirstShiftArr'));
        EsecondShiftArr.push(mapData.get('EsecondShiftArr'));
        EnightShiftArr.push(mapData.get('EnightShiftArr'));
        EfourthShiftArr.push(mapData.get('EfourthShiftArr'));
        QfirstShiftArr.push(mapData.get('QfirstShiftArr'));
        QsecondShiftArr.push(mapData.get('QsecondShiftArr'));
        QnightShiftArr.push(mapData.get('QnightShiftArr'));
        QfourthShiftArr.push(mapData.get('QfourthShiftArr'));

        actualQ_P0Arr.push(mapData.get('product.actualQ'));
        firstshiftactualQ_P1Arr.push(mapData.get('product.firstshiftactualQ'));
        secondshiftactualQ_P1Arr.push(mapData.get('product.secondshiftactualQ'));
        nightshiftactualQ_P1Arr.push(mapData.get('product.nightshiftactualQ'));
        fourthshiftactualQ_P1Arr.push(mapData.get('product.fourthshiftactualQ'));

        firstshiftactualQ_V1Arr.push(mapData.get('variant.firstshiftactualQ'));
        secondshiftactualQ_V1Arr.push(mapData.get('variant.secondshiftactualQ'));
        nightshiftactualQ_V1Arr.push(mapData.get('variant.nightshiftactualQ'));
        fourthshiftactualQ_V1Arr.push(mapData.get('variant.fourthshiftactualQ'));

        //console.log('the QfirstShiftArr-->' + QfirstShiftArr);
        //console.log('the QsecondShiftArr-->' + QsecondShiftArr);
      }
    }

    if (actualQArr.length == 0) {
      this.onOpenAlertBox('Please Enter Actual Quantity');
      this.hasChart = false;
    }

    this.liveEQAnalysisChartConfig = this.getAreaChartConfigOption();

    let fromDate = '';
    let toDate = '';
    if (data.length <= 0) {
      fromDate = this.startDate;
      toDate = this.endDate;
    } else {
      fromDate = Moment$(data[0].date).format(
        Constants.MOMENT_DATE_FORMAT.DATE_FORMAT
      );
      toDate = Moment$(data[data.length - 1].date).format(
        Constants.MOMENT_DATE_FORMAT.DATE_FORMAT
      );
    }
    // eslint-disable-next-line max-len
    this.liveEQAnalysisChartConfig.title.text = `Specific Energy E/Q Analysis from ${fromDate} to ${toDate} ${
      this.currentNode.nodeTitle === undefined
        ? ''
        : ' at ' + this.currentNode.nodeTitle
    }`;
    this.liveEQAnalysisChartConfig.xAxis.categories = categoryArr;
    // if(this.selectedProducts != 'all' && !this.selectedVariants){
    //   this.liveEQAnalysisChartConfig.plotOptions = {
    //     column: {
    //       stacking: 'normal'
    //     }
    //   };

    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Product_First Shift',
    //         firstshiftactualQ_P1Arr,
    //         'column',
    //         0,
    //         'partsProduced'
    //       )
    //     );
    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Product_Second Shift',
    //         secondshiftactualQ_P1Arr,
    //         'column',
    //         0,
    //         'partsProduced'
    //       )
    //     );
    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Product_Night Shift',
    //         nightshiftactualQ_P1Arr,
    //         'column',
    //         0,
    //         'partsProduced'
    //       )
    //     );
    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Product_Forth Shift',
    //         fourthshiftactualQ_P1Arr,
    //         'column',
    //         0,
    //         'partsProduced'
    //       )
    //     );

    //     if (
    //       this.siteId == 'BoscBang56001170' ||
    //       this.siteId == 'RBEIBang56002629'
    //     ) {
    //       this.liveEQAnalysisChartConfig.series.push(
    //         this.initSerie(
    //           'PC_Fourth Shift',
    //           QfourthShiftArr,
    //           'column',
    //           0,
    //           'partsProduced'
    //         )
    //       );
    //     }
    //   }
    //   if (
    //     [this.DISPLAY_ALL, this.DISPLAY_ENERGY].includes(
    //       this.currentDisplayItem + ''
    //     )
    //   ) {
    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Energy_First Shift',
    //         EfirstShiftArr,
    //         'column',
    //         1,
    //         'energy'
    //       )
    //     );
    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Energy_Second Shift',
    //         EsecondShiftArr,
    //         'column',
    //         1,
    //         'energy'
    //       )
    //     );
    //     this.liveEQAnalysisChartConfig.series.push(
    //       this.initSerie(
    //         'Energy_Night Shift',
    //         EnightShiftArr,
    //         'column',
    //         1,
    //         'energy'
    //       )
    //     );
    //     if (
    //       this.siteId == 'BoscBang56001170' ||
    //       this.siteId == 'RBEIBang56002629'
    //     ) {
    //       this.liveEQAnalysisChartConfig.series.push(
    //         this.initSerie(
    //           'Energy_Fourth Shift',
    //           EfourthShiftArr,
    //           'column',
    //           1,
    //           'energy'
    //         )
    //       );
    //     }
    //   }
    //   // if (
    //   //   [this.DISPLAY_ALL, this.DISPLAY_TARGET].includes(
    //   //     this.currentDisplayItem + ''
    //   //   )
    //   // ) {
    //   //   this.liveEQAnalysisChartConfig.series.push(
    //   //     this.initSerie('Actual kWh/PC', actualEbyQArr, ' ', 2)
    //   //   );
    //   //   this.liveEQAnalysisChartConfig.series.push(
    //   //     this.initSrie('Target kWh/PC', taragetEbyQArr, 'spline', 2)
    //   //   );
    //   // }

    // }
    if(this.selectedVariants != null){
        this.liveEQAnalysisChartConfig.plotOptions = {
          column: {
            stacking: 'normal'
          }
        };

        if (
          [this.DISPLAY_ALL, this.DISPLAY_PRODUCTION].includes(
            this.currentDisplayItem + ''
          )
        ) {

          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Variant_First Shift',
              firstshiftactualQ_V1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Variant_Second Shift',
              secondshiftactualQ_V1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Variant_Night Shift',
              nightshiftactualQ_V1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Variant_Forth Shift',
              fourthshiftactualQ_V1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          
        if (
          this.siteId == 'BoscBang56001170' ||
          this.siteId == 'RBEIBang56002629'
        ) {
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'PC_Fourth Shift',
              QfourthShiftArr,
              'column',
              0,
              'partsProduced'
            )
          );
        }
      }
      if (
        [this.DISPLAY_ALL, this.DISPLAY_ENERGY].includes(
          this.currentDisplayItem + ''
        )
      ) {
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Energy_First Shift',
            EfirstShiftArr,
            'column',
            1,
            'energy'
          )
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Energy_Second Shift',
            EsecondShiftArr,
            'column',
            1,
            'energy'
          )
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Energy_Night Shift',
            EnightShiftArr,
            'column',
            1,
            'energy'
          )
        );
        if (
          this.siteId == 'BoscBang56001170' ||
          this.siteId == 'RBEIBang56002629'
        ) {
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Energy_Fourth Shift',
              EfourthShiftArr,
              'column',
              1,
              'energy'
            )
          );
        }
      }
    }
    if (this.useShiftwise === 'yes') {
      this.liveEQAnalysisChartConfig.plotOptions = {
        column: {
          stacking: 'normal'
        }
      };

      if (
        [this.DISPLAY_ALL, this.DISPLAY_PRODUCTION].includes(
          this.currentDisplayItem + ''
        )
      ) {
        //console.log('display prod');
        //console.log('QfirstShiftArr here-->' + QfirstShiftArr);
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'PC_First Shift',
            QfirstShiftArr,
            'column',
            0,
            'partsProduced'
          )
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'PC_Second Shift',
            QsecondShiftArr,
            'column',
            0,
            'partsProduced'
          )
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'PC_Night Shift',
            QnightShiftArr,
            'column',
            0,
            'partsProduced'
          )
        );
        if (
          this.siteId == 'BoscBang56001170' ||
          this.siteId == 'RBEIBang56002629'
        ) {
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'PC_Fourth Shift',
              QfourthShiftArr,
              'column',
              0,
              'partsProduced'
            )
          );
        }
               
        if (this.selectedProducts != 'all' && !this.selectedVariants){

          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Product_First Shift',
              firstshiftactualQ_P1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Product_Second Shift',
              secondshiftactualQ_P1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Product_Night Shift',
              nightshiftactualQ_P1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Product_Forth Shift',
              fourthshiftactualQ_P1Arr,
              'column',
              0,
              'partsProduced'
            )
          );
        }
      }
      if (
        [this.DISPLAY_ALL, this.DISPLAY_ENERGY].includes(
          this.currentDisplayItem + ''
        )
      ) {
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Energy_First Shift',
            EfirstShiftArr,
            'column',
            1,
            'energy'
          )
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Energy_Second Shift',
            EsecondShiftArr,
            'column',
            1,
            'energy'
          )
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Energy_Night Shift',
            EnightShiftArr,
            'column',
            1,
            'energy'
          )
        );
        if (
          this.siteId == 'BoscBang56001170' ||
          this.siteId == 'RBEIBang56002629'
        ) {
          this.liveEQAnalysisChartConfig.series.push(
            this.initSerie(
              'Energy_Fourth Shift',
              EfourthShiftArr,
              'column',
              1,
              'energy'
            )
          );
        }
      }
      if (
        [this.DISPLAY_ALL, this.DISPLAY_TARGET].includes(
          this.currentDisplayItem + ''
        )
      ) {
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie('Actual kWh/PC', actualEbyQArr, 'spline', 2)
        );
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie('Target kWh/PC', taragetEbyQArr, 'spline', 2)
        );
      }
    } 
    if(this.useShiftwise === 'no' ){
      // Total No of pcs produced in day (Q)
      if (
        [this.DISPLAY_ALL, this.DISPLAY_PRODUCTION].includes(
          this.currentDisplayItem + ''
        ) && this.selectedProducts == 'all' 
      ) {
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Actual daily(parts produced)',
            actualQArr,
            'column',
            0,
            'parts'
          )
        );
          }
        if (
          [this.DISPLAY_ALL,this.DISPLAY_PRODUCTION].includes(
            this.currentDisplayItem + ''
          ) && this.selectedProducts != 'all'

        ) {
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie(
            'Product_Actual',
            actualQ_P0Arr,
            'column',
            0,
            'partsProduced'
          )
        );
      }
      // Energy used (E)
      if (
        [this.DISPLAY_ALL, this.DISPLAY_ENERGY].includes(
          this.currentDisplayItem + ''
        )
      ) {
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie('kWh/Day', actualEArr, 'column', 1, 'energy')
        );
      }
      if (
        [this.DISPLAY_ALL, this.DISPLAY_TARGET].includes(
          this.currentDisplayItem + ''
        )
      ) {
        // Actual E/Q
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie('Actual kWh/PC', actualEbyQArr, 'spline', 2)
        );
        // Target
        this.liveEQAnalysisChartConfig.series.push(
          this.initSerie('Target kWh/PC', taragetEbyQArr, 'spline', 2)
        );
      }
    }
    this.columnchart = new Chart(this.liveEQAnalysisChartConfig);

  }

  private initSerie(
    name: String,
    data: any,
    type: String,
    yAxisIndex: number,
    stack?: any
  ) {
    return {
      name: name,
      showInLegend: true,
      data: data,
      type: type,
      stack: stack,
      tooltip: {
        valueSuffix: ''
      },
      yAxis: yAxisIndex
    };
  }

  onShiftwiseChanged(event: any) {
    this.drawChart();
  }

  onDisplaysClick(targetItem) {
    this.currentDisplayItem = targetItem;
    this.drawChart();
  }

  private resetData() {
    // Reset data when node changed
    this.currentData = undefined;
    this.currentDisplayItem = this.DISPLAY_ALL;
    this.useShiftwise = 'no';
    this.currentSuccessPercent = 0;
    this.currentSuccessMessage = '';
    this.currentTimeRange = this.TIME_RANGE_DAILY;
    this.selectedProducts = 'all';
    this.hasChart = false;
  }

  onTimeRangeChanged(event: any) {
     // this.resetData(); 
    this.drawChart();
  }

  onClearButtonClicked() {
    this.resetData();
    this.processDataAndDrawChart();
  }

  productSelectclick(event: any) {
    if(event && event.value){
      this.selectedProducts = event.value;

    } else {
      this.selectedProducts = null;
    }
    this.treeform.get('variant').reset();
    this.variantModel.product = this.selectedProducts;
    this.energyService
    .getVariantsForEbyQ(this.variantModel)
    .subscribe((data) => {
      this.variantList = data;
    });        
 }
 variantSelectclick(event: any) {
  if(event && event.value){
    this.selectedVariants = event.value;
  } else {
    this.selectedVariants = null;
  }

}

  drawProductChart(){
    this.isVarient = false;
    this.treeform.get('variant').reset();
    if(this.selectedProducts == 'all'){
      this.resetData();
    }
    this.processDataAndDrawChart();
  }
  drawVariantChart(){
    this.isVarient = true;
    if(this.selectedVariants == 'all'){
      this.resetData();
    }
    this.processDataAndDrawChart();

  }
  private y2k(number) {
    return number < 1000 ? number + 1900 : number;
  }

  private getWeek(year, month, day) {
    var when = new Date(year, month, day);
    var newYear = new Date(year, 0, 1);
    var offset = 7 + 1 - newYear.getDay();
    if (offset == 8) offset = 1;
    var daynum =
      (Date.UTC(this.y2k(year), when.getMonth(), when.getDate(), 0, 0, 0) -
        Date.UTC(this.y2k(year), 0, 1, 0, 0, 0)) /
        1000 /
        60 /
        60 /
        24 +
      1;
    var weeknum = Math.floor((daynum - offset + 7) / 7);
    if (weeknum == 0) {
      year--;
      var prevNewYear = new Date(year, 0, 1);
      var prevOffset = 7 + 1 - prevNewYear.getDay();
      if (prevOffset == 2 || prevOffset == 8) weeknum = 53;
      else weeknum = 52;
    }
    return weeknum;
  }

  private getNumber(numb: any): number {
    if (numb && !isNaN(numb)) {
      return Number(numb);
    } else {
      return 0;
    }
  }

  private getMapData(type: String, data: any) {
    let dataMap = new Map();
    for (var i = 0; i < data.length; i++) {
      let theDate = new Date(data[i].date);
      let dataKey = '';
      if (type === this.TIME_RANGE_WEEKLY) {
        dataKey =
          'Week ' +
          this.getWeek(
            this.y2k(theDate.getFullYear()),
            theDate.getMonth(),
            theDate.getDate()
          ).toString();
      }
      if (type === this.TIME_RANGE_MONTHLY) {
        dataKey =
          this.MONTHS_LIST[theDate.getMonth()].toString() +
          ' ' +
          theDate.getFullYear();
      }
      if (type === this.TIME_RANGE_YEARLY) {
        dataKey = theDate.getFullYear().toString();
      }
      let specificDataMap = new Map();
      if (dataMap.has(dataKey)) {
        specificDataMap = dataMap.get(dataKey);
      }
      // Process data for dataMap
      specificDataMap.set(
        'actualQArr',
        this.getNumber(specificDataMap.get('actualQArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].actualQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'actualEArr',
        this.getNumber(specificDataMap.get('actualEArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].actualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'actualEbyQArr',
        this.getNumber(specificDataMap.get('actualEbyQArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].actualEbyQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'taragetEbyQArr',
        this.getNumber(specificDataMap.get('taragetEbyQArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].plannedEbyQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      //
      specificDataMap.set(
        'plannedQArr',
        this.getNumber(specificDataMap.get('plannedQArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].plannedQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'EfirstShiftArr',
        this.getNumber(specificDataMap.get('EfirstShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].firstshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'EsecondShiftArr',
        this.getNumber(specificDataMap.get('EsecondShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].secondshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'EnightShiftArr',
        this.getNumber(specificDataMap.get('EnightShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].nightshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'EfourthShiftArr',
        this.getNumber(specificDataMap.get('EfourthShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].fourthshiftactualE,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'actualQ_P0Arr',
        this.getNumber(specificDataMap.get('actualQ_P1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.actualQ ? data[i].product.actualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );

      specificDataMap.set(
        'firstshiftactualQ_P1Arr',
        this.getNumber(specificDataMap.get('firstshiftactualQ_P1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.firstshiftactualQ ? data[i].product.firstshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'secondshiftactualQ_P1Arr',
        this.getNumber(specificDataMap.get('secondshiftactualQ_P1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.secondshiftactualQ ? data[i].product.secondshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'nightshiftactualQ_P1Arr',
        this.getNumber(specificDataMap.get('nightshiftactualQ_P1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.nightshiftactualQ ? data[i].product.nightshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'fourthshiftactualQ_P1Arr',
        this.getNumber(specificDataMap.get('fourthshiftactualQ_P1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.fourthshiftactualQ ? data[i].product.fourthshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );

      //variant
      specificDataMap.set(
        'firstshiftactualQ_V1Arr',
        this.getNumber(specificDataMap.get('firstshiftactualQ_V1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.firstshiftactualQ ? data[i].product.firstshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'secondshiftactualQ_V1Arr',
        this.getNumber(specificDataMap.get('secondshiftactualQ_V1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.secondshiftactualQ ? data[i].product.secondshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'nightshiftactualQ_V1Arr',
        this.getNumber(specificDataMap.get('nightshiftactualQ_V1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.nightshiftactualQ ? data[i].product.nightshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'fourthshiftactualQ_V1Arr',
        this.getNumber(specificDataMap.get('fourthshiftactualQ_V1Arr')) +
          Number(
            Highcharts$.numberFormat(
              data[i] && data[i].product && data[i].product.fourthshiftactualQ ? data[i].product.fourthshiftactualQ: '',
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );


      specificDataMap.set(
        'QfirstShiftArr',
        this.getNumber(specificDataMap.get('QfirstShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].firstshiftactualQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'QsecondShiftArr',
        this.getNumber(specificDataMap.get('QsecondShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].secondshiftactualQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'QnightShiftArr',
        this.getNumber(specificDataMap.get('QnightShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].nightshiftactualQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );
      specificDataMap.set(
        'QfourthShiftArr',
        this.getNumber(specificDataMap.get('QfourthShiftArr')) +
          Number(
            Highcharts$.numberFormat(
              data[i].fourthshiftactualQ,
              Constants.DECIMAL_FORMAT.DECIMAL_NO
            )
          )
      );

      // Update to weekMap
      dataMap.set(dataKey, specificDataMap);
    }

    return dataMap;
  }
  // Real Time E/Q dialog
  openRealTimeDialog(){
    const dialogRef = this.dialog.open(RealTimeEbyQModal, {
      width: '90%',
      maxHeight: '840px',
      data :{
        'meterIds': this.currentNode.metersId,
        'kpi': "Energy",
        'startDate':this.startDate, 
        'endDate': this.endDate, 
        'siteId': this.siteId, 
        'nodeTitle': this.currentNode.nodeData.title,
        'nodeId': this.currentNode.loadId,
        'nodeType': this.currentNode.nodeType
      }
    });
    // dialogRef.componentInstance.privacyMessage = data;
    dialogRef.afterClosed().subscribe((data) => {
    console.log(data);
    });
  }

  // Real Time E/Q Target dialog
  openEbyQtargetDialog(){
    let modal={
      'meterIds': this.currentNode.metersId,
      'kpi': "Energy",
      'startDate':this.startDate, 
      'endDate': this.endDate, 
      'siteId': this.siteId, 
      'nodeTitle': this.currentNode.nodeData.title,
      'nodeId': this.currentNode.loadId,
      'nodeType': this.currentNode.nodeType

    }
    console.log(modal)
    const dialogRef = this.dialog.open(RealTimeEbyQTargetModal, {
      width: '100%',
      maxHeight: '100vh',
      data :modal
    });
    // dialogRef.componentInstance.privacyMessage = data;
    dialogRef.afterClosed().subscribe((data) => {
    console.log(data);
    });
  }
  getTreeDetails(event){
    this.treeRadioControl = event.value;
    console.log("getTreeDetails",this.treeRadioControl)
  }

  
}
