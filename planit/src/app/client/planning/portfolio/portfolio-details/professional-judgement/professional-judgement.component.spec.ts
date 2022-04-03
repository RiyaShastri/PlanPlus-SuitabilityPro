import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalJudgementComponent } from './professional-judgement.component';

describe('ProfessionalJudgementComponent', () => {
  let component: ProfessionalJudgementComponent;
  let fixture: ComponentFixture<ProfessionalJudgementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfessionalJudgementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessionalJudgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
