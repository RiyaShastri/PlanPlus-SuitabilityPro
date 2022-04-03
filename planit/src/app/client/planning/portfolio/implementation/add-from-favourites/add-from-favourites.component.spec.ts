import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFromFavouritesComponent } from './add-from-favourites.component';

describe('AddFromFavouritesComponent', () => {
  let component: AddFromFavouritesComponent;
  let fixture: ComponentFixture<AddFromFavouritesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFromFavouritesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFromFavouritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
