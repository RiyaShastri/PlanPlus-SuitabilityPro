import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ClientProfileService } from '../../service';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-colaboration-tile',
    templateUrl: './colaboration-tile.component.html',
    styleUrls: ['./colaboration-tile.component.css']
})
export class ColaborationTileComponent implements OnInit, OnDestroy {
    @Input() clientId;
    client1: any;
    client2: any;
    collaborationData;
    accessRights = {};
    unsubscribe$;

    constructor(
        private profileService: ClientProfileService,
        private accessRightService: AccessRightService,
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.accessRightService.getAccess(['DOCSHARE']).subscribe(res => { if (res) { this.accessRights = res; } });
        this.profileService.getCollaborationDetails(this.clientId).toPromise().then(res => {
            this.collaborationData = res;
        }).catch(err => { });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
