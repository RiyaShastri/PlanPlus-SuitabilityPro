import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowTileComponent } from './cash-flow-tile.component';

describe('CashFlowTileComponent', () => {
  let component: CashFlowTileComponent;
  let fixture: ComponentFixture<CashFlowTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashFlowTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
