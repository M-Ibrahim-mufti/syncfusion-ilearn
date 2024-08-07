import {Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import {ReviewService} from "../../../../services/review.service";

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements AfterViewInit {
  @Input() OpenReviewModal: boolean = false;
  @Input() MeetingDetails: any = {};

  public review: any = {
    Rating: 0,
    Comment: '',
    meetingId: ''
  };

  public authConfig!: AuthConfig;

  constructor(private authService: AuthService, private reviewService: ReviewService) {
    this.authConfig = this.authService.getAuthConfig();
  }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.initializeReview();
  }

  private initializeReview() {
    if (this.authConfig.IsStudent) {
      this.review.tutorId = this.MeetingDetails.userId;
    } else if (this.authConfig.IsTeacher) {
      this.review.studentId = this.MeetingDetails.userId;
    }

    // Ensure MeetingDetails are properly set before accessing
    if (this.MeetingDetails) {
      this.review.meetingId = this.MeetingDetails.meetingId;
    }
  }

  public setReviewData() {
    const ratingElement = document.getElementById('rating') as HTMLInputElement;
    if (ratingElement) {
      this.review.Rating = Number(ratingElement.value);
    }
    if(this.authConfig.IsStudent){
      this.reviewService.saveReviewFromStudentForTutor(this.review).subscribe(response => {
        console.log(response)
      })
    }
    if(this.authConfig.IsTeacher){
      this.reviewService.saveReviewFromTutorForStudent(this.review).subscribe(response => {
        console.log(response)
      })
    }
  }
}
