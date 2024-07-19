import { Component, OnInit, ViewChild } from '@angular/core';
import { SaveTutorAvailabilityRequest, TutorAvailability, TutorService } from '../../../../services/tutor.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { addMonths, startOfDay } from 'date-fns';
import { NotificationTypes } from '../../../app.enums';
import { DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, EventSettingsModel, ScheduleComponent, View, ActionEventArgs, PopupOpenEventArgs, PopupCloseEventArgs } from '@syncfusion/ej2-angular-schedule';
import { ButtonComponent, classNames } from '@syncfusion/ej2-angular-buttons';
import { DataManager, UrlAdaptor, ODataV4Adaptor, Query } from '@syncfusion/ej2-data';
import { FieldModel, FieldOptionsModel } from '@syncfusion/ej2-angular-schedule';
import { environment } from '../../../../environments/environment';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { createElement } from '@syncfusion/ej2-base';
import { ChangeEventArgs, DropDownList } from '@syncfusion/ej2-angular-dropdowns';
import { StudentService } from '../../../../services/student.service';
import {ClassMetaData, ClassMetadataService} from "../../../../services/class-metadata.service";
import {SelectItem} from "../../../../services/event.service";



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
    public fields: ECustomField = {
        id:'Id',
        subject: { name:'Subject', title:'Class Title',  },
        description: {name:'Description', title: 'Class Description'},
        classSubject: {name:'SubjectId'},
        classGrade: {name:'GradeId'},
    };

    public timeOptions: string[] = [];
    public selectedAvailability: TutorAvailability[] = [];
    public showPopup: boolean = false;
    public showListView:boolean = false;
    public selectedDates: Date[] = [];
    public dateTimes: { date: Date, timeRanges: { startTime: string, endTime: string }[] }[] = [];
    public selectedDateTimes: { date: Date, timeRanges: { startTime: string, endTime: string }[] }[] = [];
    public availability: any[] = [];
    public eventSettings!: EventSettingsModel
    public tutorSubjects: any[] = []
    public tutorGrades: any[] = []
    public gradeDropDownList!:DropDownList
    public subjectDropDownList!:DropDownList
    public IsOneOnOne:any[] = [
        {label:'One On One', value: true },
        {label:"On Group", value: false }
    ]

    @ViewChild("addButton")
    public addButton?: ButtonComponent;
    public scheduleViews: View[] = ['Month'];
    constructor(private tutorService:TutorService,
                private toastr: ToastrService,
                private ngxSpinner: SpinnerService,
                private classMetaServices: ClassMetadataService,
                private studentService:StudentService

    ) {  }


    ngOnInit(): void {
        this.viewClassMetaData();
        this.initializeDataManager();
        //this.generateTimeOptions();
        //this.loadAvalabilites();
        this.getTutorSubjects();

    }
    // Start of Scheduler data
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
            dataSource: this.dataManager,
            fields: this.fields
        }
    }

    public getSubjectGrades(subjectId:string) {
        this.studentService.viewUserGrades(subjectId).subscribe((response) => {
            this.tutorGrades = response;
            this.gradeDropDownList.dataSource = this.tutorGrades;
            this.gradeDropDownList.refresh();
        })
    }

    public getTutorSubjects () {
        this.studentService.getAllUserSubjects().subscribe((response) => {
            this.tutorSubjects = response
        })
    }
    public onChangeSubject(data: ChangeEventArgs) {
        const subjectId:string = data.itemData.value ? data.itemData.value : '';
        this.getSubjectGrades(subjectId);
        this.gradeDropDownList.enabled = true
    }

    public removeFields() {
        let container = document.querySelectorAll('.custom-field-container')
        if(container) {
            container.forEach((cont) => {
                cont.remove();
            })
        }
    }

    public onPopupOpen(args: PopupOpenEventArgs): void {
        console.log(args.type);

        if (args.type === 'Editor' || args.type === 'QuickInfo') {
            // Remove existing custom field rows if they exist
            const existingCustomRows = args.element.querySelectorAll('.custom-field-row');
            existingCustomRows.forEach(row => row.remove());

            // Remove the default "Add title" input field
            let subjectElement = args.element.querySelector('.e-subject-container');
            if (subjectElement) {
                subjectElement.remove();
            }

            subjectElement = args.element.querySelector('.e-input-group');
            if (subjectElement && args.type === 'QuickInfo') {
                subjectElement.remove();
            }

            // Create the custom field row
            const row: HTMLElement = createElement('div', { className: 'custom-field-row' });

            // Create the container for the first dropdown (Class Name)
            let container: HTMLElement = createElement('div', { className: 'custom-field-container e-input-wrapper e-form-left' });
            let inputEle: HTMLInputElement = createElement('input', {
                className: 'e-field', attrs: { name: 'ClassMataDataId' }
            }) as HTMLInputElement;
            container.appendChild(inputEle);
            row.appendChild(container);

            let dropDownList: DropDownList = new DropDownList({
                dataSource: this.eventTitle,
                fields: { text: 'label', value: 'value' },
                value: (<{ [key: string]: Object; }>(args.data))['ClassMataDataId'] as string,
                floatLabelType: 'Always', placeholder: 'Select Class',
                change: this.onEventChange.bind(this)
            });
            dropDownList.appendTo(inputEle);
            inputEle.setAttribute('name', 'ClassMataDataId');

            container = createElement('div', { className: 'custom-field-container e-input-wrapper e-form-left' });
            inputEle = createElement('input', {
                className: 'e-field', attrs: { name: 'SubjectId' }
            }) as HTMLInputElement;
            container.appendChild(inputEle);
            row.appendChild(container);

            this.subjectDropDownList = new DropDownList({
                enabled: false,
                dataSource: this.tutorGrades,
                fields: { text: 'label', value: 'value' },
                value: (<{ [key: string]: Object; }>(args.data))['SubjectId'] as string,
                floatLabelType: 'Always', placeholder: 'Select Subject',
            });
            this.subjectDropDownList.appendTo(inputEle);
            inputEle.setAttribute('name', 'SubjectId');

            container = createElement('div', { className: 'custom-field-container e-input-wrapper e-form-left' });
            inputEle = createElement('input', {
                className: 'e-field', attrs: { name: 'IsOneOnOne' }
            }) as HTMLInputElement;
            container.appendChild(inputEle);

            if (args.type === 'Editor') {
                const dialogParent: HTMLElement = args.element.querySelector('.e-dialog-parent')!;

                const titleLocationRow = dialogParent.querySelector('.e-title-location-row');
                if (titleLocationRow) {
                    titleLocationRow.parentNode!.insertBefore(row, titleLocationRow);
                } else {
                    dialogParent.appendChild(row);
                }

                const meetingTypeRow: HTMLElement = createElement('div', { className: 'custom-field-row' });
                container = createElement('div', { className: 'custom-field-container e-input-wrapper e-form-left' });
                let inputEleForIsOneOnOne: HTMLInputElement = createElement('input', {
                    className: 'e-field', attrs: { name: 'IsOneOnOne' }
                }) as HTMLInputElement;
                container.appendChild(inputEleForIsOneOnOne);
                meetingTypeRow.appendChild(container);

                const MeetingTypeDropDownList = new DropDownList({
                    enabled: true,
                    dataSource: this.IsOneOnOne,
                    fields: { text: 'label', value: 'value' },
                    value: (<{ [key: string]: Object; }>(args.data))['isOneOnOne'] as string,
                    floatLabelType: 'Always', placeholder: 'Select Meeting type',
                    change: this.onChangeMeetingType.bind(this)
                });
                MeetingTypeDropDownList.appendTo(inputEleForIsOneOnOne);
                inputEleForIsOneOnOne.setAttribute('name', 'IsOneOnOne');

                if (titleLocationRow) {
                    titleLocationRow.parentNode!.insertBefore(meetingTypeRow, titleLocationRow.nextSibling);
                } else {
                    dialogParent.appendChild(meetingTypeRow);
                }
            } else if (args.type === 'QuickInfo') {
                args.element.insertBefore(row, args.element.firstChild);
            }
        }
    }




    public onChangeMeetingType(data: ChangeEventArgs) {
        console.log(data);
        // Implement your logic for meeting type change here
    }

    public classMetaData: ClassMetaData[] = [];
    public eventTitle: any[] = [];
    public selectedEvent: SelectItem | null = null;
    public subjects: any[] = [];

    public viewClassMetaData() {
        this.classMetaServices.viewClassMetaData().subscribe((response) => {
            this.classMetaData = response;
            this.eventTitle = this.classMetaData.map((p) => ({
                label: p.Title,
                value: p.Id,
                SubjectName: p.SubjectName, // Include SubjectName in eventTitle mapping
                SubjectId: p.SubjectId // Include SubjectId in eventTitle mapping
            }));
            console.log(this.eventTitle);
        });
    }

    public onEventChange(data: ChangeEventArgs) {
        const selectedEventId = data.itemData.value;

        const selectedEventData = this.classMetaData.find(p => p.Id === selectedEventId);
        if (selectedEventData) {
            this.selectedEvent = {
                label: selectedEventData.Title,
                value: selectedEventData.Id
            };

            // Update subjects with the selected event's subject details
            this.subjects = [{
                label: selectedEventData.SubjectName,
                value: selectedEventData.SubjectId
            }];

            this.subjectDropDownList.dataSource = this.subjects;
            this.subjectDropDownList.refresh()

            this.subjectDropDownList.value = selectedEventData.SubjectId;
            this.subjectDropDownList.dataBind();
        }
    }

    public loadAvalabilites(){
        this.selectedAvailability = []
        this.availability = this.allDays.map(day => ({
            dayLabel: day.label,
            day: day.value,
            available: false,
            timeRanges: [{ startTime: '', endTime: '' }]
        }));
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
        this.showListView = true;
        this.loadAvalabilites();
    }

    switchToCalendarView() {
        this.showListView = false;
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

export class ECustomField implements FieldModel {
  id?: string;
  isBlock?: string;
  subject?: FieldOptionsModel;
  startTime?: FieldOptionsModel;
  endTime?: FieldOptionsModel;
  location?: FieldOptionsModel;
  description?: FieldOptionsModel;
  isAllDay?: FieldOptionsModel;
  recurrenceID?: FieldOptionsModel;
  recurrenceException?: FieldOptionsModel;
  isReadonly?: string;
  followingID?: string;
  classSubject?: FieldOptionsModel;
  classGrade?: FieldOptionsModel;
}