import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, AuthService, ResponseObject } from '../../../../services/auth.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { TutorService } from '../../../../services/tutor.service';
import { SelectItem } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit {
  public isAuthenticated!: boolean;
  public isAdministrator!: boolean;
  public firstName!: string;
  public UserEmail!: string;
  public userLogoUrl!: string;
  public authConfig!: AuthConfig;
  public ImgUrl!: string;
  public userDropDownData: SelectItem[] = [];
  public selectedRole: string | undefined;
  public roles: SelectItem[] = [
    {
      label:"Select Account Type",
      value:"-1"
    },
    {
      label: 'As an Tutor',
      value: 'Tutor',
    },
    {
      label: 'As a Student',
      value: 'Student',
    },
  ]
  public isDropdownOpen: boolean = false;
  public viewingRoleAsAdmin: boolean = false;
  
  public Sidebar:boolean = true

  @Output() SidebarToggle: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(private spinnerService: SpinnerService,
    private authService: AuthService,
    private tutorService: TutorService,
    private studentService: StudentService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdministrator = this.authService.isAdministrator();

    if (this.isAuthenticated) {
      this.viewingRoleAsAdmin = this.authService.isViewingAsAdministrator();
      this.authConfig = this.authService.getAuthConfig();
      var currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        this.firstName = currentUser.FullName;
        this.UserEmail = currentUser.EmailAddress;
        this.ImgUrl = currentUser.ImgUrl;
      }
      this.getAllTutors();
    }
  }
  
  toggleDropdown(event: Event): void {
    event.preventDefault();
    const dropdownMenu = (event.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
    dropdownMenu.classList.toggle('show');
  }
  public logout($event: any) {
    this.authService.logout().subscribe(async (res) => {
      await this.router.navigate(['/'])
      window.location.reload();
    });
  }  

  private getAllTutors() {
    this.spinnerService.show();
    this.tutorService.fetchTutorDropdownData().subscribe((tutors: SelectItem[]) => {
      this.userDropDownData = tutors;
      this.userDropDownData.unshift({
        label:'Select Account',
        value:'-1'
      })
      this.spinnerService.hide();
    }, (error) => { });
  }

  private getAllStudent() {
    this.spinnerService.show();
    this.studentService.fetchStudentDropdownData().subscribe((tutors: SelectItem[]) => {
      this.userDropDownData = tutors;
      this.userDropDownData.unshift({
        label:'Select Account',
        value:'-1'
      })
      this.spinnerService.hide();
    }, (error) => { });
  }

  public onselectedId($event: any) {
    
    if ($event && $event.target.value) {
      this.switchAccount($event.target.value);
    }
    else {
      this.isDropdownOpen = false;
    }
  }

  public onselectRole($event: any) {
    this.selectedRole = $event.target.value;
    console.log($event.target.value);
    
    if (this.selectedRole === 'Tutor') {
      this.isDropdownOpen = true;
      this.getAllTutors();
    } else if (this.selectedRole === 'Student') {
      this.isDropdownOpen = true;
      this.getAllStudent();
    }
  }

  private switchAccount(data: string): void {
    this.spinnerService.show();
    this.authService.switchAccount(data).subscribe(
      (response) => {
        console.log(response);

        this.spinnerService.hide();
        if (response.Success) {
          this.router.navigate(['/dashboard']).then(() => {
            location.reload();
          });
          return;
        }
        // this.notificationsService.showNotification('Error', response.ResponseMessage, NotificationTypes.Error);
      },
      (error) => {
        console.error(error);
        this.spinnerService.hide();
      }
    );
  }

  public exitRoleView($event: any) {
    this.authService.exitAccount().subscribe((response: ResponseObject) => {
      this.spinnerService.hide();
      if (response.Success) {
        this.router.navigate(['/dashboard']).then(() => {
          location.reload();
        });
        return;
      }
      // this.notificationsService.showNotification('Error', response.ResponseMessage, NotificationTypes.Error);
    },
      (error) => {
        console.error(error);
        this.spinnerService.hide();
      }
    );
  }


  public toggleSidebar () {
    this.Sidebar = !this.Sidebar
    this.SidebarToggle.emit(this.Sidebar)
    const element = document.getElementById('tutorDetail-right-side') as HTMLElement
    if(this.Sidebar){
      element.classList.add('inner-right-col')
      element.classList.remove('inner-right-col-sidebar-collapse')
    } else {
      element.classList.remove('inner-right-col')
      element.classList.add('inner-right-col-sidebar-collapse')
    }
  }
}
