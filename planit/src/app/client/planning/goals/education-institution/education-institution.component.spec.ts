import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationInstitutionComponent } from './education-institution.component';

describe('EducationInstitutionComponent', () => {
  let component: EducationInstitutionComponent;
  let fixture: ComponentFixture<EducationInstitutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationInstitutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationInstitutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
