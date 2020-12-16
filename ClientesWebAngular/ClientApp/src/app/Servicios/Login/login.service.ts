import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUsuario } from '../../model/IUsuario';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) { }

  async login(model: string, url: string, options: any): Promise<any> {
    return await this.http.post<IUsuario>(url, model, options).toPromise();
  }
}
