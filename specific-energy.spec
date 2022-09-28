import { DatePipe } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PlantServiceService, EnergyService, SiteService, CommonService } from '../../../../services/index';
import { By } from "@angular/platform-browser";
import { of } from 'rxjs';
import { css } from 'highcharts';
import { RouterTestingModule } from '@angular/router/testing'; 
import { Chart, ChartModule } from 'angular-highcharts';
import { SpecificEnergyComponent } from './specific-energy.component';
import { DataService } from '../../../../services/data.service';
import { WarningDialog } from '../../../../shared/index';
class MockSiteService {
  siteId = 'JAPBOSCH30201064';
  treeDetails = {
    comparisonTreeData: ' ',
    genericTreeData: [{ id: 2, title: 'Flow1' }],
    loadONTreeData: [{ title: 'BOSCH ETC', id: 77 }],
    rId: null,
    treeData:
      '[{"id":173,"title":"BOSCH TCI ETC","nodes":[{"id":174,"title":"Test Cell 002/Vibration Lab","nodes":[{"id":175,"title":"3D Random-1","nodes":[],"meterRId":"#124:334","loadRId":"#71:336","meterId":"201","loadId":"makTurning2576","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"3D Random-1","$$hashKey":"object:38080","index":0,"processId":"NA"},{"id":176,"title":"3D Random-2","nodes":[],"meterRId":"#680:320","loadRId":"#482:326","meterId":"202","loadId":"makTurning2577","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"3D Random-2","$$hashKey":"object:38081","index":1,"processId":"NA"}],"processRId":"#49:97","nodeType":"PROCESS","$$hashKey":"object:38070","index":0,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":177,"title":"R105","nodes":[{"id":178,"title":"Metallurigical Lab","nodes":[],"meterRId":"#124:342","loadRId":"#482:333","meterId":"225","loadId":"makTurning2599","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"Metallurigical Lab","$$hashKey":"object:38115","index":0,"processId":"NA"}],"processRId":"#49:99","nodeType":"PROCESS","$$hashKey":"object:38105","index":1,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":179,"title":"R 106/Climatic Lab","nodes":[{"id":180,"title":"Water Spray Bench","nodes":[],"meterRId":"#680:321","loadRId":"#71:337","meterId":"205","loadId":"makTurning2579","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"Water Spray Bench","$$hashKey":"object:38142","index":0,"processId":"NA"},{"id":181,"title":"R106-Exhaust","nodes":[],"meterRId":"#680:322","loadRId":"#71:338","meterId":"208","loadId":"makTurning2582","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R106-Exhaust","$$hashKey":"object:38143","index":1,"processId":"NA"},{"id":182,"title":"R 106 Chiller","nodes":[],"meterRId":"#684:319","loadRId":"#482:327","meterId":"206","loadId":"makThermal2580","kwRating":0,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"R 106 Chiller","$$hashKey":"object:38144","index":2,"processId":"NA"},{"id":183,"title":"Explosion Roof Chamber - new","nodes":[],"meterRId":"#684:318","loadRId":"#857:319","meterId":"203","loadId":"makTurning2575","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"Explosion Roof Chamber - new","$$hashKey":"object:38145","index":3,"processId":"NA"},{"id":184,"title":"Explosion Roof Chamber - old","nodes":[],"meterRId":"#124:335","loadRId":"#857:320","meterId":"204","loadId":"makTurning2578","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"Explosion Roof Chamber - old","$$hashKey":"object:38146","index":4,"processId":"NA"},{"id":185,"title":"R106-Blower","nodes":[],"meterRId":"#124:336","loadRId":"#857:321","meterId":"207","loadId":"makTurning2581","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R106-Blower","$$hashKey":"object:38147","index":5,"processId":"NA"}],"processRId":"#567:89","nodeType":"PROCESS","$$hashKey":"object:38132","index":2,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":186,"title":"R 107/Glow Plug Endurance Test  Bench","nodes":[{"id":187,"title":"Glow Plug Endurance Test Bench","nodes":[],"meterRId":"#684:321","loadRId":"#482:328","meterId":"209","loadId":"makTurning2583","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"Glow Plug Endurance Test Bench","$$hashKey":"object:38197","index":0,"processId":"NA"}],"processRId":"#835:84","nodeType":"PROCESS","$$hashKey":"object:38187","index":3,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":188,"title":"R 113","nodes":[{"id":189,"title":"Endurance Bench Chiller","nodes":[],"meterRId":"#124:189","loadRId":"#482:236","meterId":"216","loadId":"makThermal2590","kwRating":0,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"Endurance Bench Chiller","$$hashKey":"object:7048","index":0,"processId":"NA"},{"id":190,"title":"R113-Blower","nodes":[],"meterRId":"#680:240","loadRId":"#482:285","meterId":"217","loadId":"makTurning2591","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R113-Blower","$$hashKey":"object:7049","index":1,"processId":"NA"},{"id":191,"title":"R113-Exhaust","nodes":[],"meterRId":"#680:137","loadRId":"#857:34","meterId":"218","loadId":"makTurning2592","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R113-Exhaust","$$hashKey":"object:7050","index":2,"processId":"NA"},{"id":192,"title":"913M","nodes":[],"meterRId":"#124:87","loadRId":"#857:134","meterId":"214","loadId":"makTurning2588","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"913M","$$hashKey":"object:7051","index":3,"processId":"NA"},{"id":193,"title":"PFCRS Endurance Bench","nodes":[],"meterRId":"#684:443","loadRId":"#857:335","meterId":"215","loadId":"makTurning2589","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"PFCRS Endurance Bench","$$hashKey":"object:7052","index":4,"processId":"NA"}],"processRId":"#49:56","nodeType":"PROCESS","$$hashKey":"object:7038","index":4,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":194,"title":"R 114/Endurance Test Bench","nodes":[{"id":195,"title":"R114-Blower","nodes":[],"meterRId":"#684:320","loadRId":"#71:339","meterId":"212","loadId":"makTurning2586","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R114-Blower","$$hashKey":"object:38265","index":0,"processId":"NA"},{"id":196,"title":"R114-Exhaust","nodes":[],"meterRId":"#124:338","loadRId":"#482:329","meterId":"213","loadId":"makTurning2587","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R114-Exhaust","$$hashKey":"object:38266","index":1,"processId":"NA"},{"id":197,"title":"ATMO7 Test Bench","nodes":[],"meterRId":"#680:323","loadRId":"#857:322","meterId":"210","loadId":"makTurning2584","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO7 Test Bench","$$hashKey":"object:38267","index":2,"processId":"NA"},{"id":198,"title":"ATMO7 Chiller","nodes":[],"meterRId":"#124:337","loadRId":"#857:323","meterId":"211","loadId":"makThermal2585","kwRating":0,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO7 Chiller","$$hashKey":"object:38268","index":3,"processId":"NA"}],"processRId":"#49:98","nodeType":"PROCESS","$$hashKey":"object:38255","index":5,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":199,"title":"R 115/Sinusoidal Vibration Lab","nodes":[{"id":200,"title":"89 kN Vibration Machine Supply & Heat exchanger","nodes":[],"meterRId":"#684:324","loadRId":"#71:342","meterId":"221","loadId":"makTurning2595","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"89 kN Vibration Machine Supply & Heat exchanger","$$hashKey":"object:38302","index":0,"processId":"NA"},{"id":201,"title":"R115-Exhaust","nodes":[],"meterRId":"#684:325","loadRId":"#71:343","meterId":"224","loadId":"makTurning2598","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R115-Exhaust","$$hashKey":"object:38303","index":1,"processId":"NA"},{"id":202,"title":"Climatic Chamber","nodes":[],"meterRId":"#124:340","loadRId":"#482:331","meterId":"219","loadId":"makTurning2593","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Mains","nodeType":"LOAD","loadName":"Climatic Chamber","$$hashKey":"object:38304","index":2,"processId":"NA"},{"id":203,"title":"45 kN Vibration Machine","nodes":[],"meterRId":"#124:341","loadRId":"#482:332","meterId":"222","loadId":"makTurning2596","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"45 kN Vibration Machine","$$hashKey":"object:38305","index":3,"processId":"NA"},{"id":204,"title":"89 kN Vibration Machine Amplifier","nodes":[],"meterRId":"#680:326","loadRId":"#857:326","meterId":"220","loadId":"makTurning2594","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"89 kN Vibration Machine Amplifier","$$hashKey":"object:38306","index":4,"processId":"NA"},{"id":205,"title":"R115-Blower","nodes":[],"meterRId":"#680:327","loadRId":"#857:327","meterId":"223","loadId":"makTurning2597","kwRating":0,"type":"Turning","subType":"ThreePhase","meterRole":"Load","nodeType":"LOAD","loadName":"R115-Blower","$$hashKey":"object:38307","index":5,"processId":"NA"}],"processRId":"#835:85","nodeType":"PROCESS","$$hashKey":"object:38292","index":6,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":206,"title":"Test Cell 109","nodes":[{"id":207,"title":"ATMO_5 Chiller","nodes":[],"meterRId":"#684:34","loadRId":"#71:28","meterId":"107","loadId":"MakThermal1300","kwRating":10,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_5 Chiller","$$hashKey":"object:7094","index":0,"processId":"NA"},{"id":208,"title":"ATMO_5 Machine supply","nodes":[],"meterRId":"#680:50","loadRId":"#71:493","meterId":"103","loadId":"MakTurning3024","kwRating":50,"type":"Turning","subType":"Generic Load","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_5 Machine supply","$$hashKey":"object:7095","index":1,"processId":"NA"},{"id":209,"title":"109_Blower","nodes":[],"meterRId":"#124:52","loadRId":"#482:29","meterId":"118","loadId":"MakThermal1315","kwRating":5.5,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"109_Blower","$$hashKey":"object:7096","index":2,"processId":"NA"},{"id":210,"title":"ATMO_4 Chiller","nodes":[],"meterRId":"#684:42","loadRId":"#857:30","meterId":"108","loadId":"MakThermal1298","kwRating":10,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_4 Chiller","$$hashKey":"object:7097","index":3,"processId":"NA"},{"id":211,"title":"109_Exhaust","nodes":[],"meterRId":"#124:36","loadRId":"#857:32","meterId":"119","loadId":"MakThermal1316","kwRating":5.5,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"109_Exhaust","$$hashKey":"object:7098","index":4,"processId":"NA"},{"id":212,"title":"ATMO_4 Machine supply","nodes":[],"meterRId":"#680:34","loadRId":"#857:461","meterId":"104","loadId":"MakTurning3023","kwRating":50,"type":"Turning","subType":"Generic Load","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_4 Machine supply","$$hashKey":"object:7099","index":5,"processId":"NA"}],"processRId":"#567:33","nodeType":"PROCESS","$$hashKey":"object:7084","index":7,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":213,"title":"Test Cell 111","nodes":[{"id":214,"title":"111_Blower","nodes":[],"meterRId":"#684:51","loadRId":"#71:29","meterId":"115","loadId":"MakThermal1312","kwRating":9.3,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"111_Blower","$$hashKey":"object:7021","index":0,"processId":"NA"},{"id":215,"title":"ATMO_2 Chiller","nodes":[],"meterRId":"#684:50","loadRId":"#71:34","meterId":"106","loadId":"MakThermal1302","kwRating":10,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_2 Chiller","$$hashKey":"object:7022","index":1,"processId":"NA"},{"id":216,"title":"ATMO_2 Machine supply","nodes":[],"meterRId":"#124:34","loadRId":"#71:492","meterId":"101","loadId":"MakTurning3021","kwRating":50,"type":"Turning","subType":"Generic Load","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_2 Machine supply","$$hashKey":"object:7023","index":2,"processId":"NA"},{"id":217,"title":"ATMO_3 Chiller","nodes":[],"meterRId":"#680:42","loadRId":"#482:31","meterId":"105","loadId":"MakThermal1304","kwRating":10,"type":"Thermal","subType":"Heating","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_3 Chiller","$$hashKey":"object:7024","index":3,"processId":"NA"},{"id":218,"title":"111_Exhaust 1","nodes":[],"meterRId":"#684:35","loadRId":"#482:32","meterId":"116","loadId":"MakThermal1313","kwRating":3.7,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"111_Exhaust 1","$$hashKey":"object:7025","index":4,"processId":"NA"},{"id":219,"title":"111_Exhaust 2","nodes":[],"meterRId":"#684:43","loadRId":"#482:35","meterId":"117","loadId":"MakThermal1314","kwRating":3.7,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"111_Exhaust 2","$$hashKey":"object:7026","index":5,"processId":"NA"},{"id":220,"title":"ATMO_3 Machine supply","nodes":[],"meterRId":"#124:42","loadRId":"#482:468","meterId":"102","loadId":"MakTurning3022","kwRating":50,"type":"Turning","subType":"Generic Load","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_3 Machine supply","$$hashKey":"object:7027","index":6,"processId":"NA"}],"processRId":"#567:32","nodeType":"PROCESS","$$hashKey":"object:7011","index":8,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":221,"title":"Test Cell 112","nodes":[{"id":222,"title":"112_Blower","nodes":[],"meterRId":"#680:35","loadRId":"#71:32","meterId":"113","loadId":"MakThermal1310","kwRating":11,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"112_Blower","$$hashKey":"object:7161","index":0,"processId":"NA"},{"id":223,"title":"112_Exhaust","nodes":[],"meterRId":"#680:43","loadRId":"#71:35","meterId":"114","loadId":"MakThermal1311","kwRating":9.3,"type":"Thermal","subType":"AHU","meterRole":"Load","nodeType":"LOAD","loadName":"112_Exhaust","$$hashKey":"object:7162","index":1,"processId":"NA"},{"id":224,"title":"ATMO_8 Machine supply","nodes":[],"meterRId":"#680:51","loadRId":"#482:469","meterId":"112","loadId":"MakTurning3027","kwRating":60,"type":"Turning","subType":"Generic Load","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_8 Machine supply","$$hashKey":"object:7163","index":2,"processId":"NA"},{"id":225,"title":"ATMO_1 Chiller","nodes":[],"meterRId":"#124:51","loadRId":"#857:28","meterId":"109","loadId":"MakThermal1306","kwRating":10,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_1 Chiller","$$hashKey":"object:7164","index":3,"processId":"NA"},{"id":226,"title":"ATMO_8 Chiller","nodes":[],"meterRId":"#124:35","loadRId":"#857:34","meterId":"110","loadId":"MakThermal1308","kwRating":10,"type":"Thermal","subType":"ChillerPlant","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_8 Chiller","$$hashKey":"object:7165","index":4,"processId":"NA"},{"id":227,"title":"ATMO_1 Machine supply","nodes":[],"meterRId":"#124:43","loadRId":"#857:460","meterId":"111","loadId":"makTurning3020","kwRating":50,"type":"Turning","subType":"Generic Load","meterRole":"Load","nodeType":"LOAD","loadName":"ATMO_1 Machine supply","$$hashKey":"object:7166","index":5,"processId":"NA"}],"processRId":"#49:34","nodeType":"PROCESS","$$hashKey":"object:7151","index":9,"processId":"NA","meterId":"NA","loadId":"NA"},{"id":228,"title":"テスト","nodes":[{"id":229,"title":"稲妻","nodes":[{"id":230,"title":"送風機","nodes":[],"processId":"process_44","meterId":"121","loadId":"w1eLighting3375","kwRating":1,"type":"Lighting","subType":"SodiumVapour","meterRole":"DG","nodeType":"LOAD","loadName":"送風機","index":0},{"id":231,"title":"ボイラー","nodes":[],"processId":"process_44","meterId":"1","loadId":"132Thermal3373","kwRating":1,"type":"Thermal","subType":"HVAC","meterRole":"Load","nodeType":"LOAD","loadName":"ボイラー","index":1},{"id":232,"title":"洗濯機","nodes":[],"processId":"process_44","meterId":"21","loadId":"e2eSwitching3376","kwRating":2,"type":"Switching","subType":"PC","meterRole":"UPS","nodeType":"LOAD","loadName":"洗濯機","index":2},{"id":233,"title":"ヒーター","nodes":[],"processId":"process_44","meterId":"1","loadId":"rq3Turning3374","kwRating":3,"type":"Turning","subType":"SinglePhase","meterRole":"DG","nodeType":"LOAD","loadName":"ヒーター","index":3}],"processId":"process_44","meterId":"NA","nodeType":"PROCESS","loadId":"NA","showInVertical":false,"parameters":[],"index":0},{"id":234,"title":"エアコン","nodes":[{"id":235,"title":"ヒーター_1","nodes":[],"processId":"process_45","meterId":"213","loadId":"22eThermal3378","kwRating":2,"type":"Thermal","subType":"HVAC","meterRole":"DG","nodeType":"LOAD","loadName":"ヒーター_1","index":0},{"id":237,"title":"ボイラー_1","nodes":[],"processId":"process_45","meterId":"23","loadId":"dqwThermal3377","kwRating":2,"type":"Thermal","subType":"AHU","meterRole":"DG","nodeType":"LOAD","loadName":"ボイラー_1","index":2},{"id":238,"title":"洗濯機_1","nodes":[],"processId":"process_45","meterId":"32","loadId":"2edTurning3380","kwRating":2,"type":"Turning","subType":"SinglePhase","meterRole":"Load","nodeType":"LOAD","loadName":"洗濯機_1","index":3}],"processId":"process_45","meterId":"NA","nodeType":"PROCESS","loadId":"NA","showInVertical":false,"parameters":[],"index":1}],"processId":"NA","meterId":"NA","nodeType":"TEXT","loadId":"NA","showInVertical":false,"parameters":[],"dashboardTitle":"","index":10}],"nodeType":"TEXT","$$hashKey":"object:5962","processId":"NA","meterId":"NA","loadId":"NA"}]',
    waterLoadOnTreeData: ' ',
    waterTreeData: ' '
  };

