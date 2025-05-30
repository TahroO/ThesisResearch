import { Component } from '@angular/core';
import {ComparisonComponent} from './comparison/comparison.component';
import {ChangeDetectionDemoComponent} from './change-detection-demo/change-detection-demo.component';

@Component({
  selector: 'app-root',
  imports: [ComparisonComponent, ChangeDetectionDemoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ThesisResearch';
}
