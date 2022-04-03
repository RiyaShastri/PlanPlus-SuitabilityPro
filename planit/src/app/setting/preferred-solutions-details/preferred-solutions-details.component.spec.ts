import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferredSolutionsDetailsComponent } from './preferred-solutions-details.component';

describe('PreferredSolutionsDetailsComponent', () => {
  let component: PreferredSolutionsDetailsComponent;
  let fixture: ComponentFixture<PreferredSolutionsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferredSolutionsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferredSolutionsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