  getTreeConfiguration(siteId) {
    return of(this.treeDetails);
  }
}

class MockService {
  siteId = 'JAPBOSCH30201064';
  shiftsBySiteId = [
    {
      shiftEnd: 116999000,
      shiftId: 1,
      shiftName: 'First Shift',
      shiftStart: 2680200000
    },
    {
      shiftEnd: 59399000,
      shiftId: 2,
      shiftName: 'Second Shift',
      shiftStart: 30600000
    }
  ];
  getShiftsBySiteId(siteID) {
    return of(this.shiftsBySiteId);
  }
}

class MockEnergyService {
  siteId = 'JAPBOSCH30201064';
  startDate = '2022-01-05';
  endDate = '2022-01-05';
  meterId = 201;
   metersId = 201;
  loadId = 'makTurning2576';
  product = '123';

  getShiftsBySiteId(siteID, startDate, endDate, meterId, loadId) {
    return of({});
  }
  getProductsBySiteId(siteID,loadId){
    return of(['123','1111','22']);
  }
  getVariantsForEbyQ(siteID,loadId, product){
    return of(['1223','1121','212']);

  }
  params = {
    siteId: this.siteId,
    //     "startDate":"2022-03-05",
    //     "endDate":"2022-03-06"          
    startDate: this.startDate,
    // startDate: '2018-03-28',
    endDate: this.endDate,
    // endDate: '2018-04-29',
    meterIds: this.metersId,
    // meterIds: ['719'],
    nodeId: this.loadId,
    // loadId: 'MakHeating1143',
    nodeType: 'site',
    product: 'all',
    shift: null,
    kpi: "Energy"
  };

