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
      this.getReviews()
    }
  }
  getReviews(){
    this.reviewService.getReviewsByStudentId(this.userId!).subscribe(async response => {
      this.reviews = await response;
      this.reviewsLoaded = true;
      setTimeout(() => {
        this.changeStarColors();
      },200)
    })
  }

  getImage(image:string) {
    return `#f1f1f1 url(${image}) no-repeat center/cover`
  }

  changeStarColors() {
    const stars = document.querySelectorAll('.e-rating-selected') as NodeList;
    stars.forEach((star) => {
      const selectedStar = star as HTMLElement;
      const computedStyle = getComputedStyle(selectedStar);
      const ratingValue = computedStyle.getPropertyValue('--rating-value');
      const ratingPercentage = parseFloat(ratingValue);
      const innerStar = selectedStar.querySelector('.e-rating-icon') as HTMLElement
      if (innerStar) {
        innerStar.style.background = `linear-gradient(to right, #ce9f30 ${ratingPercentage}%, transparent ${ratingPercentage}%)`;
        innerStar.style.backgroundClip = 'text';
        innerStar.style.webkitBackgroundClip = 'text';
        innerStar.style.webkitTextStroke ='1px #ce9f30';
      }
    })
  }
}
