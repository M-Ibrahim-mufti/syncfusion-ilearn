import { Routes } from '@angular/router';
import { AuthComponent } from './components/common_components/auth/auth.component';
import { DashboardComponent } from './components/common_components/dashboard/dashboard.component';
import { AdminStudentComponent } from './components/admin/student/student.component';
import { AuthGuard } from './authGuard';
import { TutorSelectionComponent } from './components/student/tutor-selection/tutor-selection.component';
import { AdminTutorComponent } from './components/admin/tutor/tutor.component';
import { AvailabilitySelectionComponent } from './components/tutor/availability-selection/availability-selection.component';
import { EventComponent } from './components/tutor/event/event.component';
import { ZoomMeetingComponent } from './components/common_components/zoom-meeting/zoom-meeting.component';
import { EventRequestComponent } from './components/common_components/event-request/event-request.component';
import { UserProfileComponent } from './components/common_components/user-profile/user-profile.component';
import { TutorDetailComponent } from './components/student/tutor-detail/tutor-detail.component';
import { ClassMetadataComponent } from './components/tutor/class-metadata/class-metadata.component';
import { MeetingsComponent } from './components/common_components/meeting/meeting.component';



export const routes: Routes = [
    { 
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full' 
    },
    { 
        path: 'login', 
        component: AuthComponent 
     },
    // { 
    //     path: 'register/student',
    //     component: StudentRegistrationComponent 
    // },
    // { 
    //     path: 'register/tutor',
    //     component: TutorRegistrationComponent 
    // },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'admin/view',
        component: AdminStudentComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin/tutor',
        component: AdminTutorComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tutor/availabilaity',
        component: AvailabilitySelectionComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'events',
        component: EventComponent,
        canActivate: [AuthGuard]
    },
    // {
    //     path: 'tutor/event/add',
    //     component: CreateEventComponent,
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'student/tutor-selection',
        component: TutorSelectionComponent,
        canActivate: [AuthGuard]
    },
    // {
    //     path: 'student/event/add',
    //     component: CreateEventComponent,
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'tutor/requests',
        component: EventRequestComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'connect-with-zoom',
        component: ZoomMeetingComponent
    },
    { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [AuthGuard]
    },
    { 
        path: 'admin/view', 
        component: AdminStudentComponent, 
        canActivate: [AuthGuard]
    },
    { 
        path: 'admin/tutor', 
        component: AdminTutorComponent,
        canActivate: [AuthGuard]
    },
    { 
        path: 'tutor/availabilaity', 
        component: AvailabilitySelectionComponent
    },
    { 
        path: 'classes', 
        component: EventComponent
    },
    { 
        path: 'student/tutor-selection', 
        component: TutorSelectionComponent
    },
    { 
        path: 'tutor/requests', 
        component: EventRequestComponent
    },
    { 
        path: 'connect-with-zoom',
        component: ZoomMeetingComponent
    },
    { 
        path: 'profile', 
        component:UserProfileComponent
    }, 
    {
        path: 'student/tutor-detail/:id',
        component:TutorDetailComponent
    }, 
    {
        path: 'tutor/class-metadata',
        component:ClassMetadataComponent
    },
    {
        path: 'meeting',
        component:MeetingsComponent
    }
];
