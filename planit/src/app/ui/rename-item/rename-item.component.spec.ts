import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameItemComponent } from './rename-item.component';

describe('RenameItemComponent', () => {
  let component: RenameItemComponent;
  let fixture: ComponentFixture<RenameItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
