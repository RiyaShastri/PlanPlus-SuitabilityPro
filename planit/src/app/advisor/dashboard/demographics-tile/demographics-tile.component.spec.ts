import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemographicsTileComponent } from './demographics-tile.component';

describe('DemographicsTileComponent', () => {
  let component: DemographicsTileComponent;
  let fixture: ComponentFixture<DemographicsTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemographicsTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemographicsTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
