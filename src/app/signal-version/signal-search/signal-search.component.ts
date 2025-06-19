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
  protected products = toSignal( // operator
    this.productService.getProducts(), // logicStep
    {initialValue: [] as Product[]}
  );
  protected categories = computed(() => [ // operator
    ...new Set(this.products().map(p => p.category)) // logicStep
  ]);

  // this triggers once on initialization and afterward only if a filter signal changed
  protected filteredProducts = computed(() => { // operator
    const term = this.appliedSearchTerm().toLowerCase(); // logicStep
    return this.products().filter(product => // logicStep
      product.name.toLowerCase().includes(term) && // logicStep
      (!this.appliedAvailability() || product.available) && // logicStep
      (this.appliedCategory() === "" || product.category === this.appliedCategory()) // logicStep
    )
  });

  // applies filter values from template - set() only executes after internal equal() === false
  protected applyFilter() {
    this.appliedSearchTerm.set(this.searchTerm); // logicStep
    this.appliedAvailability.set(this.availability); // logicStep
    this.appliedCategory.set(this.category); // logicStep
  };

  // triggers effect when computed is reevaluated - only for evaluation
  protected countComputed = effect(() => {
    this.filteredProducts();
    this.counter.update(v => v + 1);
    console.log(`filteredProducts Signal recomputed ${this.counter()} times`);
  });
}
