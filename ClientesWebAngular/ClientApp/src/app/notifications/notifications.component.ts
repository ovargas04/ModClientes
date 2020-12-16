import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { INotification } from '../model/INotification';
import { OverlayService } from '../notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  _notification: INotification = { isShowError: false, isShowingErrors: false };
  constructor(private notificationService: OverlayService) {
    notificationService.model$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
      (dropdown) => {
        this._notification = dropdown;
      });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClick(element): void {
    if (element.isShowingErrors) {
      element.isShowingErrors = false;
    } else {
      element.isShowingErrors = true;
    }
  }
}
