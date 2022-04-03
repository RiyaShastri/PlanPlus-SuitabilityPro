import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSavingsComponent } from './add-savings.component';

describe('AddSavingsComponent', () => {
  let component: AddSavingsComponent;
  let fixture: ComponentFixture<AddSavingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSavingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
