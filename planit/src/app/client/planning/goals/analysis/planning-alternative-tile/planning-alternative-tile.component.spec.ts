import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningAlternativeTileComponent } from './planning-alternative-tile.component';

describe('PlanningAlternativeTileComponent', () => {
  let component: PlanningAlternativeTileComponent;
  let fixture: ComponentFixture<PlanningAlternativeTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningAlternativeTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningAlternativeTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
