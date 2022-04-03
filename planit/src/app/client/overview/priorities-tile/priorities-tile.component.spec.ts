import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritiesTileComponent } from './priorities-tile.component';

describe('PrioritiesTileComponent', () => {
  let component: PrioritiesTileComponent;
  let fixture: ComponentFixture<PrioritiesTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrioritiesTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrioritiesTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
