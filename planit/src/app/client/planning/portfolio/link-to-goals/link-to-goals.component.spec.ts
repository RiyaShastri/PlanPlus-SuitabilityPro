import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkToGoalsComponent } from './link-to-goals.component';

describe('LinkToGoalsComponent', () => {
  let component: LinkToGoalsComponent;
  let fixture: ComponentFixture<LinkToGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkToGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkToGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
