import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplementationQuestionsComponent } from './implementation-questions.component';

describe('ImplementationQuestionsComponent', () => {
  let component: ImplementationQuestionsComponent;
  let fixture: ComponentFixture<ImplementationQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImplementationQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplementationQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
