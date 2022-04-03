import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetWorthTileComponent } from './net-worth-tile.component';

describe('NetWorthTileComponent', () => {
    let component: NetWorthTileComponent;
    let fixture: ComponentFixture<NetWorthTileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NetWorthTileComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NetWorthTileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
