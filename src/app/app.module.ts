//angular module imports
import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { JWT_OPTIONS, JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './authGuard';
import { DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { GroupByPipe } from './pipes/GroupBy.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

//components imports
import { SubjectComponent } from './components/admin/subject/subject.component';
import { SubjectSelectionComponent } from './components/common_components/subject-selection/subject-selection.component';
import { MeetingsComponent } from './components/common_components/meeting/meeting.component';
import { ClassMetadataComponent } from './components/tutor/class-metadata/class-metadata.component';
import { TutorDetailComponent } from './components/student/tutor-detail/tutor-detail.component';
import { EventComponent } from './components/tutor/event/event.component';
import { EventRequestComponent } from './components/common_components/event-request/event-request.component';
import { UserProfileComponent } from './components/common_components/user-profile/user-profile.component';
import { AvailabilitySelectionComponent } from './components/tutor/availability-selection/availability-selection.component';
import { TutorSelectionComponent } from './components/student/tutor-selection/tutor-selection.component';
import { AdminTutorComponent } from './components/admin/tutor/tutor.component';
import { DashboardComponent } from './components/common_components/dashboard/dashboard.component';
import { TopBarComponent } from './components/common_components/top-bar/top-bar.component';
import { AsideBarComponent } from './components/common_components/aside-bar/aside-bar.component';
import { AdminStudentComponent } from './components/admin/student/student.component';
import { AuthComponent } from './components/common_components/auth/auth.component';
import { StudentRegistrationComponent } from './components/registaration/student_registration/student-registration.component'
import { TutorRegistrationComponent } from './components/registaration/tutor_registration/tutor-registration.component'

//services import
import { AuthConfig, AuthService } from '../services/auth.service';

//add import of synfussions
import { EditService, GridModule, PageService, SortService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule, MultiSelect, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { StepperModule, StepperAllModule } from '@syncfusion/ej2-angular-navigations';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { DatePickerModule, CalendarModule} from '@syncfusion/ej2-angular-calendars';
import { TooltipAllModule } from '@syncfusion/ej2-angular-popups';

//thirdparty imports
import { ToastrModule } from 'ngx-toastr';
import {SchedulerComponent} from "./components/tutor/scheduler/scheduler.component";
import { ViewChildrenComponent } from './components/Parrent/view-children/view-children.component';
import { DurationPipe } from './pipes/duration.pipe';


export function getTokenFactory(injector: Injector) {
  return {
    tokenGetter: () => {
      var authService = injector.get(AuthService);
      var token = authService.getAccessToken();
      return token;
    },
    skipWhenExpired: true,
    // allowedDomains: ['localhost:44303']
  }
}

@NgModule({
  declarations: [
    TopBarComponent,
    AsideBarComponent,
    AppComponent,
    AuthComponent,
    DashboardComponent,
    AdminStudentComponent,
    AdminTutorComponent,
    AvailabilitySelectionComponent,
    TutorSelectionComponent,
    EventComponent,
    EventRequestComponent,
    UserProfileComponent,
    GroupByPipe,
    TutorDetailComponent,
    ClassMetadataComponent,
    MeetingsComponent,
    SubjectSelectionComponent,
    SubjectComponent,
    StudentRegistrationComponent,
    TutorRegistrationComponent,
    ViewChildrenComponent,
    DurationPipe
  ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        CommonModule,
        RouterModule.forRoot(routes),
        ReactiveFormsModule,
        // CalendarModule.forRoot({
        //     provide: DateAdapter,
        //     useFactory: adapterFactory,
        // }),
        JwtModule.forRoot({
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                deps: [Injector],
                useFactory: getTokenFactory
            }
        }),
        DialogModule,
        FontAwesomeModule,
        ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
        }),

        //Syncfussion Module
        GridModule,
        ButtonModule,
        DialogModule,
        DropDownListModule,
        ScheduleModule,
        MultiSelectModule,
        StepperAllModule,
        StepperModule,
        SchedulerComponent,
        RichTextEditorModule,
        DatePickerModule,
        CalendarModule,
        TooltipAllModule

    ],
  exports: [RouterModule],
  providers: [JwtHelperService,
      AuthConfig, AuthService, AuthGuard,

     //syncfussion providers
     PageService,
     SortService,
     EditService
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
