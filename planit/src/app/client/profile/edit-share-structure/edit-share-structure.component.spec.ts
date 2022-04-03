import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShareStructureComponent } from './edit-share-structure.component';

describe('EditShareStructureComponent', () => {
  let component: EditShareStructureComponent;
  let fixture: ComponentFixture<EditShareStructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditShareStructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditShareStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
