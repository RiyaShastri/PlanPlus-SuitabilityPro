import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyModelComponent } from './apply-model.component';

describe('ApplyModelComponent', () => {
  let component: ApplyModelComponent;
  let fixture: ComponentFixture<ApplyModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
