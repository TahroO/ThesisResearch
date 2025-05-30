import {Component, Input} from '@angular/core';
import {TileComponent} from '../tile-component/tile-component';

@Component({
  selector: 'app-tile-container',
  imports: [TileComponent],
  templateUrl: './tile-container.component.html',
  styleUrl: './tile-container.component.css'
})
export class TileContainerComponent {
  @Input() valueA: number | undefined
  @Input() valueB: number | undefined
  @Input() labelA!: string
  @Input() labelB!: string
}
