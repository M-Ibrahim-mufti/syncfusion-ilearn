import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs/internal/Subscription';
import { NotificationsService } from '../../../services/Shared/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: 'notifications.template.html'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;

  constructor(private notificationsService: NotificationsService,
    private messageService: MessageService) {
      this.subscription = new Subscription();
     }

  public ngOnInit() {
    this.subscribeToNotifications();
  }

  public subscribeToNotifications() {
    this.subscription = this.notificationsService.notificationChange.subscribe((notification: any) => {
      this.messageService.add({ severity: notification.severity, summary: notification.summary, detail: notification.detail });
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
