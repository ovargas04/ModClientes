import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAlianza } from '../../../model/Parametros/Alianzas/IAlianza';

@Injectable({
  providedIn: 'root',
})
export class AlianzasService {
  constructor(private http: HttpClient) { }

  async ObtenerAlianzas(model: string, url: string, options: any): Promise<any> {
    return await this.http.post<IAlianza>(url, model, options).toPromise();
  }
}
