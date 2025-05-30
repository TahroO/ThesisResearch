import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-tile-component',
  imports: [],
  templateUrl: './tile-component.html',
  styleUrl: './tile-component.css'
})
export class TileComponent {
  @Input() value: number | undefined;
  @Input() label: string = "";
  @Input() mode: "observable" | "signal" = "observable";

  protected updateCounter: number = 0;
  protected renderCounter: number = 0;
  protected active: boolean = false;

  constructor() {
  }

  // ngDoCheck(): void {
  //       this.flash();
  //       console.log("Checked!")
  //   this.renderCounter++;
  //   }
  // ngOnChanges(changes: SimpleChanges): void {
  //   // this.renderCounter++;
  //   // if (this.mode === "observable") {
  //   //
  //   //   this.updateCounter++;
  //   //   this.flash();
  //   //
  //   // } else {
  //     if (changes['value']) {
  //
  //       this.updateCounter++;
  //       this.flash();
  //
  //     }
  //   };
  // };

  private flash() {
    this.active = true;
    setTimeout(() => (this.active = false), 400);
  }
}
