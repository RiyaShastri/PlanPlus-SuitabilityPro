import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsSummaryComponent } from './assets-summary.component';

describe('AssetsSummaryComponent', () => {
  let component: AssetsSummaryComponent;
  let fixture: ComponentFixture<AssetsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
