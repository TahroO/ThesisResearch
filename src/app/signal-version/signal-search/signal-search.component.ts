import {Component, computed, effect, inject, signal} from '@angular/core';
import {Product} from '../../model/product';
import {ProductService} from '../../service/productService';
import {NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-signal-search',
  imports: [
    NgForOf,
    FormsModule
  ],
  templateUrl: './signal-search.component.html',
  styleUrl: './signal-search.component.css'
})
/**
 * Represents a signal version of a product search component
 */
export class SignalSearchComponent {
  private productService = inject(ProductService);
  // local states ui-bindings
  protected searchTerm: string = "";
  protected availability: boolean = false;
  protected category: string = "";
  // applied filter states after button event
  protected appliedSearchTerm = signal<string>("");
  protected appliedAvailability = signal<boolean>(false);
  protected appliedCategory = signal<string>("");
  // counter for executions of recomputation after event
  protected counter = signal<number>(0);

  constructor() {
  }

  // gathered data resources from asynchronous http request
  protected products = toSignal(
    this.productService.getProducts(),
    {initialValue: [] as Product[]}
  );
  protected categories = computed(() => [
    ...new Set(this.products().map(p => p.category))
  ]);

  // this triggers once on initialization and afterward only if a filter signal changed
  protected filteredProducts = computed(() => {
    const term = this.appliedSearchTerm().toLowerCase();
    return this.products().filter(product =>
      product.name.toLowerCase().includes(term) &&
      (!this.appliedAvailability() || product.available) &&
      (this.appliedCategory() === "" || product.category === this.appliedCategory())
    )
  });

  // applies filter values from template - set() only executes after internal equal() === false
  protected applyFilter() {
    this.appliedSearchTerm.set(this.searchTerm);
    this.appliedAvailability.set(this.availability);
    this.appliedCategory.set(this.category);
  };

  // triggers effect when computed is reevaluated - only for evaluation
  protected countComputed = effect(() => {
    this.filteredProducts();
    this.counter.update(v => v + 1);
    console.log(`filteredProducts Signal recomputed ${this.counter()} times`);
  });

}