  fetchDataForEbyQAnalysis(params){
    return of({
      "result": [
        {
          "date": "2022-03-13",
          "nightshiftactualQ_P1": 10,
          "plannedQ": 33,
          "actualQ": 11,
          "actualEbyQ": 12,
          "firstshiftactualQ_P1": 34,
          "secondshiftactualQ_P1": 21,
          "secondshiftactualE": 21,
          "actualE": 2.04,
          "nightshiftactualE": 2.04,
          "firstshiftactualE": 3,
          "plannedEbyQ": 1,
        "nightshiftactualQ_v1": 3,
          "firstshiftactualQ_v1": 22,
          "secondshiftactualQ_v1": 31,  
        },
        {
          "date": "2022-03-13",
          "nightshiftactualQ_P1": 10,
          "plannedQ": 33,
          "actualQ": 11,
          "actualEbyQ": 12,
          "firstshiftactualQ_P1": 34,
          "secondshiftactualQ_P1": 21,
          "secondshiftactualE": 21,
          "actualE": 2.04,
          "nightshiftactualE": 2.04,
          "firstshiftactualE": 3,
          "plannedEbyQ": 1,
        "nightshiftactualQ_v1": 3,
          "firstshiftactualQ_v1": 22,
          "secondshiftactualQ_v1": 31,  
        },],
      "dataPointList": []
      } );

  }
}

