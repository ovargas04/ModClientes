import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { INotification } from './model/INotification';

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private modelNotification = new Subject<INotification>();
  model$ = this.modelNotification.asObservable();

  constructor() { }

  show(model?: INotification) {
    this.modelNotification.next(model);
  }
}
