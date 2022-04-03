import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateDocumentComponent } from './generate-document.component';

describe('GenerateDocumentComponent', () => {
  let component: GenerateDocumentComponent;
  let fixture: ComponentFixture<GenerateDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
