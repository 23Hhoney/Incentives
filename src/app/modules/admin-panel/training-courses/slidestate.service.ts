import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SlideStateService {
  private selectedSlideId: string | null = null;

  setSelectedSlideId(id: string) {
    this.selectedSlideId = id;
  }

  getSelectedSlideId(): string | null {
    console.log('Getting selected slide ID from service:', this.selectedSlideId);
    return this.selectedSlideId;
  }
}

