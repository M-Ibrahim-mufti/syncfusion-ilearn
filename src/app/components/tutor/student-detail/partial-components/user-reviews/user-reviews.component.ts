import {Component, OnInit} from '@angular/core';
import {ReviewService} from "../../../../../../services/review.service";
import {ActivatedRoute} from "@angular/router";
import { RatingModule } from '@syncfusion/ej2-angular-inputs';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SkeletonModule} from "@syncfusion/ej2-angular-notifications";

@Component({
  selector: 'app-user-reviews',
  standalone: true,
  imports: [CommonModule, RatingModule, ReactiveFormsModule, FormsModule, SkeletonModule],
  templateUrl: './user-reviews.component.html',
  styleUrl: './user-reviews.component.css'
})
export class UserReviewsComponent implements OnInit {
  reviews:any;
  userId:string | null = null;
  reviewsLoaded:boolean = false;
  constructor(
      private route: ActivatedRoute,
      private reviewService:ReviewService
  ) {}
  ngOnInit(){
    this.userId = this.route.snapshot.paramMap.get('userId');
    if(this.userId){
      setTimeout(() => {
        this.getReviews()
      }, 5000)

    }
  }
  getReviews(){
    this.reviewService.getReviewsByStudentId(this.userId!).subscribe(response => {
      this.reviews = response;
      this.reviewsLoaded = true;
    })
  }
}
