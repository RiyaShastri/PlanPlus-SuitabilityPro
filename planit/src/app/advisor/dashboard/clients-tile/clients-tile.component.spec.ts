import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsTileComponent } from './clients-tile.component';

describe('ClientsTileComponent', () => {
  let component: ClientsTileComponent;
  let fixture: ComponentFixture<ClientsTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientsTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
