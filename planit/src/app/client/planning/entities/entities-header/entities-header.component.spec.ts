import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesHeaderComponent } from './entities-header.component';

describe('EntitiesHeaderComponent', () => {
  let component: EntitiesHeaderComponent;
  let fixture: ComponentFixture<EntitiesHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitiesHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitiesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
