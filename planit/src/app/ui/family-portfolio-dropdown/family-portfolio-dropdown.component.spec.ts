import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyPortfolioDropdownComponent } from './family-portfolio-dropdown.component';

describe('FamilyPortfolioDropdownComponent', () => {
  let component: FamilyPortfolioDropdownComponent;
  let fixture: ComponentFixture<FamilyPortfolioDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyPortfolioDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyPortfolioDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
