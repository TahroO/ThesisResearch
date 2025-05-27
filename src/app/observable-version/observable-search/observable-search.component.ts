import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, Subscription} from 'rxjs';
import {Product} from '../../model/product';
import {ProductService} from '../../service/productService';
import {AsyncPipe, NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-observable-search',
  imports: [
    NgForOf,
    AsyncPipe,
    FormsModule
  ],
  templateUrl: './observable-search.component.html',
  styleUrl: './observable-search.component.css'
})
/**
 * Represents an observable version of a product search component
 */
export class ObservableSearchComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private subscription = new Subscription();

  protected searchTerm = "";
  protected availability = false;
  protected category = "";

  protected appliedSearchTerm = new BehaviorSubject<string>("");
  protected appliedAvailability = new BehaviorSubject<boolean>(false);
  protected appliedCategory = new BehaviorSubject<string>("");

  protected products$: Observable<Product[]> | undefined;
  protected filteredProducts$: Observable<Product[]> | undefined;
  protected categories: string[] = [];

  constructor() {
  };

  // makes sure all data is available as this is async --> combineLatest
  ngOnInit(): void {
    this.products$ = this.productService.getProducts();
    const subscribedProducts = this.products$.subscribe(products => {
      this.categories = [...new Set(products.map(p => p.category))];
    });
    this.subscription.add(subscribedProducts);
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.appliedSearchTerm,
      this.appliedAvailability,
      this.appliedCategory
    ]).pipe(
      map(([products, term, onlyAvailable, selectedCategory]) => {
        console.log(`filteredProducts$ Observable recomputed`);
        return products.filter(product =>
          product.name.toLowerCase().includes(term.toLowerCase()) &&
          (!onlyAvailable || product.available) &&
          (selectedCategory === "" || product.category === selectedCategory)
        );
      })
    );
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected applyFilter() {
    this.appliedSearchTerm.next(this.searchTerm);
    this.appliedAvailability.next(this.availability);
    this.appliedCategory.next(this.category);
  };
}
