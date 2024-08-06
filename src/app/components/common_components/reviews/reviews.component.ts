import { Component, Input } from '@angular/core';
import { AuthConfig, AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent {
  @Input() OpenReviewModal!:boolean
  public review:any = {
    Rating:'',
    Comment:'',
    meetingId:''
  };

  public authConfig!: AuthConfig

  constructor( authService: AuthService ) {
    this.authConfig = authService.getAuthConfig();
    if (this.authConfig.IsStudent) {
      console.log('check student')
      this.review.tutorId = '';
    } else if(this.authConfig.IsTeacher) {
      console.log('checl tutor')
      this.review.studentId = '';
    } else {
      console.log("nothing")
    }
  }

  public getReviewData(){
    const rating = document.getElementById('rating') as HTMLInputElement;
    this.review.Rating = rating.value;
    console.log(this.review)
  }

}

