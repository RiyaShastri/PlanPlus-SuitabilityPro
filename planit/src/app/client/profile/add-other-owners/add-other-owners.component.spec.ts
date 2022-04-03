import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOtherOwnersComponent } from './add-other-owners.component';

describe('AddOtherOwnersComponent', () => {
  let component: AddOtherOwnersComponent;
  let fixture: ComponentFixture<AddOtherOwnersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOtherOwnersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOtherOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
