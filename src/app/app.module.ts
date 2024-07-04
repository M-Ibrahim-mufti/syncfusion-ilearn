import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { createCustomElement } from '@angular/elements';
import { StepsModule } from 'primeng/steps';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { AuthComponent } from './components/common_components/auth/auth.component';
import { NotificationsService } from '../services/Shared/notifications.service';
import { JWT_OPTIONS, JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthConfig, AuthService } from '../services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { StudentRegistrationComponent } from './components/registaration/student_registration/student-registration.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DashboardComponent } from './components/common_components/dashboard/dashboard.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { TopBarComponent } from './components/common_components/top-bar/top-bar.component';
import { AsideBarComponent } from './components/common_components/aside-bar/aside-bar.component';
import { AdminStudentComponent } from './components/admin/student/student.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';

import { AuthGuard } from './authGuard';
import { DragDropModule } from 'primeng/dragdrop';
import { RippleModule } from 'primeng/ripple';
import { TutorRegistrationComponent } from './components/registaration/tutor_registration/tutor-registration.component';

import { AvailabilitySelectionComponent } from './components/tutor/availability-selection/availability-selection.component';
import { TutorSelectionComponent } from './components/student/tutor-selection/tutor-selection.component';
import { AdminTutorComponent } from './components/admin/tutor/tutor.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventComponent } from './components/tutor/event/event.component';
import { CreateEventComponent } from './components/tutor/create-event/create-event.component';
// import { DialogModule } from 'primeng/dialog';
import { EventRequestComponent } from './components/common_components/event-request/event-request.component';
import { UserProfileComponent } from './components/common_components/user-profile/user-profile.component';
import { GroupByPipe } from './pipes/GroupBy.pipe';
import { ZoomConnectionComponent } from './components/tutor/zoom-connection/zoom-connection.component';
import { TutorDetailComponent } from './components/student/tutor-detail/tutor-detail.component';
import { ClassMetadataComponent } from './components/tutor/class-metadata/class-metadata.component';
import { MeetingComponent } from './components/common_components/meeting/meeting.component';
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
    allowedDomains: ['localhost:44303']
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
    MeetingComponent,
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
    NgxSpinnerModule,
    ConfirmDialogModule,
    // ButtonModule,
    TableModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    MultiSelectModule,
    PanelModule,
    ToolbarModule,
    MenuModule,
    FileUploadModule,
    ToastModule,
    RippleModule,
    StepsModule,
    RatingModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    AutoCompleteModule,
    CheckboxModule,
    TabViewModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    DragDropModule,
    SelectButtonModule,
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
    ScheduleModule 
  ],
  exports: [RouterModule],
  providers: [NgxSpinnerService, NotificationsService,ConfirmationService, JwtHelperService,
     MessageService, AuthConfig, AuthService, AuthGuard,

     //syncfussion providers
     PageService,
     SortService,
     EditService
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
