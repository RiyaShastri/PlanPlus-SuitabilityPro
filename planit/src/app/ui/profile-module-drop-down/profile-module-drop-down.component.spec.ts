import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileModuleDropDownComponent } from './profile-module-drop-down.component';

describe('ProfileModuleDropDownComponent', () => {
  let component: ProfileModuleDropDownComponent;
  let fixture: ComponentFixture<ProfileModuleDropDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileModuleDropDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileModuleDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
