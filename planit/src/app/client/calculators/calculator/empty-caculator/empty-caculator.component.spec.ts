import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyCaculatorComponent } from './empty-caculator.component';

describe('EmptyCaculatorComponent', () => {
  let component: EmptyCaculatorComponent;
  let fixture: ComponentFixture<EmptyCaculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmptyCaculatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyCaculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
