import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongTermCareComponent } from './long-term-care.component';

describe('LongTermCareComponent', () => {
  let component: LongTermCareComponent;
  let fixture: ComponentFixture<LongTermCareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongTermCareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongTermCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
