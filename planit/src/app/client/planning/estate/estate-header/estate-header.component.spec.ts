import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateHeaderComponent } from './estate-header.component';

describe('EstateHeaderComponent', () => {
  let component: EstateHeaderComponent;
  let fixture: ComponentFixture<EstateHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstateHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstateHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
