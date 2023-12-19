import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalConversationComponent } from './personal-conversation.component';

describe('PersonalConversationComponent', () => {
  let component: PersonalConversationComponent;
  let fixture: ComponentFixture<PersonalConversationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalConversationComponent],
    });
    fixture = TestBed.createComponent(PersonalConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
