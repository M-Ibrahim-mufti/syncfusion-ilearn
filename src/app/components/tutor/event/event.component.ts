import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClassMetaData, ClassMetadataService } from '../../../../services/class-metadata.service';
import { TutorAvailability, TutorService } from '../../../../services/tutor.service';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { Event,GroupedAvailabilities, EventService, SelectItem } from '../../../../services/event.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { NotificationTypes } from '../../../app.enums';
import { ToastrService } from 'ngx-toastr';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  providers: [ClassMetadataService, DatePipe]
})
export class EventComponent implements OnInit {
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
  public errorMessageForStartTime: string = '';
  public eventStartTime: string = '';
  public errorMessageForDuration: string = '';
  public events: Event[] = [];
  isEdit:boolean = false;
  public addClassDialogueBox: boolean = false;
  public allDays: any[] = [
    { label: 'Sunday', value: 'Sun' },
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' }
  ];
  public disabledTimeOptions: any[] = [];
  public firstSegment!: string;
  public groupedAvailabilities: GroupedAvailabilities = [];
  public authConfig!: AuthConfig;
  public classMetaData: ClassMetaData[] = [];
  public selectedSubject: string = '';
  public eventTitle: SelectItem[] = [];
  public dialogInstance: any;

  constructor(
    private spinnerService: SpinnerService,
    private eventService: EventService, private authService: AuthService,
    private tutorService: TutorService,
    private classMetaServices: ClassMetadataService,
    private route: ActivatedRoute,
    private cdr:ChangeDetectorRef,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private ngxSpinner: SpinnerService
  ) { }

  ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    this.selectedEvent.Duration = -1
    this.selectedEvent.AvailabilityId = "-1"
    this.selectedEvent.SubjectId = "-1"

    this.isAuthenticated = this.authService.isAuthenticated()
    if (this.isAuthenticated) {
      var currentUser = this.authService.getCurrentUser();

      if (currentUser) {
        this.firstName = currentUser.FullName;
        this.userImgUrl = currentUser.ImgUrl;
      }
      this.getTutorEvents();
      this.viewClassMetaData();
    }    
  }

  public getTutorEvents() {
    this.eventService.getEvents().subscribe(async response => {
      this.events = await response
      this.loadAvalabilites();
    })
  }

  public viewClassMetaData() {
    this.classMetaServices.viewClassMetaData().subscribe( (response) => {
      this.classMetaData =  response;
      this.eventTitle = this.classMetaData.map(p => ({
        label: p.Title,
        value: p.Id
      }));
    });
  }

  public loadAvalabilites() {
    this.tutorService.getAllAvalabilities().subscribe(async response => {
      this.tutorAvailabilities = await response;
      this.groupAvailabilitiesByDay()
    }
    );
  }

  public onEventChange(event: any) {    
    const selectedEventData = this.classMetaData.find(p => p.Id === event.target.value);
      if (selectedEventData) {
        this.selectedEvent.SubjectName = selectedEventData.SubjectName;
        this.selectedEvent.SubjectId = selectedEventData.SubjectId;
        this.selectedEvent.Name = selectedEventData.Title;
      }
  }

  public eventType(value: boolean) {
    this.IsOneToOne = value;    
    this.activeIndex++;
  }

  public createEvent() {
    this.ngxSpinner.show();

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
      this.ngxSpinner.hide();
      return;
    }
    this.eventService.saveEvent(this.selectedEvent).subscribe(response => {
      if (response.Success) {
        this.selectedEvent = new Event();
        this.eventTitle = this.classMetaData.map(p => ({
          label: '',
          value: ''
        }));
        this.selectedSubject = '';
        this.selectedEvent.AvailabilityId = "-1";
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
        this.onDialogClose();
        this.getTutorEvents();
        
      } else {
        this.toastr.error(
          'Error',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
      }
    });
  }
  
  public editClass(selectedClass: Event) {
    this.addClassDialogueBox = true;
    this.selectedEvent = { ...selectedClass }; 
    const selectedEventData = this.events.find(p => p.Id === selectedClass.Id);
    this.eventTitle = [{
      label: selectedEventData?.Name,
      value: selectedEventData?.Id
    }]
    if(selectedClass.AvailabilityId){
      this.generateTimeOptions(selectedClass.AvailabilityId)
    }
    this.selectedTime = this.formatTime(new Date(selectedClass.EventStartTime))
    this.selectedEvent.Duration = selectedClass.Duration
  }

  public deleteClass(selectedClass: Event) {
    this.dialogInstance = DialogUtility.confirm({
      title: 'Delete Confirmation',
      content: `Are you sure you want to delete this class ${selectedClass.Name}?`,
      okButton: { text: 'Yes', click: this.confirmDelete.bind(this, selectedClass) },
      cancelButton: { text: 'No' },
      showCloseIcon: true,
      closeOnEscape: true,
      animationSettings: { effect: 'Zoom' }
    });
  } 

  public confirmDelete(selectedClass: Event) {
  this.ngxSpinner.show();
  this.eventService.deleteEvent(selectedClass.Id!).subscribe(
    (response) => {
      if (response.Success) {
        this.getTutorEvents();
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
      } else {
        this.toastr.error(
          'Error',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
      }
      this.dialogInstance.hide();
    },
    (error) => {
      console.error('Error deleting student:', error);
      this.spinnerService.hide();
      this.toastr.error(
        'Error',
        'Error Happen'
      );
      this.ngxSpinner.hide();
      this.dialogInstance.hide();
    }
  );
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
    formattedHours = formattedHours ? formattedHours : 12;
    const formattedMinutes = minutes?.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${period}`;
  }

  convertToUTCDate(localDate: Date, time24HourFormat: string): Date {
    const [hours, minutes] = time24HourFormat.split(':').map(Number);

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
    const disabledTimes: string[] = [];
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

  public openClassModal() {
    this.addClassDialogueBox = true;
  }

  onDialogClose(){
    this.addClassDialogueBox = false;
    this.selectedEvent = new Event();
    this.selectedSubject = "-1";
    this.selectedEvent.AvailabilityId = "-1";
    this.isEdit = false;
    this.eventTitle = this.classMetaData.map(p => ({
      label: p.Title,
      value: p.Id
    }));
  }

  public formateDateTo12Hours(value: any): string | null {
    if (value) {
      const time = new Date(`1970-01-01T${value}`);
      return this.datePipe.transform(time, 'hh:mm a');
    }
    return null;
  }

  
}