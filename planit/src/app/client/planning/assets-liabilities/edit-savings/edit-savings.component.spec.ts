import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSavingsComponent } from './edit-savings.component';

describe('EditSavingsComponent', () => {
  let component: EditSavingsComponent;
  let fixture: ComponentFixture<EditSavingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSavingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
