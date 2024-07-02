import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { ZoomMeetingService } from '../../../../services/zoom-meeting.service';

@Component({
  selector: 'app-zoom-meeting',
  standalone: true,
  imports: [],
  templateUrl: './zoom-meeting.component.html',
  styleUrl: './zoom-meeting.component.css',
  providers: [ZoomMeetingService]
})
export class ZoomMeetingComponent implements OnInit {
  public code!: string;
  public zoomAccessToken!: string;

  constructor( private route: ActivatedRoute, private zoomMeetingService: ZoomMeetingService){}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.route.queryParams.subscribe(params => {
        this.code = params['code'];
      });
    });

    if(this.code){
      this.callBack(this.code);
    }    
  }

  private callBack(code: string){
    this.zoomMeetingService.Callback(code).subscribe(res => {
      const token = res.ResponseData;
      this.zoomAccessToken = token.Access_token;
    })
  }
}
