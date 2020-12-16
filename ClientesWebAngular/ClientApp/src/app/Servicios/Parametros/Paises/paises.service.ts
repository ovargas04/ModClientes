import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPais } from '../../../model/Parametros/Productos/IPais';
@Injectable({
  providedIn: 'root',
})
export class PaisesService {
  constructor(private http: HttpClient) { }

  async ObtenerPaises(model: string, url: string, options: any): Promise<any> {
    return await this.http.post<IPais>(url, model, options).toPromise();
  }

}
