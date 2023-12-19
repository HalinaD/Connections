import { Injectable } from '@angular/core';
import { PersonalMessage } from '../../core/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReadTimeService {
  private conversationsCache: { [key: string]: PersonalMessage[] } = {};
  constructor() {}

  public getLastReadMessageTime(groupID: string): string | null {
    const lastReadTime = localStorage.getItem(`lastReadTime_${groupID}`);
    return lastReadTime ? lastReadTime : null;
  }

  public setLastReadMessageTime(groupID: string, lastReadTime: string): void {
    localStorage.setItem(`lastReadTime_${groupID}`, lastReadTime);
  }

  clearConversationCache(conversationID: string): void {
    delete this.conversationsCache[conversationID];
    localStorage.removeItem(`lastReadTime_${conversationID}`);
  }

  public getLastReadConversationMessageTime(
    conversationID: string,
  ): string | null {
    const lastReadTime = localStorage.getItem(`lastReadTime_${conversationID}`);
    return lastReadTime ? lastReadTime : null;
  }
  public setLastReadConversationMessageTime(
    conversationID: string,
    lastReadTime: string,
  ): void {
    localStorage.setItem(`lastReadTime_${conversationID}`, lastReadTime);
  }

  updateLastReadConversationTime(
    conversationID: string,
    timestamp: number,
  ): void {
    this.conversationsCache[conversationID] =
      this.conversationsCache[conversationID] || [];
    localStorage.setItem(
      `lastReadTime_${conversationID}`,
      timestamp.toString(),
    );
  }
}
