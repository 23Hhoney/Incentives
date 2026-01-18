import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss']
})
export class WidgetsComponent {
    @Input() container: any;
    @Input() pieChartData: any[] = [];
    @Input() lineChartData: any;
    @Input() notifications: any;
    @Input() curriculumData: any[] = [];
    @Input() totalCourse: number = 0;
    @Input() totalAttempted: number = 0;
    @Input() transactionData: any[] = [];
    @Input() ytdSales: number = 0;
    @Input() remainingPoints: number = 0;
    @Input() totalSales: number = 0;
    @Input() targetValue: number = 0;
    @Input() isSalesSelected: boolean = false;
  
    // Chart configurations
    view: [number, number] = [300, 300];
    colorScheme = { domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] };
    isDoughnut = true;
    
    // CKEditor config
    ckeConfig = {
      toolbar: [
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'bulletedList', 'numberedList', '|',
        'undo', 'redo'
      ]
    };
  
    constructor(private sanitizer: DomSanitizer) {}
  
    // Utility methods
    sanitizeHtml(html: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }
  
    sanitizeVideoUrl(url: string): SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  
    calculateWidth(total: number, attempted: number): number {
      return total > 0 ? Math.round((attempted / total) * 100) : 0;
    }
  
    formatNumberWithCommas(num: number): string {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  
    toggleSalesGraph(checked: boolean): void {
      this.isSalesSelected = checked;
    }
  
    handleReadClick(notification: any): void {
      notification.isRead = !notification.isRead;
    }
  
    goToCourse(courseId: string, status: string): void {
      console.log(`Navigate to course ${courseId} with status ${status}`);
    }
  
    onDragMove(event: any, textItem: any): void {
      const container = document.querySelector('.carousel-item');
      if (container) {
        const rect = container.getBoundingClientRect();
        textItem.x = ((event.pointerPosition.x - rect.left) / rect.width) * 100;
        textItem.y = ((event.pointerPosition.y - rect.top) / rect.height) * 100;
      }
    }
}
