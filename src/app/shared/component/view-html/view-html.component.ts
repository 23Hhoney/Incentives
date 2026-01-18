import { Component, Input } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-view-html',
  templateUrl: './view-html.component.html',
  styleUrls: ['./view-html.component.scss']
})
export class ViewHtmlComponent {
  @Input() html = null;
  editor = ClassicEditor;
  @Input() readonly = true;
  public editorConfig = {
    toolbar: false,
  };
  
} 
