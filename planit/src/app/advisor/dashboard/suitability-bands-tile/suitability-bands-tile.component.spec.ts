import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuitabilityBandsTileComponent } from './suitability-bands-tile.component';

describe('SuitabilityBandsTileComponent', () => {
  let component: SuitabilityBandsTileComponent;
  let fixture: ComponentFixture<SuitabilityBandsTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuitabilityBandsTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuitabilityBandsTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
