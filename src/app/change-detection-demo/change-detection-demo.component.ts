import {Component, signal} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {TileContainerComponent} from './tile-container/tile-container.component';

@Component({
  selector: 'app-change-detection-demo',
  imports: [
    FormsModule,
    TileContainerComponent
  ],
  templateUrl: './change-detection-demo.component.html',
  styleUrl: './change-detection-demo.component.css'
})
export class ChangeDetectionDemoComponent {

  mode: "observable" | "signal" = "observable";

  protected signalA = signal<number>(0);
  signalB = signal<number>(0);
  signalC = signal<number>(0);
  signalD = signal<number>(0);

  observableA$ = new BehaviorSubject<number>(0);
  observableB$ = new BehaviorSubject<number>(0);
  observableC$ = new BehaviorSubject<number>(0);
  observableD$ = new BehaviorSubject<number>(0);

  constructor() {
  }

  get tileAValue() {
    return this.mode === "signal" ? this.signalA() : this.observableA$.value;
  }
  get tileBValue() {
    return this.mode === "signal" ? this.signalB() : this.observableB$.value;
  }
  get tileCValue() {
    return this.mode === "signal" ? this.signalC() : this.observableC$.value;
  }
  get tileDValue() {
    return this.mode === "signal" ? this.signalD() : this.observableD$.value;
  }
  updateTileA() {
    this.mode === 'signal' ? this.signalA.set(this.signalA() + 1)
      : this.observableA$.next(this.observableA$.value + 1);
  }
  updateTileB() {
    this.mode === 'signal' ? this.signalB.set(this.signalB() + 1)
      : this.observableB$.next(this.observableB$.value + 1);
  }
  updateTileC() {
    this.mode === 'signal' ? this.signalC.set(this.signalC() + 1)
    : this.observableC$.next(this.observableC$.value + 1);
  }
  updateTileD() {
    this.mode === 'signal' ? this.signalD.set(this.signalD() + 1)
      : this.observableD$.next(this.observableD$.value + 1);
  }
}
