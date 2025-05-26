import {Component, computed, inject, signal} from '@angular/core';
import {Product} from '../../model/product';
import {ProductService} from '../../service/productService';
import {NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-signal-search',
  imports: [
    NgForOf,
    FormsModule
  ],
  templateUrl: './signal-search.component.html',
  styleUrl: './signal-search.component.css'
})
export class SignalSearchComponent {
  private productService = inject(ProductService);
  protected searchTermSignal = signal<string>("");
  protected availabilitySignal = signal<boolean>(false);
  protected categorySignal = signal<string>("");
  protected products = signal<Product[]>([]);
  protected categories = signal<string[]>([]);

  constructor() {
    this.productService.getProducts().subscribe(products => {
      this.products.set(products);
      this.categories.set([...new Set(products.map(p => p.category))]);
    });
  };

  protected filteredProducts = computed(() => {
    const term = this.searchTermSignal().toLowerCase();
    return this.products().filter(product =>
    product.name.toLowerCase().includes(term) &&
      (!this.availabilitySignal() || product.available) &&
      (this.categorySignal() === "" || product.category === this.categorySignal())
    )
  });
}
