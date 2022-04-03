import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-member-avatar',
    templateUrl: './member-avatar.component.html',
    styleUrls: ['./member-avatar.component.css']
})
export class MemberAvatarComponent implements OnInit {
    @Input() public avatarUrl: string;
    @Input() public initials: string;
    @Input() public relationClass: string;
    @Input() public avatarClass: string;

    constructor() { }

    ngOnInit() {
        this.avatarClass +=  ' ' + this.relationClass;
    }

}
