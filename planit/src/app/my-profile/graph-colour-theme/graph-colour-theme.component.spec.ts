import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphColourThemeComponent } from './graph-colour-theme.component';

describe('GraphColourThemeComponent', () => {
  let component: GraphColourThemeComponent;
  let fixture: ComponentFixture<GraphColourThemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphColourThemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphColourThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
