import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantracComponent } from './plantrac.component';

describe('PlantracComponent', () => {
  let component: PlantracComponent;
  let fixture: ComponentFixture<PlantracComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantracComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantracComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
