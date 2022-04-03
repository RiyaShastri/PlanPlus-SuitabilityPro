import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RrifIllustrationComponent } from './rrif-illustration.component';

describe('RrifIllustrationComponent', () => {
  let component: RrifIllustrationComponent;
  let fixture: ComponentFixture<RrifIllustrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RrifIllustrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RrifIllustrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
