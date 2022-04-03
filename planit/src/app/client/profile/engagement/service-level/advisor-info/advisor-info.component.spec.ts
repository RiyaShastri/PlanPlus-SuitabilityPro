import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorInfoComponent } from './advisor-info.component';

describe('AdvisorInfoComponent', () => {
  let component: AdvisorInfoComponent;
  let fixture: ComponentFixture<AdvisorInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvisorInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvisorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
