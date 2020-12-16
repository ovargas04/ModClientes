import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IOverlay } from './model/IOverlay';

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private modelOverlay = new Subject<IOverlay>();
  model$ = this.modelOverlay.asObservable();

  constructor() { }

  show(model?: IOverlay) {
    this.model$ = this.modelOverlay.asObservable();
    this.modelOverlay.next(model);
  }
}
