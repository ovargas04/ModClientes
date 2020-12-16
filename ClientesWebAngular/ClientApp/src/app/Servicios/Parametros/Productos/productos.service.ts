import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProducto } from '../../../model/Parametros/Productos/IProducto';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(private http: HttpClient) { }

  async ObtenerProductos(model: string, url: string, options: any): Promise<any> {
    return await this.http.post<IProducto>(url, model, options).toPromise();
  }


}
