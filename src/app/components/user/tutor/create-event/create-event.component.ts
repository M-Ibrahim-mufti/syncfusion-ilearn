import { InputTextModule } from 'primeng/inputtext';
import { ClassMetadataService, ClassMetaData } from './../../../../../services/class-metadata.service';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Event, EventService, GroupedAvailabilities } from '../../../../../services/event.service';
import { TutorAvailability, TutorService } from '../../../../../services/tutor.service';
import { SelectItem } from 'primeng/api';
import { AuthConfig, AuthService } from '../../../../../services/auth.service';
import { NotificationsService } from '../../../../../services/Shared/notifications.service';
import { NotificationTypes } from '../../../../app.enums';
import { StudentService } from '../../../../../services/student.service';
import { ActivatedRoute } from '@angular/router';
import { GroupByPipe } from '../../../../pipes/GroupBy.pipe';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
  providers: [EventService, TutorService, StudentService, GroupByPipe]
})

export class CreateEventComponent implements OnInit {
  public today = new Date();
  public currentDayIndex = this.today.getDay();
  public currentDayAbbreviation = this.getDayAbbreviation(this.currentDayIndex);
  public activeIndex: number = 0;
  public IsOneToOne: boolean = false;
  public durations: any = [30, 60, 90, 120];
  public firstName!: string;
  public userImgUrl!: string;
  public isAuthenticated!: boolean;
  public selectedEvent: Event = {} as Event;
  public tutorAvailabilities: TutorAvailability[] = [];
  public subjects: SelectItem[] = [];
  public timeOptions: string[] = [];
  public selectedTime: string = '-1';
  errorMessageForStartTime: string = '';
  eventStartTime: string = '';
  errorMessageForDuration: string = '';
  events: Event[] = []
  public allDays: any[] = [
    { label: 'Sunday', value: 'Sun' },
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' }
  ];
  disabledTimeOptions: any[] = [];
  firstSegment!: string;
  groupedAvailabilities: GroupedAvailabilities = [];
  public authConfig!: AuthConfig;
  public classMetaData: ClassMetaData[] = [];
  public selectedSubject: string = '';
  public eventTitle: SelectItem[] = [];

