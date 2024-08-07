import {Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import {ReviewRequest, ReviewService} from "../../../../services/review.service";

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

  constructor(private authService: AuthService, private reviewService: ReviewService) {
    this.authConfig = this.authService.getAuthConfig();
  }

  ngOnInit() {
    this.getAverageRating();
  }

  public setReviewData() {
    const ratingElement = document.getElementById('rating') as HTMLInputElement;
    if (ratingElement) {
      this.review.Rating = Number(ratingElement.value);
    }
    this.review.MeetingId = this.MeetingDetails.meetingId;
    this.reviewService.saveReview(this.review).subscribe(response => {
      console.log(response);
    })
  }

  private getAverageRating() {
    this.reviewService.getAverageRating(this.MeetingDetails.meetingId).subscribe(response => {
     console.log(response);
     
    })
  }
}
