import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsListHtmlComponent } from './savings-list-html.component';

describe('SavingsListHtmlComponent', () => {
  let component: SavingsListHtmlComponent;
  let fixture: ComponentFixture<SavingsListHtmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsListHtmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsListHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
