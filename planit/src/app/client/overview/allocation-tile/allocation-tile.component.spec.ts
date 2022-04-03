import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationTileComponent } from './allocation-tile.component';

describe('AllocationTileComponent', () => {
    let component: AllocationTileComponent;
    let fixture: ComponentFixture<AllocationTileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AllocationTileComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AllocationTileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
