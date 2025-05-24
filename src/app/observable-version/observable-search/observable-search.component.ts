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
  private searchTermSubject = new BehaviorSubject<string>("");
  protected products$: Observable<Product[]> | undefined;
  protected filteredProducts$: Observable<Product[]> | undefined;
  protected searchInput = "";
  constructor() {
  }

  ngOnInit(): void {
    this.products$ = this.productService.getProducts();
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchTermSubject.pipe(startWith(""))
    ]).pipe(map(([products, term]) =>
        products.filter(product =>
          product.name.toLowerCase().includes(term.toLowerCase())
        )
      )
    );
  }

  onSearch(searchTerm: string) {
    this.searchTermSubject.next(searchTerm);
  }
}
