import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCurrentComponent } from './edit-current.component';

describe('EditCurrentComponent', () => {
  let component: EditCurrentComponent;
  let fixture: ComponentFixture<EditCurrentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCurrentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
