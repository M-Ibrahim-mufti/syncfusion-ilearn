import { Injectable } from '@angular/core';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private spinnerContainerId = 'spinner-container';
  private overlayId = 'spinner-overlay';

  constructor() {
    this.initSpinner();
  }

  private initSpinner(): void {
    const overlay = document.createElement('div');
    overlay.id = this.overlayId;
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; // Lighten the background color if needed
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.zIndex = '999'; // Ensure the overlay is below the spinner
    overlay.style.display = 'none'; // Initially hidden
    document.body.appendChild(overlay);

    const spinnerContainer = document.createElement('div');
    spinnerContainer.id = this.spinnerContainerId;
    spinnerContainer.style.position = 'fixed';
    spinnerContainer.style.top = '50%';
    spinnerContainer.style.left = '50%';
    spinnerContainer.style.transform = 'translate(-50%, -50%)';
    spinnerContainer.style.zIndex = '1000'; // Above the overlay
    document.body.appendChild(spinnerContainer);

    createSpinner({ target: spinnerContainer });
  }

  show(): void {
    const spinnerElement = document.getElementById(this.spinnerContainerId);
    const overlayElement = document.getElementById(this.overlayId);
    if (spinnerElement && overlayElement) {
      overlayElement.style.display = 'block';
      showSpinner(spinnerElement);
    } else {
      console.error('Spinner container or overlay not found');
    }
  }

  hide(): void {
    const spinnerElement = document.getElementById(this.spinnerContainerId);
    const overlayElement = document.getElementById(this.overlayId);
    if (spinnerElement && overlayElement) {
      hideSpinner(spinnerElement);
      overlayElement.style.display = 'none';
    } else {
      console.error('Spinner container or overlay not found');
    }
  }
}
