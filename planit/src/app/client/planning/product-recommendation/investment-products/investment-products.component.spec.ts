import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProductsComponent } from './investment-products.component';

describe('InvestmentProductsComponent', () => {
    let component: InvestmentProductsComponent;
    let fixture: ComponentFixture<InvestmentProductsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InvestmentProductsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvestmentProductsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
