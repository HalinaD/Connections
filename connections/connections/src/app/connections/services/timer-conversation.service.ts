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
export class TimerConversationService implements OnDestroy {
  private subscriptions: { [key: string]: Subscription } = {};
  private groupMessageTimers: { [groupId: string]: BehaviorSubject<number> } =
    {};
  private conversationMessageTimers: {
    [groupId: string]: BehaviorSubject<number>;
  } = {};

  constructor() {}

  resumeUpdateTimer(
    groupId: string,
    updateType: 'messageUpdate' | 'updateConversation',
    updateCountdown: number,
    callback: (countdown: number, isDisabled: boolean) => void,
  ): void {
    const lastUpdateTimeKey =
      updateType === 'messageUpdate'
        ? 'lastGroupMessageUpdate'
        : 'lastConversationMessageUpdate';
    const lastUpdateTime = parseInt(
      localStorage.getItem(`${lastUpdateTimeKey}_${groupId}`) ?? '0',
      10,
    );
    const currentTime = Date.now();
    let isDisabled = false;

    if (!this.groupMessageTimers[groupId]) {
      this.groupMessageTimers[groupId] = new BehaviorSubject<number>(0);
    }

    if (!this.conversationMessageTimers[groupId]) {
      this.conversationMessageTimers[groupId] = new BehaviorSubject<number>(0);
    }

    if (lastUpdateTime > 0) {
      const timePassed = currentTime - lastUpdateTime;

      if (timePassed < updateCountdown * 1000) {
        const countdownValue = updateCountdown - Math.floor(timePassed / 1000);
        isDisabled = true;
        this.startTimer(groupId, updateType, countdownValue);
      }
    }

    this.getTimer(groupId, updateType).subscribe({
      next: (countdown: number) => {
        isDisabled = countdown !== 0;
        callback(countdown, isDisabled);
      },
    });
  }

  startTimer(
    groupId: string,
    updateType: 'messageUpdate' | 'updateConversation',
    countdownValue: number,
  ): void {
    const subject$ =
      updateType === 'messageUpdate'
        ? this.groupMessageTimers[groupId]
        : this.conversationMessageTimers[groupId];

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

  getTimer(
    groupId: string,
    updateType: 'messageUpdate' | 'updateConversation',
  ): Observable<number> {
    const subject$ =
      updateType === 'messageUpdate'
        ? this.groupMessageTimers[groupId]
        : this.conversationMessageTimers[groupId];
    return subject$.asObservable();
  }

  startCountdown(
    groupId: string,
    updateType: 'messageUpdate' | 'updateConversation',
    initialCountdown: number,
  ): void {
    const key = `${groupId}_${updateType}Countdown`;

    this.clearCountdown(groupId, updateType);

    const subject$ =
      updateType === 'messageUpdate'
        ? this.groupMessageTimers[groupId]
        : this.conversationMessageTimers[groupId];

    const countdown$ = timer(0, 1000).pipe(
      takeUntil(timer((initialCountdown + 1) * 1000)),
      map((value) => initialCountdown - value),
    );

    this.subscriptions[key] = countdown$.subscribe({
      next: (value) => subject$.next(value),
      complete: () => {
        subject$.next(0);
        this.clearCountdown(groupId, updateType);
      },
    });
  }

  clearCountdown(
    groupId: string,
    updateType: 'messageUpdate' | 'updateConversation',
  ): void {
    const key = `${groupId}_${updateType}Countdown`;
    this.subscriptions[key]?.unsubscribe();
    delete this.subscriptions[key];
  }

  ngOnDestroy() {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }
}
