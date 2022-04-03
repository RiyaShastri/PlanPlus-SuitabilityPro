import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityOwnershipComponent } from './entity-ownership.component';

describe('EntityOwnershipComponent', () => {
  let component: EntityOwnershipComponent;
  let fixture: ComponentFixture<EntityOwnershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityOwnershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityOwnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
