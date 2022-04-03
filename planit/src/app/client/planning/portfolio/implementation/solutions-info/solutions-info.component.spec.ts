import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionsInfoComponent } from './solutions-info.component';

describe('SolutionsInfoComponent', () => {
  let component: SolutionsInfoComponent;
  let fixture: ComponentFixture<SolutionsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionsInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
