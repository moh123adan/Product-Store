// src/types.ts
import db from './db.json';

export interface Item {
    id: number;
    image: string;
    name: string;
    price: string;
    rating: number;
  }
  
  export interface Data {
    items: Item[];
  }
  