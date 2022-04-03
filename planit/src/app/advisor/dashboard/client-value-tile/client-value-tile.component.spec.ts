import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientValueTileComponent } from './client-value-tile.component';

describe('ClientValueTileComponent', () => {
  let component: ClientValueTileComponent;
  let fixture: ComponentFixture<ClientValueTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientValueTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientValueTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
