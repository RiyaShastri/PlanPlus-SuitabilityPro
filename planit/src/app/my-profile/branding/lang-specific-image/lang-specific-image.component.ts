import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../shared/animations';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AppState, getCountryPayload, getLangualePayload, getBrandingDetails } from '../../../shared/app.reducer';
import { ClientProfileService } from '../../../client/service';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { Router } from '@angular/router';
import { SettingService } from '../../../setting/service';
import Swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';


@Component({
    selector: 'app-translations',
    templateUrl: './lang-specific-image.component.html',
    styleUrls: ['./lang-specific-image.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class LangSpecificImageComponent implements OnInit, OnDestroy {
    viewBy = [
        { id: 0, name: 'LANGUAGE' },
        { id: 1, name: 'JURISDICTION' }
    ];
    selectedViewBy = this.viewBy[0];
    drop2Items = [];
    drop2Selected = {};
    languages = [];
    drop2selctedView = {};
    public originalMessageValue = '';
    languageModel = {};
    translateItems = [];
    regionArray = [];
    region = {};
    isEditable = false;
    isGlobalRegion = false;
    goToLandingScreen = false;
    closeButtonDisable = false;
    isBrandingLogo = true;
    brandingSelection = 0;
    brandingDetails: any;
    brandingBackupDetails: any = {};
    popupType = 1;
    title = '';
    imageSrc = null;
    customBrandingImage = null;
    customCorporateLogo = null;
    coverPage1CustImage = null;
    coverPage2CustImage = null;
    miBrandingCustImage = null;
    bannerImageHeight = 45; bannerImageWidth = 150; bannerImageFormat = 'PNG';
    imageHeight = 45; imageWidth = 150; imageFormat = 'PNG';
    uploadEvent = null;
    uploadedImage = null;
    url = '';
    saveDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private modalService: NgbModal,
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private clientProfileService: ClientProfileService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private settingService: SettingService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'translationSidePanel' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.TRANSLATION_TITLE');
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('solution_name|')) {
                this.originalMessageValue = message.replace('solution_name|', '');
            } else if (message.includes('solution_family_name|')) {
                this.originalMessageValue = message.replace('solution_family_name|', '');
                this.goToLandingScreen = true;
            } else if (message.includes('branding_translation|')) {
                const obj = JSON.parse(message.replace('branding_translation|', ''));
                this.originalMessageValue = obj.input;
                this.brandingSelection = obj.selection;
            } else if (message.includes('branding_lang_image|')) {
                const obj = JSON.parse(message.replace('branding_lang_image|', ''));
                this.originalMessageValue = obj.input;
                this.brandingSelection = obj.selection;
            } else {
                this.router.navigate(['/settings', 'preferred-solutions']);
            }
        });
    }

    async ngOnInit() {
        this.store.select(getBrandingDetails).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.brandingDetails = data;
                this.brandingBackupDetails = JSON.parse(JSON.stringify(data));
            }
        });

        await this.settingService.getAccesibleLanguage().toPromise().then(resultlang => {
            if (resultlang) {
                this.languages.push({ id: 0, name: 'LANGUAGE' });
                resultlang.forEach(language => {
                    this.languages.push({ id: language.langcode, name: language.lang });
                });
            }
            this.fillDropdown2();
        }).catch(error => {
            this.languages = [];
        });

        await this.settingService.getRegion().toPromise().then(region => {
            this.regionArray = [];
            this.regionArray.push({
                'regionName': region['regionName'],
                'regionCode': region['regionCode'],
                'childRegions': (region['childRegions'].length > 0) ? this.getChildData(region['childRegions']) : []
            });
        });
        if (this.regionArray) {
            this.isRegionDropdown(this.regionArray);
        }
    }

    getChildData(childDataArray) {
        //this.regionArray = [];
        childDataArray.forEach(chiledRegion => {
            this.regionArray.push({
                'regionName': chiledRegion['regionName'],
                'regionCode': chiledRegion['regionCode'],
                'childRegions': (chiledRegion['childRegions'].length > 0) ? JSON.parse(JSON.stringify(this.getChildData(chiledRegion['childRegions']))) : []
            });
        });
        if (this.regionArray) {
            this.isRegionDropdown(this.regionArray);
        }
        return this.regionArray;
    }

    isRegionDropdown(regionArray) {
        let ans = false;
        regionArray.forEach(region => {
            ans = region['regionCode'].includes('0001');
        });
        if (ans) {
            this.isGlobalRegion = true;
        } else {
            this.isGlobalRegion = false;
        }
    }

    open(content: any, type: number) {
        this.popupType = type;
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
        this.title = 'Upload Branding Logo';
        this.imageHeight = this.bannerImageHeight;
        this.imageWidth = this.bannerImageWidth;
        this.imageFormat = this.bannerImageFormat;
    }
    
    submitModal() {
        this.customBrandingImage = this.uploadEvent;
        this.brandingDetails['bannerBranding'].customImagePath = this.uploadedImage;
        this.imageSrc = this.uploadedImage;
    }

    uploadImage(event) {
        this.uploadEvent = event;
        if (this.uploadEvent) {
            const fileExtension = this.uploadEvent.type.split('/')[1];
            // const blob1 = window.URL.createObjectURL(this.uploadEvent);
            const myReader: FileReader = new FileReader();
            myReader.readAsDataURL(this.uploadEvent);
            myReader.onloadend = (e) => {
                // const blob = this.b64toBlob(this.uploadedImage.split('base64,')[1], this.format);
                // this.uploadedImage = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob))['changingThisBreaksApplicationSecurity'];

                this.uploadedImage = myReader.result;

                // const img = new Image();
                // img.src = e.target['result'];
                // img.onload = () => {
                //     const w = img.width;
                //     const h = img.height;

                //     if ((w <= this.imageWidth || h <= this.imageHeight) && fileExtension === this.imageFormat.toLowerCase) {
                //         this.uploadedImage = myReader.result;
                //     } else if (fileExtension !== this.imageFormat) {
                //         Swal('Oops!', 'Please upload image in required format ' + this.imageFormat + ' .', 'error');
                //     } else {
                //         Swal('Oops!', 'Please upload image within the required dimension (' + this.imageWidth + ' x ' + this.imageHeight + ' pixels).', 'error');
                //     }

                // };
            };
        }
    }


    updateBranding() {
        this.saveDisable = true;
        this.brandingDetails['bannerBranding'].customImagePath = this.customBrandingImage ? null : this.brandingDetails['bannerBranding'].customImagePath;
        this.brandingDetails['corporateLogoForReports'].customImagePath = this.customCorporateLogo ? null : this.brandingDetails['corporateLogoForReports'].customImagePath;
        this.brandingDetails['coverPageImage1'].customImagePath = this.coverPage1CustImage ? null : this.brandingDetails['coverPageImage1'].customImagePath;
        this.brandingDetails['coverPageImage2'].customImagePath = this.coverPage2CustImage ? null : this.brandingDetails['coverPageImage2'].customImagePath;
        this.brandingDetails['miPlanPlusBranding'].customImagePath = this.miBrandingCustImage ? null : this.brandingDetails['miPlanPlusBranding'].customImagePath;

        const formData = new FormData();

        formData.append('bannerBrandingLogo', this.customBrandingImage);
        formData.append('corporateLogo', this.customCorporateLogo);
        formData.append('coverPageImg1', this.coverPage1CustImage);
        formData.append('coverPageImg2', this.coverPage2CustImage);
        formData.append('miPlanPlusBranding', this.miBrandingCustImage);
        const payload = JSON.stringify(this.brandingDetails);
        formData.append('brandingRequest', payload);
        formData.append('lang', this.drop2selctedView['id']);
        this.advisorService.updateBranding(formData).toPromise().then(res => {
            this.translate.get(['BRANDING.POPUP.SUCCESS', 'ALERT_MESSAGE.UPDATED']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.UPDATED'], i18text['BRANDING.POPUP.SUCCESS'], 'success');
            });
            this.isEditable = false;
            this.saveDisable = false;
            this.brandingDetails = null;
            this.advisorService.getAllBrandingData();
            this.refreshDataService.changeMessage('branding_details_updated');
            //this.brandingDetailChange('bannerBranding');
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
            this.saveDisable = false;
        });
        this.back();

    }

    fillDropdown2() {
        this.drop2Items = Object.assign([], this.languages);
        this.translateItems = Object.assign([], this.languages);
        this.drop2Selected = this.drop2Items[0];
    }

    drop2select(drop2selctedValue) {
        if (drop2selctedValue.name === 'LANGUAGE') {
            this.drop2selctedView = {};
        } else {
            this.drop2selctedView = drop2selctedValue;
        }
    }


    sorting(event) {
        this.region = event;
    }

    back() {
        if (this.goToLandingScreen) {
            this.refreshDataService.changeMessage('refereshPrefferedSolutions');
            this.router.navigate(['/settings', 'preferred-solutions']);
            return;
        }
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
