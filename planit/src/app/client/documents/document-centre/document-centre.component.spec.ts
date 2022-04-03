import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCentreComponent } from './document-centre.component';

describe('DocumentCentreComponent', () => {
  let component: DocumentCentreComponent;
  let fixture: ComponentFixture<DocumentCentreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentCentreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentCentreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
