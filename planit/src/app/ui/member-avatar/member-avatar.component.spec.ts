import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberAvatarComponent } from './member-avatar.component';

describe('MemberAvatarComponent', () => {
    let component: MemberAvatarComponent;
    let fixture: ComponentFixture<MemberAvatarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MemberAvatarComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MemberAvatarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
