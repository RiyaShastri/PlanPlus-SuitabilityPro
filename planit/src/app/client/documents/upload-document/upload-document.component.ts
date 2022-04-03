import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2 } from 'angulartics2';
import { DocumentService } from '../../service';
import { slideInOutAnimation } from '../../../shared/animations';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { PageTitleService } from '../../../shared/page-title';
import { AppState, getIsClientDocumentTypeLoaded, getclientDocumentTypePayload } from '../../../shared/app.reducer';
@Component({
    selector: 'app-upload-document',
    templateUrl: './upload-document.component.html',
    styleUrls: ['./upload-document.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class UploadDocumentComponent implements OnInit{

    closeButtonDisable = false;
    
    constructor(private _location: Location,
        public translate: TranslateService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'uploadDocument' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.UPLOAD_DOCUMENT_TITLE');
    }

    ngOnInit() {
        
    }
    
    back() {
        this._location.back();
    }
}
