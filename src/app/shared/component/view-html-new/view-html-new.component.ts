import { AfterViewInit, Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CKEditorComponent } from 'ng2-ckeditor';

@Component({
  selector: 'app-view-html-new',
  templateUrl: './view-html-new.component.html',
  styleUrls: ['./view-html-new.component.scss']
})
export class ViewHtmlNewComponent implements AfterViewInit {
  @ViewChild('editor1') editor: CKEditorComponent | undefined;
  @Input() html = null;
  @Input() readonly = true;
  public editorConfig = {
    toolbar: false,
  };
  ckeConfig: CKEDITOR.config = {
    readOnly: true
  };

  ngAfterViewInit() {
    if (this.editor) {
      this.editor.instance.on('instanceReady', () => {
        this.applyCustomStyles();
      });
    }
  }

  applyCustomStyles() {
    if (this.editor) {
      const iframe = this.editor.instance.window.getFrame().$ as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        const body = iframeDoc.body;
        body.style.backgroundColor = 'transparent';
        body.style.margin = '0px';
      }
    }
  }
}
