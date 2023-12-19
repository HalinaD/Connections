import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  timer,
  takeUntil,
  Observable,
  map,
  Subscription,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService implements OnDestroy {
  private groupTimer$: BehaviorSubject<number> = new BehaviorSubject(0);
  private peopleTimer$: BehaviorSubject<number> = new BehaviorSubject(0);
  private subscriptions: { [key: string]: Subscription } = {};
  constructor() {}

  resumeUpdateTimer(
    updateType: 'group' | 'people',
    updateCountdown: number,
    callback: (countdown: number, isDisabled: boolean) => void,
  ): void {
    const lastUpdateTimeKey =
      updateType === 'group' ? 'lastGroupUpdate' : 'lastPeopleUpdate';
    const lastUpdateTime = parseInt(
      localStorage.getItem(lastUpdateTimeKey) ?? '0',
      10,
    );
    const currentTime = Date.now();
    let isDisabled = false;

    if (lastUpdateTime > 0) {
      const timePassed = currentTime - lastUpdateTime;
      if (timePassed < updateCountdown * 1000) {
        const countdownValue = updateCountdown - Math.floor(timePassed / 1000);
        isDisabled = true;
        this.startTimer(updateType, countdownValue);
      }
    }
    this.getTimer(updateType).subscribe({
      next: (countdown: number) => {
        isDisabled = countdown !== 0;
        callback(countdown, isDisabled);
      },
    });
  }

  startTimer(updateType: 'group' | 'people', countdownValue: number): void {
    const subject$ =
      updateType === 'group' ? this.groupTimer$ : this.peopleTimer$;
    timer(0, 1000)
      .pipe(takeUntil(timer(countdownValue * 1000)))
      .subscribe({
        next: (value) => {
          subject$.next(countdownValue - value);
        },
        complete: () => {
          subject$.next(0);
        },
      });
  }

  getTimer(updateType: 'group' | 'people'): Observable<number> {
    return updateType === 'group'
      ? this.groupTimer$.asObservable()
      : this.peopleTimer$.asObservable();
  }
  startCountdown(
    updateType: 'group' | 'people',
    initialCountdown: number,
  ): void {
    const key = `${updateType}Countdown`;
    this.clearCountdown(updateType);

    const subject$ =
      updateType === 'group' ? this.groupTimer$ : this.peopleTimer$;
    const countdown$ = timer(0, 1000).pipe(
      takeUntil(timer((initialCountdown + 1) * 1000)),
      map((value) => initialCountdown - value),
    );
    this.subscriptions[key] = countdown$.subscribe({
      next: (value) => subject$.next(value),
      complete: () => {
        subject$.next(0);
        this.clearCountdown(updateType);
      },
    });
  }

  clearCountdown(updateType: 'group' | 'people'): void {
    const key = `${updateType}Countdown`;
    this.subscriptions[key]?.unsubscribe();
    delete this.subscriptions[key];
  }

  ngOnDestroy() {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }
}
