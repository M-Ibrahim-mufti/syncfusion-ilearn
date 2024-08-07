import {Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import {ReviewRequest, ReviewService} from "../../../../services/review.service";
import {SpinnerService} from "../../../../services/Shared/spinner.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  @Input() OpenReviewModal: boolean = false;
  @Input() MeetingDetails: any = {};
  public review: ReviewRequest = {} as ReviewRequest;
  public authConfig!: AuthConfig;
  user:any;

  constructor(
      private authService: AuthService,
      private reviewService: ReviewService,
      private spinnerService: SpinnerService,
      private toastrService: ToastrService,
  ) {
    this.authConfig = this.authService.getAuthConfig();
  }

  ngOnInit() {
    if(this.MeetingDetails){
      this.getUserPreviousReview()
    }
    // this.getAverageRating();
  }

  public setReviewData() {
    this.spinnerService.show()
    const ratingElement = document.getElementById('rating') as HTMLInputElement;
    if (ratingElement) {
      this.review.Rating = Number(ratingElement.value);
    }
    this.review.MeetingId = this.MeetingDetails.meetingId;
    this.OpenReviewModal = false;
    this.reviewService.saveReview(this.review).subscribe(response => {
      if(response){
        this.toastrService.success('Thanks For Review')
      }
      this.spinnerService.hide()
    })
  }

  getUserPreviousReview(){
    this.reviewService.getUserPreviousReview(this.MeetingDetails.meetingId).subscribe(response => {     
      this.user = response;      
    })
  }

  getImage(img:string) {
    return `#f1f1f1 url(${img}) no-repeat center/cover`;
  }

  private getAverageRating() {
    this.reviewService.getAverageRating(this.MeetingDetails.meetingId).subscribe(response => {
     console.log(response);
    })
  }
}
