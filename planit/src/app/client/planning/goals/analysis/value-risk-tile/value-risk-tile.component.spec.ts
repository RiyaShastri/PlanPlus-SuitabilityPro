import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueRiskTileComponent } from './value-risk-tile.component';

describe('ValueRiskTileComponent', () => {
  let component: ValueRiskTileComponent;
  let fixture: ComponentFixture<ValueRiskTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueRiskTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueRiskTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
