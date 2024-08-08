import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReviewService } from '../../../../../services/review.service';

@Component({
  selector: 'app-show-reviews',
  templateUrl: './show-reviews.component.html',
  styleUrl: './show-reviews.component.css'
})
export class ShowReviewsComponent {
  @Input() ShowReviews:boolean = false
  @Input() Reviews:any[] = [];
  @Output() ResetReviewBox: EventEmitter<boolean> = new EventEmitter<boolean>();
  public reviews:any[] = [];
  public todayDate:Date = new Date();
  

  constructor( private reviewService:ReviewService) {

  }

  ngOnInit(){
    if(this.ShowReviews && this.Reviews) {
      this.showReviews()
    }
  }

  closeDialog() {
    this.ResetReviewBox.emit(false)
  }

  showReviews() {
    setTimeout(() => {
      this.changeStarColors();
    },200)
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
