import { Component, OnInit, ViewChild } from '@angular/core';
import { SaveTutorAvailabilityRequest, TutorAvailability, TutorService } from '../../../../services/tutor.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { addMonths, startOfDay } from 'date-fns';
import { NotificationTypes } from '../../../app.enums';
import { DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, EventSettingsModel, ScheduleComponent, View, ActionEventArgs } from '@syncfusion/ej2-angular-schedule';
import { ButtonComponent } from '@syncfusion/ej2-angular-buttons';
import { DataManager, UrlAdaptor, ODataV4Adaptor, Query } from '@syncfusion/ej2-data';
import { environment } from '../../../../environments/environment';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-availability-selection',
  templateUrl: './availability-selection.component.html',
  styleUrls: ['./availability-selection.component.css'],
  providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, TutorService]
})
export class AvailabilitySelectionComponent implements OnInit {
  @ViewChild('scheduleObj') scheduleObj?: ScheduleComponent;
  public view: CalendarView = CalendarView.Month;
  private dataManager!: DataManager;
  public eventSettings!: EventSettingsModel;
  public viewDate: Date = new Date();
  public events: CalendarEvent[] = [];
  public allDays: any[] = [
    { label: 'Sunday', value: 'Sun' },
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' }
  ];

  public timeOptions: string[] = [];
  public selectedAvailability: TutorAvailability[] = [];
  public showPopup: boolean = false;
  public showListView:boolean = false;
  public selectedDates: Date[] = [];
  public dateTimes: { date: Date, timeRanges: { startTime: string, endTime: string }[] }[] = [];
  public selectedDateTimes: { date: Date, timeRanges: { startTime: string, endTime: string }[] }[] = [];
  public availability: any[] = this.allDays.map(day => ({
    dayLabel: day.label,
    day: day.value,
    available: false,
    timeRanges: [{ startTime: '', endTime: '' }]
  }));

  @ViewChild("addButton")
  public addButton?: ButtonComponent;
  public scheduleViews: View[] = ['Month'];
  constructor(private tutorService:TutorService,
     private toastr: ToastrService,
     private ngxSpinner: SpinnerService
    ) {  }

  ngOnInit(): void {
    this.initializeDataManager();
    this.generateTimeOptions();
    this.loadAvalabilites();
  }

  private initializeDataManager() {
    const headers = this.tutorService.getRequestHeaders();

    this.dataManager = new DataManager({
      headers: Object.keys(headers).map(key => ({ [key]: headers[key] })),
      url: `${environment.BASE_API_PATH}/Tutor/fetch-availabilty-schedule`,
      crudUrl: `${environment.BASE_API_PATH}/Tutor/save-schedule`,
      adaptor: new UrlAdaptor(),
      timeZoneHandling: true,
      crossDomain: true,
    });

    this.eventSettings = {
      dataSource: this.dataManager
     }
  }

  public loadAvalabilites(){
    this.ngxSpinner.show();
    this.tutorService.getAllAvalabilities().subscribe( response => {
      this.selectedAvailability = response;
      this.ngxSpinner.hide();
      this.selectedAvailability.forEach( value => {
        this.availability.forEach( (aval) => {
          if(aval.day == value.Day || aval.dayLabel == value.Day){
            aval.available = true;
            aval.availability = true;
            if(aval.timeRanges[0].startTime == ''){
              aval.timeRanges.shift();
            }
            aval.timeRanges.push({ id: value.Id, startTime: this.formatTimeTo12Hours(value.OpenTimeHours, value.OpenTimeMinutes), endTime: this.formatTimeTo12Hours(value.CloseTimeHours,value.CloseTimeMinutes) });
          }
        })
      })
    })
  }

