import { Component } from '@angular/core';
import {SignalFormComponent} from './signal-form/signal-form.component';
import {SignalSearchComponent} from './signal-search/signal-search.component';


@Component({
  selector: 'app-signal-version',
  imports: [
    SignalFormComponent,
    SignalSearchComponent
  ],
  templateUrl: './signal-version.component.html',
  styleUrl: './signal-version.component.css'
})
export class SignalVersionComponent {

}
