import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSpecificImageComponent } from './lang-specific-image.component';

describe('TranslationsComponent', () => {
  let component: LangSpecificImageComponent;
  let fixture: ComponentFixture<LangSpecificImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LangSpecificImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LangSpecificImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
