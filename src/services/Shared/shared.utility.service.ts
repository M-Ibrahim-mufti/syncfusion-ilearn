import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { timer } from 'rxjs/internal/observable/timer';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Injectable()
export class SharedUtilityService implements  OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private oneSecondTimerSubscription!: Subscription;
    private $notifyOneSecondTimer = new Subject<void>();

    constructor(private zone: NgZone) {
        this.executeOneSecondTimer();
    }

    private executeOneSecondTimer(): void {
        this.oneSecondTimerSubscription = timer(1000, 1000).pipe(takeUntil(this.ngUnsubscribe)).subscribe((ticks: number) => {
          //by default, somehow the code below must be wrapped inside the zone.run call and if we won't,
          //any bindings or assignments inside the calls that are attached to this observable won't be updating the views
          //for example, the timers won't update the UIs even after the variables are updated every second
          //the reason is, this runs outside the angular zone somehow
          this.zone.run(()=> {
            this.$notifyOneSecondTimer.next();
          });
        });
    }
    
    public get attachNotifyOneSecondTimerObservable(): Observable<void> {
        return this.$notifyOneSecondTimer.asObservable();
    }

    public ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        if (this.oneSecondTimerSubscription) {
            this.oneSecondTimerSubscription.unsubscribe();
        }
        //destroy the one second timer subject
        this.$notifyOneSecondTimer.next();
        this.$notifyOneSecondTimer.complete();
    }
}