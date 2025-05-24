import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ComparisonComponent} from './comparison/comparison.component';

@Component({
  selector: 'app-root',
  imports: [ComparisonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ThesisResearch';
}
