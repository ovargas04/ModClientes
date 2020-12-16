import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IOverlay } from '../model/IOverlay';
import { OverlayService } from '../overlay.service';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css'],
})
export class OverlayComponent implements OnDestroy  {
  private destroy$: Subject<void> = new Subject<void>();
  _overlay: IOverlay = { message: 'Cargando overlay default...', show: false };

  constructor(private overlayService: OverlayService) {
    this.overlayService.model$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
      (over) => {
        this._overlay = over;
      });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }
}