  constructor(
    private ngxSpinnerService: NgxSpinnerService,
    private notificationsService: NotificationsService,
    private eventService: EventService, private authService: AuthService,
    private tutorService: TutorService,
    private studentService: StudentService,
    private classMetaServices: ClassMetadataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    this.selectedEvent.Duration = -1
    this.selectedEvent.AvailabilityId = "-1"
    this.selectedEvent.SubjectId = "-1"
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        this.firstSegment = segments[0].path;
        if (history.state.tutor != undefined) {
          const tutor = history.state.tutor;
          this.selectedEvent.IsOneOnOne = true;
          this.activeIndex = 1;
          this.selectedEvent.TutorId = tutor.Id
          this.tutorAvailabilities = tutor.TutorAvailabilities
          this.subjects = tutor.TutorSubjects
          this.events = tutor.CreateEvents
          this.groupAvailabilitiesByDay()
        }
      }
    });    
    this.isAuthenticated = this.authService.isAuthenticated()
    if (this.isAuthenticated) {
      var currentUser = this.authService.getCurrentUser();

      if (currentUser) {
        this.firstName = currentUser.FullName;
        this.userImgUrl = currentUser.ImgUrl;
      }
      if (history.state.events != undefined) {
        this.events = history.state.events
        this.loadAvalabilites();
      }      
    }
    
    this.loadSubjects();
    this.viewClassMetaData();
  }

  public viewClassMetaData() {
    this.ngxSpinnerService.show();
    this.classMetaServices.viewClassMetaData().subscribe((response) => {
      this.ngxSpinnerService.hide();
      this.classMetaData = response;

      this.eventTitle = this.classMetaData.map(p => ({
        label: p.Title,
        value: p.Id  // Adjust the value field as per your requirements
      }));
    });
  }

  loadEvents(){
    this.eventService.getEvents().subscribe(
      response => {
        this.events = response
      }
    )
  }

  public loadSubjects() {
    this.studentService.getAllSubjects().subscribe(response => {
      this.subjects = response;
    })
  }

  public loadAvalabilites() {
    this.tutorService.getAllAvalabilities().subscribe(async response => {
      this.tutorAvailabilities = await response;
      this.groupAvailabilitiesByDay()
    }
    );
  }

  public onEventChange(event: any) {
    this.selectedEvent = event;
    const selectedEventData = this.classMetaData.find(p => p.Id === event.value);
    if (selectedEventData) {
      this.selectedSubject = selectedEventData.SubjectName;
      this.selectedEvent.SubjectId = selectedEventData.SubjectId;
      this.selectedEvent.Name = selectedEventData.Title;
    }
  }

  public eventType(value: boolean) {
    this.IsOneToOne = value;    
    this.activeIndex++;
  }

  public createEvent() {
    this.ngxSpinnerService.show();

    const filteredAvailability = this.tutorAvailabilities.find(x => x.Id == this.selectedEvent.AvailabilityId);
    const gapMinutes = this.getTimeGap(
      filteredAvailability!.OpenTimeHours,
      filteredAvailability!.OpenTimeMinutes,
      filteredAvailability!.CloseTimeHours,
      filteredAvailability!.CloseTimeMinutes
    );

    const dateIn24Hours = this.convertTo24HourFormat(this.selectedTime);

    const selectedDateUTC = this.convertToUTCDate(this.today, dateIn24Hours);
    this.selectedEvent.EventStartTime = selectedDateUTC;
    if (this.selectedEvent.Duration > gapMinutes) {
      console.log("Ki Gl Aj e Prha Dyna Sb Nu");
      this.ngxSpinnerService.hide();
      return;
    }
    this.selectedEvent.IsOneOnOne = this.IsOneToOne;
    
    this.eventService.saveEvent(this.selectedEvent).subscribe(async response => {
      this.ngxSpinnerService.hide();
      if (await response.Success) {
        this.loadEvents()
        this.selectedEvent = new Event()
        this.selectedSubject = '';
        this.selectedEvent.AvailabilityId = "-1";
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

  convertTo24HourFormat(time: string): string {
    const period = time.slice(-2).toUpperCase();
    const [hourPart, minutePart] = time.slice(0, -2).trim().split(':');
    let hour = parseInt(hourPart, 10);
    const minutes = parseInt(minutePart, 10);

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
    const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hourStr}:${minuteStr}`;
  }

  public getTimeInMinutes(hours: number, minutes: number): number {
    return hours * 60 + minutes;
  }

  public getTimeGap(openHours: number, openMinutes: number, closeHours: number, closeMinutes: number): number {
    const openTime = this.getTimeInMinutes(openHours, openMinutes);
    const closeTime = this.getTimeInMinutes(closeHours, closeMinutes);
    return Math.abs(openTime - closeTime);
  }

  public formatTimeTo12Hours(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'pm' : 'am';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${period}`;
  }

  convertToUTCDate(localDate: Date, time24HourFormat: string): Date {
    const [hours, minutes] = time24HourFormat.split(':').map(Number);

    // Create a new Date object based on the localDate
    const localDateTime = new Date(localDate);
    localDateTime.setHours(hours, minutes, 0, 0);

    // Convert the local date and time to UTC
    const utcDateTime = new Date(Date.UTC(
      localDateTime.getFullYear(),
      localDateTime.getMonth(),
      localDateTime.getDate(),
      localDateTime.getHours(),
      localDateTime.getMinutes(),
      localDateTime.getSeconds()
    ));

    return utcDateTime;
  }

  public getDayLabel(dayValue: any): string {
    const day = this.allDays.find(day => day.value == dayValue);
    return day ? day.label : '';
  }

  public getDayAbbreviation(dayIndex: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  }

  groupAvailabilitiesByDay() {
    if (!Array.isArray(this.tutorAvailabilities)) {
      console.error('tutorAvailabilities is not an array');
      return;
    }

    const groupedObject = this.tutorAvailabilities.reduce((acc: { [key: string]: TutorAvailability[] }, availability: TutorAvailability) => {
      if (!acc[availability.Day]) {
        acc[availability.Day] = [];
      }
      acc[availability.Day].push(availability);
      return acc;
    }, {});

    this.groupedAvailabilities = Object.keys(groupedObject).map(key => ({
      key,
      value: groupedObject[key]
    }));
  }

  public eventAttributes() {
    this.createEvent();
    this.next()
  }

  public next() {
    this.activeIndex++;
  }

  public back() {
    if (this.activeIndex > -1) {
      this.activeIndex--;
    }
  }

  generateTimeOptions(availabilityId: string) {
    this.selectedTime = '-1';
    this.selectedEvent.Duration = -1;
    this.selectedEvent.EventStartTime = new Date();
    const times = [];
    const disabledTimes: string[] = []; // Array to keep track of disabled times
    const start = new Date();
    let availability = this.tutorAvailabilities.find(x => x.Id == availabilityId);
    start.setHours(availability!.OpenTimeHours, availability!.OpenTimeMinutes, 0, 0);
    let timeRupteHours = availability!.CloseTimeHours - availability!.OpenTimeHours;
    timeRupteHours = timeRupteHours * 60;
    let timeRupteMinutes = availability!.CloseTimeMinutes - availability!.OpenTimeMinutes;
    let timeRange = ((timeRupteHours + timeRupteMinutes) / 15) + 1;
    for (let i = 0; i < timeRange; i++) {
      const timeString = this.formatTime(start);
      times.push(timeString);
      start.setMinutes(start.getMinutes() + 15);
    }

    this.timeOptions = times;
    if (this.events.length > 0) {
      this.events.forEach(event => {
        if (availability?.Id == event.AvailabilityId) {
          if (event.Day == undefined) {
            event.Day = this.currentDayAbbreviation
          }
          let eventDate = new Date(event.EventStartTime);
          let duration = event.Duration;

          // Extract hour and minute from EventStartTime
          let eventHour = eventDate.getHours();
          let eventMinute = eventDate.getMinutes();

          // Add duration to the event time
          eventMinute += duration;

          // Handle overflow of minutes
          eventHour += Math.floor(eventMinute / 60);
          eventMinute %= 60;
          timeRupteHours = eventHour - eventDate.getHours();
          timeRupteHours = timeRupteHours * 60;
          timeRupteMinutes = eventMinute - eventDate.getMinutes();
          timeRange = ((timeRupteHours + timeRupteMinutes) / 15) + 1;
          let timeString: string = this.formatTime(eventDate);
          let startIndex = this.timeOptions.findIndex(x => x == timeString);

          // Mark the disabled times
          for (let i = 0; i < timeRange; i++) {
            disabledTimes.push(this.timeOptions[startIndex + i]);
          }
        }
      });
    }
    this.disabledTimeOptions = disabledTimes;
  }

  formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    return `${hours12}:${minutesString}${ampm}`;
  }

  startTimeCheck() {
    if (this.selectedEvent.Duration == -1) {
      this.eventStartTime = this.selectedTime
      this.errorMessageForStartTime = 'Please Select Duration'
      return
    }
    if (this.eventStartTime != this.selectedTime) {
      this.selectedEvent.Duration = -1
      this.errorMessageForDuration = 'true'
      this.errorMessageForStartTime = 'Please Select Duration'
      return
    }

    this.errorMessageForStartTime = 'true';
    return
  }

  durationCheck() {
    if (this.selectedTime == "-1") {
      this.errorMessageForDuration = 'Please Select Start Time'
      return
    }
    const indexTimeOption = this.timeOptions.findIndex(x => x == this.selectedTime)
    const valueToDevide = (this.selectedEvent.Duration / 30) * 2
    const checkIndex = indexTimeOption + valueToDevide;
    let checkSelectedTimes: any[] = [];
    for (let i = 0; i <= valueToDevide; i++) {
      checkSelectedTimes.push(this.timeOptions[indexTimeOption + i]);
    }
    checkSelectedTimes.forEach(checkSelectedTime => {
      if (this.disabledTimeOptions.includes(checkSelectedTime)) {
        this.errorMessageForDuration = "Tutor isn't available at this time. Please select other time.";
        return;
      }
    })
    if (this.errorMessageForDuration != 'true') {
      this.errorMessageForDuration = 'true'
      this.errorMessageForStartTime = 'true';
      return;
    }

    let dateIn24Hours = this.convertTo24HourFormat(this.selectedTime)
    const [selectedHours, selectedMinutes] = dateIn24Hours.split(':').map(Number);
    let totalOpeningMinutes = (selectedHours * 60) + selectedMinutes;
    let availability = this.tutorAvailabilities.find(x => x.Id == this.selectedEvent.AvailabilityId);
    let totalClosingMinuts = (availability!.CloseTimeHours * 60) + availability!.CloseTimeMinutes
    let totalAvalableMinuts = totalClosingMinuts - totalOpeningMinutes
    if (totalAvalableMinuts < this.selectedEvent.Duration) {
      this.errorMessageForDuration = 'The Duration is Not Valid';
      return
    }

    this.errorMessageForStartTime = 'true';
    this.errorMessageForDuration = 'true';
  }
}
