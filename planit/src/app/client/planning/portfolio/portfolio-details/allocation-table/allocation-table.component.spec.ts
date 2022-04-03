import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationTableComponent } from './allocation-table.component';

describe('AllocationTableComponent', () => {
  let component: AllocationTableComponent;
  let fixture: ComponentFixture<AllocationTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
