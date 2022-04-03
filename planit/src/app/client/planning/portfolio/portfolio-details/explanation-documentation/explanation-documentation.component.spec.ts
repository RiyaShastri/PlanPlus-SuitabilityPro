import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplanationDocumentationComponent } from './explanation-documentation.component';

describe('ExplanationDocumentationComponent', () => {
  let component: ExplanationDocumentationComponent;
  let fixture: ComponentFixture<ExplanationDocumentationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplanationDocumentationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplanationDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
