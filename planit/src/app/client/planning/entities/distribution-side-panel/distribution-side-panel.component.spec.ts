import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionSidePanelComponent } from './distribution-side-panel.component';

describe('DistributionSidePanelComponent', () => {
  let component: DistributionSidePanelComponent;
  let fixture: ComponentFixture<DistributionSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
