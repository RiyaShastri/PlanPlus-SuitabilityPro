import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsCenterTileComponent } from './documents-center-tile.component';

describe('DocumentsCenterTileComponent', () => {
  let component: DocumentsCenterTileComponent;
  let fixture: ComponentFixture<DocumentsCenterTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsCenterTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsCenterTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
