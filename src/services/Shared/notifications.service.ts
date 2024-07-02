import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { NotificationTypes } from '../../app/app.enums';
type Severities = 'success' | 'info' | 'warn' | 'error';

@Injectable()
export class NotificationsService {
  notificationChange: Subject<Object> = new Subject<Object>();

  public showNotification(title: string, message: string, notificationType: NotificationTypes): void {
    if (notificationType === NotificationTypes.Success) {
      this.notify('success', title, message);
    } else if (notificationType === NotificationTypes.Info) {
      this.notify('info', title, message);
    } else if (notificationType === NotificationTypes.Alert) {
      this.notify('warn', title, message);
    } else if (notificationType === NotificationTypes.Error) {
      this.notify('error', title, message);
    }
  }

  private notify(severity: Severities, summary: string, detail: string) {
    this.notificationChange.next({ severity, summary, detail });
  }
}