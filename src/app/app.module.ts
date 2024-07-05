import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { AuthComponent } from './components/common_components/auth/auth.component';
import { NotificationsService } from '../services/Shared/notifications.service';
import { JWT_OPTIONS, JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { AuthConfig, AuthService } from '../services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { StudentRegistrationComponent } from './components/registaration/student_registration/student-registration.component';
import { DashboardComponent } from './components/common_components/dashboard/dashboard.component';
import { TopBarComponent } from './components/common_components/top-bar/top-bar.component';
import { AsideBarComponent } from './components/common_components/aside-bar/aside-bar.component';
import { AdminStudentComponent } from './components/admin/student/student.component';
import { AuthGuard } from './authGuard';
import { TutorRegistrationComponent } from './components/registaration/tutor_registration/tutor-registration.component';
import { AvailabilitySelectionComponent } from './components/tutor/availability-selection/availability-selection.component';
import { TutorSelectionComponent } from './components/student/tutor-selection/tutor-selection.component';
import { AdminTutorComponent } from './components/admin/tutor/tutor.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventComponent } from './components/tutor/event/event.component';
import { CreateEventComponent } from './components/tutor/create-event/create-event.component';
import { EventRequestComponent } from './components/common_components/event-request/event-request.component';
import { UserProfileComponent } from './components/common_components/user-profile/user-profile.component';
import { GroupByPipe } from './pipes/GroupBy.pipe';
import { ZoomConnectionComponent } from './components/tutor/zoom-connection/zoom-connection.component';
import { TutorDetailComponent } from './components/student/tutor-detail/tutor-detail.component';
import { ClassMetadataComponent } from './components/tutor/class-metadata/class-metadata.component';
import { MeetingsComponent } from './components/common_components/meeting/meeting.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

//add import of synfussions
import { EditService, GridModule, PageService, SortService } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { SubjectSelectionComponent } from './components/common_components/subject-selection/subject-selection.component';


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
    StudentRegistrationComponent,
    DashboardComponent,
    AdminStudentComponent,
    AdminTutorComponent,
    TutorRegistrationComponent,
    AvailabilitySelectionComponent,
    TutorSelectionComponent,
    NotificationsComponent,
    EventComponent,
    CreateEventComponent,
    EventRequestComponent,
    ZoomConnectionComponent,
    UserProfileComponent,
    GroupByPipe,
    TutorDetailComponent,
    ClassMetadataComponent,
    MeetingsComponent,
    SubjectSelectionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,   
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        deps: [Injector],
        useFactory: getTokenFactory
      }
    }),
    DialogModule,
    FontAwesomeModule,
    
    //Syncfussion Module
    GridModule,
    ButtonModule,
    DialogModule,
    DropDownListModule,
    ScheduleModule,
    
  ],
  exports: [RouterModule],
  providers: [NotificationsService, JwtHelperService,
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
