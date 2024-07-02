import { Component, OnInit } from '@angular/core';
import { SaveTutorAvailabilityRequest, TutorAvailability, TutorService } from '../../../../../services/tutor.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { addMonths, startOfDay } from 'date-fns';
import { NotificationsService } from '../../../../../services/Shared/notifications.service';
import { NotificationTypes } from '../../../../app.enums';

@Component({
  selector: 'app-availability-selection',
  templateUrl: './availability-selection.component.html',
  styleUrls: ['./availability-selection.component.css'],
  providers: [TutorService]
})
export class AvailabilitySelectionComponent implements OnInit {
  public view: CalendarView = CalendarView.Month;
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

  constructor(private tutorService:TutorService, private notificationsService: NotificationsService) {}
  
  ngOnInit(): void {
    this.generateTimeOptions();
    this.loadAvalabilites();
  }

  public loadAvalabilites(){
    this.tutorService.getAllAvalabilities().subscribe( response => {
      this.selectedAvailability = response;
      this.selectedAvailability.forEach( value => {
        this.availability.forEach( (aval) => {
          if(aval.day == value.Day || aval.dayLabel == value.Day){
            aval.available = true;
            aval.availability = true;
            if(aval.timeRanges[0].startTime == ''){
              aval.timeRanges.shift();
            }
            aval.timeRanges.push({ startTime: this.formatTimeTo12Hours(value.OpenTimeHours, value.OpenTimeMinutes), endTime: this.formatTimeTo12Hours(value.CloseTimeHours,value.CloseTimeMinutes) });
          }
        })
      })
    })
  }

  formatTimeTo12Hours(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'pm' : 'am';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // the hour '0' should be '12'
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
      value.timeRanges.forEach((timeRange: { startTime: string; endTime: string; }) => {
        formattedAvailabilities.push({
          Day: value.day.toString(),
          OpenTimeHours: this.extractHour(timeRange.startTime),
          OpenTimeMinutes: this.extractMinutes(timeRange.startTime),
          CloseTimeHours: this.extractHour(timeRange.endTime),
          CloseTimeMinutes: this.extractMinutes(timeRange.endTime),
          Id: ''
        });
      });
    });
    
    const request: SaveTutorAvailabilityRequest = {
      Availabilities: formattedAvailabilities
    };

    this.tutorService.saveTutorAvailability(request).subscribe(response => {
      if (response.Success) {
        this.notificationsService.showNotification(
          'Success',
          response.ResponseMessage,
          NotificationTypes.Success
        );
      } else {
        this.notificationsService.showNotification(
          'Error',
          response.ResponseMessage,
          NotificationTypes.Error
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
