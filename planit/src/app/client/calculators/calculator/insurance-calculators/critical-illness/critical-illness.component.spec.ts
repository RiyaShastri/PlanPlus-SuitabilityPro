import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalIllnessComponent } from './critical-illness.component';

describe('CriticalIllnessComponent', () => {
  let component: CriticalIllnessComponent;
  let fixture: ComponentFixture<CriticalIllnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriticalIllnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriticalIllnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
