import { Component } from '@angular/core';
import {ObservableSearchComponent} from '../observable-version/observable-search/observable-search.component';
import {ObservableFormComponent} from '../observable-version/observable-form/observable-form.component';
import {SignalSearchComponent} from '../signal-version/signal-search/signal-search.component';
import {SignalFormComponent} from '../signal-version/signal-form/signal-form.component';

@Component({
  selector: 'app-comparison',
  imports: [
    ObservableSearchComponent,
    ObservableFormComponent,
    SignalSearchComponent,
    SignalFormComponent
  ],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent {

}
