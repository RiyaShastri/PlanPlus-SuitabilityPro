import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsIndividualComponent } from './savings-individual.component';

describe('SavingsIndividualComponent', () => {
  let component: SavingsIndividualComponent;
  let fixture: ComponentFixture<SavingsIndividualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsIndividualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
