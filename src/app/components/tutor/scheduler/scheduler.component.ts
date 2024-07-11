import {Component, OnInit, ViewChild} from '@angular/core';
import {
  AgendaService,
  DayService,
  EventSettingsModel, MonthAgendaService, MonthService,
  ScheduleComponent,
  ScheduleModule, TimelineMonthService, TimelineViewsService,
  View, WeekService, WorkWeekService
} from "@syncfusion/ej2-angular-schedule";
import {DataManager, UrlAdaptor} from "@syncfusion/ej2-data";
import {environment} from "../../../../environments/environment";
import {TutorService} from "../../../../services/tutor.service";

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    ScheduleModule
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css',
  providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, TutorService]
})
export class SchedulerComponent implements OnInit{
  @ViewChild('scheduleObj') scheduleObj?: ScheduleComponent;
  private dataManager!: DataManager;
  public eventSettings!: EventSettingsModel;
  public scheduleViews: View[] = ['Month'];
  data: any = [
    {
      Id: "abc",
      Subject: "Test Subject",
      Description: "Test",
      StartTime: new Date(),
      EndTime: new Date()
    }
  ];
  constructor(private tutorService:TutorService){

  }
  ngOnInit(): void {
    this.initializeDataManager();
  }
  private initializeDataManager() {
    const headers = this.tutorService.getRequestHeaders();

    // this.dataManager = new DataManager({
    //   headers: Object.keys(headers).map(key => ({ [key]: headers[key] })),
    //   url: `${environment.BASE_API_PATH}/Tutor/fetch-availabilty-schedule`,
    //   crudUrl: `${environment.BASE_API_PATH}/Tutor/save-schedule`,
    //   adaptor: new UrlAdaptor(),
    //   timeZoneHandling: true,
    //   crossDomain: true,
    // });

    this.eventSettings = {
      // dataSource: this.dataManager
      dataSource: this.data,
      allowAdding: false,
      allowEditing: false,
      allowDeleting: false
    }
  }

}
