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

  searchTerm = "";
  availability = false;
  category = "";

  protected appliedSearchTerm = signal<string>("");
  protected appliedAvailability = signal<boolean>(false);
  protected appliedCategory = signal<string>("");

  protected products = signal<Product[]>([]);
  protected categories = signal<string[]>([]);

  constructor() {
    this.productService.getProducts().subscribe(products => {
      this.products.set(products);
      this.categories.set([...new Set(products.map(p => p.category))]);
    });
  }

  protected filteredProducts = computed(() => {
    const term = this.appliedSearchTerm().toLowerCase();
    console.warn(`filteredProducts Signal recomputed`);
    return this.products().filter(product =>
    product.name.toLowerCase().includes(term) &&
      (!this.appliedAvailability() || product.available) &&
      (this.appliedCategory() === "" || product.category === this.appliedCategory())
    )
  });

  applyFilter() {
    this.appliedSearchTerm.set(this.searchTerm);
    this.appliedAvailability.set(this.availability);
    this.appliedCategory.set(this.category);
  };
}
