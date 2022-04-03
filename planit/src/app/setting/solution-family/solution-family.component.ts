import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { slideInOutAnimation } from '../../shared/animations';
import { ClientProfileService } from '../../client/service';
import { AppState, getCountryPayload } from '../../shared/app.reducer';
import { SettingService } from '../service';
import swal from 'sweetalert2';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RefreshDataService } from '../../shared/refresh-data';
import { PageTitleService } from '../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-solution-family',
    templateUrl: './solution-family.component.html',
    styleUrls: ['./solution-family.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class SolutionFamilyComponent implements OnInit, OnDestroy {
    countries = [];
    country;
    regionArray = [];
    jurisdictionsData = [];
    region;
    familyName = '';
    solutionFamilyId = '';
    isEdit = false;
    jurisdictionsLengthFlag = false;
    saveDisable = false;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private activatedRoute: ActivatedRoute,
        private clientProfileService: ClientProfileService,
        private settingService: SettingService,
        private dataSharing: RefreshDataService,
        private router: Router,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'solutionFamilySidePanel' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.SOLUTION_FAMILY_TITLE');
        this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params: Params) => {
            if (params['solutionFamilyId']) {
                this.isEdit = true;
                this.solutionFamilyId = params['solutionFamilyId'];
            }
        });
    }

    ngOnInit() {

        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('region_for_add_solution_family|')) {
                this.region = JSON.parse(message.replace('region_for_add_solution_family|', ''));
            }
        });

        this.settingService.checkJurisdictions()
            .toPromise()
            .then(data => {
                this.jurisdictionsData = [...data];
                this.countries = [...data];
                (this.jurisdictionsData.length > 1) ? this.jurisdictionsLengthFlag = true : this.jurisdictionsLengthFlag = false;
                // if result length is grether then one then we need to display country drop-down else we can remove same.
            });


        this.settingService.getRegion()
            .toPromise()
            .then(data => {
                const regionArray = [];

                regionArray.push({
                    'regionName': data['personalRegionName'],
                    'regionCode': data['personalRegionCode'],
                    'childRegions': []
                });

                regionArray.push({
                    'regionName': data['regionName'],
                    'regionCode': data['regionCode'],
                    'childRegions': (data['childRegions'].length > 0) ? this.getChildData(data['childRegions']) : []
                });

                this.regionArray = regionArray;
                if (this.solutionFamilyId !== null && this.solutionFamilyId !== undefined && this.solutionFamilyId !== '') {
                    setTimeout(() => {
                        this.getSolutionDetails(this.solutionFamilyId);
                    }, 500);
                }
            });
    }

    getChildData(childDataArray) {
        const regionArray = [];
        childDataArray.forEach(element => {
            regionArray.push({
                'regionName': element['regionName'],
                'regionCode': element['regionCode'],
                'childRegions': (element['childRegions'].length > 0) ? JSON.parse(JSON.stringify(this.getChildData(element['childRegions']))) : []
            });
        });
        return regionArray;
    }

    getSolutionDetails(solutionFamilyId) {
        this.settingService.getSolutionFamilydetails(solutionFamilyId).toPromise().then(data => {
            this.familyName = data['solutionFamilyName'];

            this.country = this.countries.find(x => x['countryCode'] === data['countryCode']);
            this.region = this.regionArray.find(x => x['regionCode'] === data['regionCode']);
            const regionArray = JSON.parse(JSON.stringify(this.getChildData(this.regionArray)));

            let res = {};
            regionArray.find(function f(o) {
                if (o.regionCode === data['regionCode']) {
                    res = Object.assign({}, o);
                    return true;
                }
                if (o.childRegions) {
                    return (o.childRegions = o.childRegions.filter(f)).length;
                }
            });

            this.region = res;
        });
    }

    back() {
        this._location.back();
    }

    saveFamily(type?) {
        const requestObj = {
            'regionCode': this.region['regionCode'],
            'solutionFamilyName': this.familyName
        };

        if (this.jurisdictionsLengthFlag) {
            requestObj['countryCode'] = this.country['countryCode'];
        } else {
            requestObj['countryCode'] = this.jurisdictionsData[0]['countryCode'];
        }

        if (this.isEdit) {
            requestObj['solutionFamilyId'] = this.solutionFamilyId;
            this.settingService.updateSolutionFamily(this.solutionFamilyId, requestObj).toPromise().then(data => {
                if (type === 1) {
                    this.dataSharing.changeMessage('solution_family_name|' + this.familyName);
                    this.router.navigate(['/settings', 'preferred-solutions', 'translation'], { relativeTo: this.activatedRoute });
                } else {
                    this.translate.get(['SETTINGS.PREFERRED_SOLUTION.SOLUTION_FAMILY.POPUP.EDIT_SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        swal('Success', i18text['SETTINGS.PREFERRED_SOLUTION.SOLUTION_FAMILY.POPUP.EDIT_SUCCESS'], 'success');
                    });
                    this.dataSharing.changeMessage('refereshPrefferedSolutions');
                    this.back();
                    this.saveDisable = false;
                }
            }).catch(errorResponse => {
                swal('Error', errorResponse.error.errorMessage, 'error');
                this.saveDisable = false;
            });
        } else {
            this.settingService.saveSolutionFamily(requestObj).toPromise().then(data => {
                if (type === 1) {
                    this.dataSharing.changeMessage('solution_family_name|' + this.familyName);
                    this.router.navigate(['/settings', 'preferred-solutions', 'translation'], { relativeTo: this.activatedRoute });
                } else {
                    this.translate.get(['SETTINGS.PREFERRED_SOLUTION.SOLUTION_FAMILY.POPUP.ADD_SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        swal('Success', i18text['SETTINGS.PREFERRED_SOLUTION.SOLUTION_FAMILY.POPUP.ADD_SUCCESS'], 'success');
                    });
                    this.dataSharing.changeMessage('refereshPrefferedSolutions');
                    this.back();
                    this.saveDisable = false;
                }
            }).catch(errorResponse => {
                swal('Error', errorResponse.error.errorMessage, 'error');
                this.saveDisable = false;
            });
        }

    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
