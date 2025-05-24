import { Component } from '@angular/core';
import {ObservableSearchComponent} from './observable-search/observable-search.component';
import {ObservableFormComponent} from './observable-form/observable-form.component';


@Component({
  selector: 'app-observable-version',
  imports: [
    ObservableSearchComponent,
    ObservableFormComponent
  ],
  templateUrl: './observable-version.component.html',
  styleUrl: './observable-version.component.css'
})
export class ObservableVersionComponent {

}
