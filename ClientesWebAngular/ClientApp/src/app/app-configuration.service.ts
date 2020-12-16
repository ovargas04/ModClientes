import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAppConfig } from './model/IAppConfig';
import { IDataTableSet } from './model/IDataTableSet';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  static settings: IAppConfig;
  static DataTableSet: IDataTableSet;
  constructor(private http: HttpClient) { }
  load() {
    const jsonFile = './assets/config/configuracion.json';
    return new Promise<void>((resolve, reject) => {
      this.http.get(jsonFile).toPromise().then((response: IAppConfig) => {
        AppConfigService.settings = response as IAppConfig;
        resolve();
      }).catch((response: any) => {
        reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
      });
    });
  }

  loadDatatableConfig() {
    const jsonFile = './assets/config/configuracion-Spanishtable';
    return new Promise<void>((resolve, reject) => {
      this.http.get(jsonFile).toPromise().then((response: any) => {
        AppConfigService.DataTableSet = response as any;
        resolve();
      }).catch((response: any) => {
        reject(`Could not load file spanish table settings'${jsonFile}': ${JSON.stringify(response)}`);
      });
    });
  }
}
