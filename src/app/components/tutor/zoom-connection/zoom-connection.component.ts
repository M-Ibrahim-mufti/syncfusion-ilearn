import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { ZoomMeetingService } from '../../../../services/zoom-meeting.service';

@Component({
  selector: 'app-zoom-connection',
  templateUrl: './zoom-connection.component.html',
  styleUrl: './zoom-connection.component.css'
})
export class ZoomConnectionComponent {

  @ViewChild('dt1') dt1: Table | undefined;
  public authConfig!: AuthConfig;
  zoomUserObject!:any;

  constructor(
    private authService: AuthService,
    private zoomMeetingService: ZoomMeetingService,
  ){
    this.authConfig = this.authService.getAuthConfig();
  }

  ngOnInit(){
    this.getConnections()
  }

  onInput(event: any): void {
    const value = event.target.value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  getConnections(){
    this.zoomMeetingService.getConnectionsWithZoom().subscribe(
      reposne => {
        this.zoomUserObject = reposne
        console.log(this.zoomUserObject)
      }
    )
  }

  public connectWithZoom() {
    this.zoomMeetingService.ConnectWithZoom().subscribe((res: string) => {
      window.location.href = res;
    }, (error) => {
      console.error('Authorization error:', error);
    }
    );
  }

  disconnectZoomAccount(){
    this.zoomMeetingService.disconnectZoomAccount().subscribe(
      response => {
        console.log(response)
      }
    )
  }

}
