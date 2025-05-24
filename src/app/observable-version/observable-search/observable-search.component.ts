import {Component, inject, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, startWith} from 'rxjs';
import {Product} from '../../model/product';
import {ProductService} from '../../service/productService';
import {AsyncPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-observable-search',
  imports: [
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './observable-search.component.html',
  styleUrl: './observable-search.component.css'
})
export class ObservableSearchComponent implements OnInit{

  private searchTermSubject = new BehaviorSubject<string>("");

  protected products$: Observable<Product[]> | undefined;

  protected filteredProducts$: Observable<Product[]> | undefined;


  constructor(private productService: ProductService) {
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

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value
    this.searchTermSubject.next(value);
  }

}
