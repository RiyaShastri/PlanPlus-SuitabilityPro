import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesSidePanelComponent } from './notes-side-panel.component';

describe('NotesSidePanelComponent', () => {
  let component: NotesSidePanelComponent;
  let fixture: ComponentFixture<NotesSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotesSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
