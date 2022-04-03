import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantracDetailsSidePanelComponent } from './plantrac-details-side-panel.component';

describe('PlantracDetailsSidePanelComponent', () => {
  let component: PlantracDetailsSidePanelComponent;
  let fixture: ComponentFixture<PlantracDetailsSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantracDetailsSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantracDetailsSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
