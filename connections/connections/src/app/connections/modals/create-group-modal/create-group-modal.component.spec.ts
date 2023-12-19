import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGroupModalComponent } from './create-group-modal.component';

describe('CreateGroupModalComponent', () => {
  let component: CreateGroupModalComponent;
  let fixture: ComponentFixture<CreateGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGroupModalComponent],
    });
    fixture = TestBed.createComponent(CreateGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
