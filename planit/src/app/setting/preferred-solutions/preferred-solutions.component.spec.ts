import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferredSolutionsComponent } from './preferred-solutions.component';

describe('PreferredSolutionsComponent', () => {
  let component: PreferredSolutionsComponent;
  let fixture: ComponentFixture<PreferredSolutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferredSolutionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferredSolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
