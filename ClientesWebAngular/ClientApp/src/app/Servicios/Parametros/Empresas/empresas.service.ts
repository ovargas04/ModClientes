import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEmpresa } from '../../../model/Parametros/Empresas/IEmpresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresasService {
  constructor(private http: HttpClient) { }

  async ObtenerSucursales(model: string, url: string, options: any): Promise<any> {
    return await this.http.post<IEmpresa>(url, model, options).toPromise();
  }
}
