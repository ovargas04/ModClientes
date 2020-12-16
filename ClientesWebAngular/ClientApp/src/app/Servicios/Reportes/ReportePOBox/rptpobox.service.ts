import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IRptObox } from '../../../model/Reportes/Rptobox/IRptobox';

@Injectable({
  providedIn: 'root',
})
export class RptOboxService {
  constructor(private http: HttpClient) { }

  async ObtenerReportes(model: string, url: string, options: any): Promise<any> {
    return await this.http.post<IRptObox>(url, model, options).toPromise();
  }
}
