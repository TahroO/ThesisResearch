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
  // local states ui-bindings
  protected searchTerm: string = "";
  protected availability: boolean = false;
  protected category: string = "";
  // applied filter states after button event
  protected appliedSearchTerm = new BehaviorSubject<string>("");
  protected appliedAvailability = new BehaviorSubject<boolean>(false);
  protected appliedCategory = new BehaviorSubject<string>("");
  // initialization for data resources
  protected products$: Observable<Product[]> | undefined;
  protected filteredProducts$: Observable<Product[]> | undefined;
  protected categories: string[] = [];
  // counter for executions of recomputation after event
  protected counter: number = 0;

  constructor() {
  };

  // gathered data resources from asynchronous http request
  ngOnInit(): void {
    this.products$ = this.productService.getProducts();
    const subscribedProducts = this.products$.subscribe(products => {
      this.categories = [...new Set(products.map(p => p.category))];
    });
    this.subscription.add(subscribedProducts);
    // each behaviorSubject will trigger this evaluation after next() was emitted
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.appliedSearchTerm,
      this.appliedAvailability,
      this.appliedCategory
    ]).pipe(
      map(([products, term, onlyAvailable, selectedCategory]) => {
        this.countCombineLatest();
        return products.filter(product =>
          product.name.toLowerCase().includes(term.toLowerCase()) &&
          (!onlyAvailable || product.available) &&
          (selectedCategory === "" || product.category === selectedCategory)
        );
      })
    );
  }
  // cleanup - prevent memory leaks - after component is destroyed
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // applies filter values from template - next() always executes when function is triggered
  protected applyFilter() {
    this.appliedSearchTerm.next(this.searchTerm);
    this.appliedAvailability.next(this.availability);
    this.appliedCategory.next(this.category);
  };

  // triggers counter when combineLatest is reevaluated - only for evaluation
  protected countCombineLatest() {
    this.counter++;
    console.log(`filteredProducts$ Observable evaluation used ` + this.counter + ' times');
  }
}
