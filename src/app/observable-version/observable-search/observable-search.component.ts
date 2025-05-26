import {Component, inject, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, startWith} from 'rxjs';
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
export class ObservableSearchComponent implements OnInit {
  private productService = inject(ProductService);
  protected searchTermSubject = new BehaviorSubject<string>("");
  protected availabilitySubject = new BehaviorSubject<boolean>(false);
  protected categorySubject = new BehaviorSubject<string>("");
  protected products$: Observable<Product[]> | undefined;
  protected filteredProducts$: Observable<Product[]> | undefined;
  protected categories: string[] = [];

  constructor() {};

  // makes sure all data is available as this is async --> combineLatest
  ngOnInit(): void {
    this.products$ = this.productService.getProducts();
    this.products$.subscribe(products => {
      this.categories = [...new Set(products.map(p => p.category))];
    });
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchTermSubject,
      this.availabilitySubject,
      this.categorySubject
    ]).pipe(map(([products, term, onlyAvailable, selectedCategory]) =>
        products.filter((product) =>
          product.name.toLowerCase().includes(term.toLowerCase()) &&
          (!onlyAvailable || product.available) &&
          (selectedCategory === "" || product.category === selectedCategory)
        )
      )
    );
  };
}