  formatTimeTo12Hours(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'pm' : 'am';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${period}`;
  }

  switchToListView() {
    this.showListView = false;
  }

  switchToCalendarView() {
    this.showListView = true;
  }

  public addTimeRange(dayIndex: number) {
    this.availability[dayIndex].timeRanges.push({ startTime: '', endTime: '' });
  }

  public removeTimeRange(dayIndex: number, rangeIndex: number) {
    this.availability[dayIndex].timeRanges.splice(rangeIndex, 1);
  }

  public removeDate(index: number) {
    this.selectedDates.splice(index, 1);
    this.dateTimes.splice(index, 1);
  }

  public validateTimes(dayIndex: number, rangeIndex: number, userTimeRanges: any): string {
    const timeRanges = userTimeRanges;
    const timeRange = timeRanges[rangeIndex];

    // Convert times to 24-hour format
    const startTime24h = this.convertTo24HourFormat(timeRange.startTime);
    const endTime24h = this.convertTo24HourFormat(timeRange.endTime);

    // Ensure both times are in the valid range and start is before end
    if (!(startTime24h && endTime24h && startTime24h < endTime24h)) {
        return "Please Select Valid Time";
    }

    for (let i = 0; i < timeRanges.length; i++) {
        if (i !== rangeIndex) {
            const otherRange = timeRanges[i];

            // Convert other times to 24-hour format
            const otherStartTime24h = this.convertTo24HourFormat(otherRange.startTime);
            const otherEndTime24h = this.convertTo24HourFormat(otherRange.endTime);

            if (
                (startTime24h >= otherStartTime24h && startTime24h < otherEndTime24h) ||
                (endTime24h > otherStartTime24h && endTime24h <= otherEndTime24h) ||
                (startTime24h <= otherStartTime24h && endTime24h >= otherEndTime24h)
            ) {
                return "Time is Overlapping";
            }
        }
    }

    return "true";
  }

  convertTo24HourFormat(time: string): string {
      // Extract the period (AM/PM) and the time part
      const period = time.slice(-2).toUpperCase();
      const [hourPart, minutePart] = time.slice(0, -2).split(':');

      let hour = parseInt(hourPart, 10);
      const minutes = parseInt(minutePart, 10);

      // Convert the hour to 24-hour format
      if (period === 'PM' && hour !== 12) {
          hour += 12;
      } else if (period === 'AM' && hour === 12) {
          hour = 0;
      }

      // Format the hour and minutes as a two-digit number
      const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
      const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

      return `${hourStr}:${minuteStr}`;
  }

  extractHour(timeString: string): number {
    const twelveHourFormat = /^([0-9]{1,2}):([0-9]{2})(am|pm)$/i;
    const match = timeString.match(twelveHourFormat);

    if (match === null) {
      return -1;
    }
    const [, hours, minutes, period] = match;
    let hour = parseInt(hours, 10);
    if (period.toLowerCase() === 'pm' && hour < 12) {
      hour += 12;
    } else if (period.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    return hour;
  }

  extractMinutes(timeString: string): number {
    const twelveHourFormat = /^([0-9]{1,2}):([0-9]{2})(am|pm)$/i;
    const match = timeString.match(twelveHourFormat);

    if (match === null) {
      return -1;
    }

    const [, hours, minutes] = match;
    return parseInt(minutes, 10);
  }

  public addEditAvailability() {
    let ava = this.availability.filter(x => x.available == true);
    let formattedAvailabilities:TutorAvailability[] = []

    ava.forEach(value => {
      value.timeRanges.forEach((timeRange: { id:string; startTime: string; endTime: string; }) => {
        formattedAvailabilities.push({
          Day: value.day.toString(),
          OpenTimeHours: this.extractHour(timeRange.startTime),
          OpenTimeMinutes: this.extractMinutes(timeRange.startTime),
          CloseTimeHours: this.extractHour(timeRange.endTime),
          CloseTimeMinutes: this.extractMinutes(timeRange.endTime),
          Id: timeRange.id ? timeRange.id : ''
        });
      });
    });

    const request: SaveTutorAvailabilityRequest = {
      Availabilities: formattedAvailabilities
    };
    this.ngxSpinner.show();
    this.tutorService.saveTutorAvailability(request).subscribe(response => {
      if (response.Success) {
        this.ngxSpinner.hide();
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
      } else {
        this.toastr.error(
          'Error',
          response.ResponseMessage
        );
      }
    });
  }

  generateTimeOptions() {
    const times = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 96; i++) {
      const timeString = this.formatTime(start);
      times.push(timeString);
      start.setMinutes(start.getMinutes() + 15);
    }

    this.timeOptions = times;
  }

  formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    return `${hours12}:${minutesString}${ampm}`;
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
  }

  addDateSpecificHour() {
    this.selectedDateTimes.push(...this.dateTimes);

    this.togglePopup();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
  }

  incrementMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  decrementMonth(): void {
    this.viewDate = addMonths(this.viewDate, -1);
  }

  dateSelected(event: any) {
    const selectedDate = event.day.date;
    const today = startOfDay(new Date());
    if(selectedDate >= today){
      if (!this.selectedDates.find(date => this.isSameDay(date, selectedDate))) {
        this.selectedDates.push(selectedDate);
        this.dateTimes.push({ date: selectedDate, timeRanges: [] });
      }
    }
  }

  addTimeRangeForDatePicker(dateIndex: number) {
    this.dateTimes[dateIndex].timeRanges.push({ startTime: '', endTime: '' });
  }

  removeTimeRangeForDatePicker(dateIndex: number, timeIndex: number) {
    this.dateTimes[dateIndex].timeRanges.splice(timeIndex, 1);
  }

}