describe('SpecificEnergyComponent', () => {
  let component: SpecificEnergyComponent;
  let fixture: ComponentFixture<SpecificEnergyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatTableModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatCardModule,
        MatListModule,
        MatExpansionModule,
        MatSidenavModule,
        MatPaginatorModule,
        MatMenuModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatCardModule,
        MatListModule,
        MatTooltipModule,
        RouterTestingModule,
        ChartModule,
        NgxDaterangepickerMd.forRoot(),
        MatDialogModule
      ],
      providers: [
        DataService,
        CommonService,
        DatePipe,
        { provide: SiteService, useClass: MockSiteService },
        { provide: PlantServiceService, useClass: MockService },
        { provide: EnergyService, useClass: MockEnergyService },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      declarations: [SpecificEnergyComponent, WarningDialog]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('shold be call featureItemSelectionToggle()  method', ()=>{
  //   spyOn(component, 'featureItemSelectionToggle');
  //   let boschNode = fixture.debugElement.query(By.css('#energy-parent-node _treeControl'));
  //   console.log( boschNode);
  //   boschNode.triggerEventHandler("click", null);
  //   fixture.detectChanges();
  //   expect(component.featureItemSelectionToggle).toHaveBeenCalled();
  // });

  it('should be check the title of first node', () => {
    let title = fixture.debugElement.query(By.css('#title')).nativeElement;
    expect(title.innerText).toEqual('Specific Energy for 3D Random-1');
  });

  it('Chart details not present then display msg No data to display!', () => {
    expect(component.hasChart).toBeFalsy();
    let chart = fixture.debugElement.query(
      By.css('#chartContainer-2 div')
    ).nativeElement;
    expect(chart.innerText).toEqual('No data to display!');
  });

  it('If hasChart is true, then display chart All, Energy, Production and Target', () => {
    expect(component.hasChart).toBeFalsy();
    component.hasChart = true;
    fixture.detectChanges();
    //let chart = fixture.debugElement.query(By.css('#chartContainer div')).nativeElement;
    expect(component.hasChart).toBeTruthy();
    spyOn(component, 'onDisplaysClick');
    let all = fixture.debugElement.query(By.css('#display-all'));
    let energyBtn = fixture.debugElement.query(By.css('#display-energy'));
    let productionBtn = fixture.debugElement.query(
      By.css('#display-production')
    );
    let targetBtn = fixture.debugElement.query(By.css('#display-target'));

    all.triggerEventHandler('click', null);
    expect(component.onDisplaysClick).toHaveBeenCalled();

    energyBtn.triggerEventHandler('click', null);
    expect(component.onDisplaysClick).toHaveBeenCalled();

    productionBtn.triggerEventHandler('click', null);
    expect(component.onDisplaysClick).toHaveBeenCalled();

    targetBtn.triggerEventHandler('click', null);
    expect(component.onDisplaysClick).toHaveBeenCalled();
  });
  it('Current Success Percent', ()=>{
    component.currentData = {
      "result": [
        {
          "date": "2022-03-13",
          "nightshiftactualQ_P1": 10,
          "plannedQ": 33,
          "actualQ": 11,
          "actualEbyQ": 12,
          "firstshiftactualQ_P1": 34,
          "secondshiftactualQ_P1": 21,
          "secondshiftactualE": 21,
          "actualE": 2.04,
          "nightshiftactualE": 2.04,
          "firstshiftactualE": 3,
          "plannedEbyQ": 1,
        "nightshiftactualQ_v1": 3,
          "firstshiftactualQ_v1": 22,
          "secondshiftactualQ_v1": 31,  
        },
        {
          "date": "2022-03-13",
          "nightshiftactualQ_P1": 10,
          "plannedQ": 33,
          "actualQ": 11,
          "actualEbyQ": 12,
          "firstshiftactualQ_P1": 34,
          "secondshiftactualQ_P1": 21,
          "secondshiftactualE": 21,
          "actualE": 2.04,
          "nightshiftactualE": 2.04,
          "firstshiftactualE": 3,
          "plannedEbyQ": 1,
        "nightshiftactualQ_v1": 3,
          "firstshiftactualQ_v1": 22,
          "secondshiftactualQ_v1": 31,  
        }],
      "dataPointList": []
    } ;
    expect(component.hasChart).toBeFalsy();
    component.hasChart = true;
    expect(component.currentData.result.length).toBeGreaterThan(1);


      //Process pie chart data
      let successCount = 0;
      let sum = 0;
      for (var i = 0; i < component.currentData.result.length; i++) {
        if (component.currentData.result[i].actualEbyQ >= component.currentData.result[i].plannedEbyQ) {
          sum+=component.currentData.result[i].plannedEbyQ;
        }
      }
      component.currentSuccessPercent = Math.round(
        (sum / component.currentData.result.length) * 100
      );
    component.currentSuccessMessage = 'success';
    component.selectedProducts = 'all';
    component.drawChart();
    expect(component.currentSuccessPercent).toBeGreaterThan(0.1);
      expect(component.currentSuccessMessage).toEqual('success')
  });
  it('initially pie chart should be empty',()=>{
    expect(component.currentSuccessPercent).toEqual(undefined);
    expect(component.currentSuccessMessage).toEqual('')
  });
  it('should display empty Product or varient Chart for no data', () => {
    let options: any;
    options = component.liveEQAnalysisChartConfig;
    component.columnchart = new Chart(options);
    expect(
      component.columnchart['options'].series.length
    ).toEqual(0);
  });
  it('should get all variant chart', ()=>{

    expect(component.hasChart).toBeFalsy();
    component.hasChart = true;
    component.selectedProducts = '123'

    console.log(component.variantList);
    const product = fixture.debugElement.query(By.css('#product .mat-select-trigger')).nativeElement;
    product.click();
    fixture.detectChanges();

    const matOption = fixture.debugElement.queryAll(By.css('.mat-option'))[1].nativeElement;
    matOption.click();
    fixture.detectChanges();
    component.variantList = ['123','222'];

    const selectVariant = fixture.debugElement.query(By.css('#select-variant .mat-select-trigger')).nativeElement;
    selectVariant.click();
    fixture.detectChanges();
    expect(component.hasChart).toBe(true)
    component.processDataAndDrawChart();
  });

});
