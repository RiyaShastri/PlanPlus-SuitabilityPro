import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyMemberDropdownComponent } from './family-member-dropdown.component';

describe('FamilyMemberDropdownComponent', () => {
  let component: FamilyMemberDropdownComponent;
  let fixture: ComponentFixture<FamilyMemberDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyMemberDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyMemberDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
