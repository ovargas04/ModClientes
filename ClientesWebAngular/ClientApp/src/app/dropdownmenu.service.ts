import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IDropDownMenu } from './model/IDropDownMenu';

@Injectable({
  providedIn: 'root',
})
export class DropDownMenuService {
  private modelDropDownMenu = new Subject<IDropDownMenu>();
  model$ = this.modelDropDownMenu.asObservable();
  constructor() { }
  show(model?: IDropDownMenu) {
    this.modelDropDownMenu.next(model);
  }
}
