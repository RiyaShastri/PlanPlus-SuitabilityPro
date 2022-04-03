import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentsTileComponent } from './investments-tile.component';

describe('InvestmentsTileComponent', () => {
  let component: InvestmentsTileComponent;
  let fixture: ComponentFixture<InvestmentsTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentsTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentsTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
