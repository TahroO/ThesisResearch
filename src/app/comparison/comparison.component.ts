import { Component } from '@angular/core';
import {ObservableVersionComponent} from '../observable-version/observable-version.component';
import {SignalVersionComponent} from '../signal-version/signal-version.component';

@Component({
  selector: 'app-comparison',
  imports: [
    ObservableVersionComponent,
    SignalVersionComponent
  ],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent {

}
