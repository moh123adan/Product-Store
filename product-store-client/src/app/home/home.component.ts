import { Component } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Product, Products } from '../../types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(private productService: ProductsService) { }

  products: Product[] = [];

  ngOnInit() {
    this.productService
      .getProducts('http://localhost:3000/clothes', { page: 0, perPage: 5 })
      .subscribe((products: Products) => {
        this.products = products.items;

      });
  }
}
function products(value: Products): void {
  throw new Error('Function not implemented.');
}
