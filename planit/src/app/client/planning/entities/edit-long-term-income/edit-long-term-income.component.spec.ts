import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLongTermIncomeComponent } from './edit-long-term-income.component';

describe('EditLongTermIncomeComponent', () => {
  let component: EditLongTermIncomeComponent;
  let fixture: ComponentFixture<EditLongTermIncomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLongTermIncomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLongTermIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
