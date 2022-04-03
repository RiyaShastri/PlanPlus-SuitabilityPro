import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RefreshDataService } from '../../shared/refresh-data';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { AppState, getAdvisorPayload, getBrandingDetails } from '../../shared/app.reducer';
import { environment } from '../../../environments/environment';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../shared/page-title';
import { AccessRightService } from '../../shared/access-rights.service';
import { BRANDING_RADIO_BUTTON_VALUE } from '../../shared/constants';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-branding',
    templateUrl: './branding.component.html',
    styleUrls: ['./branding.component.css']
})
export class BrandingComponent implements OnInit, OnDestroy {
    allExpanded = false;
    expandSelection = false;
    expandReport=false;
    expandDocument=false;
    expandClientPortal=false;
    expandValueApp=false;
    isEditable = false;
    curLang = 'en';
    brandingDetails: any;
    backUpBrandingDetails: any = {};
    brandingBackupDetails: any = {};
    popupType = 0;
    title = '';
    uploadedImage = null;
    isBrandingLogo = true;
    imageSrc = null;
    uploadEvent = null;
    bannerImageHeight = 45; bannerImageWidth = 150; bannerImageFormat = 'PNG';
    coverPageHeight = 1050; coverPageWidth = 800; coverPageFormat = 'PNG';
    imageHeight = 45; imageWidth = 150; imageFormat = 'PNG';
    customBrandingImage = null;
    customCorporateLogo = null;
    coverPage1CustImage = null;
    coverPage2CustImage = null;
    miBrandingCustImage = null;
    canCreateCustom = false;
    customBrandingImagePath = null;
    customCorporateLogoPath = null;
    coverPage1CustImagePath = null;
    coverPage2CustImagePath = null;
    miBrandingCustImagePath = null;
    url = '';
    saveDisable = false;
    BRANDING = BRANDING_RADIO_BUTTON_VALUE;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private modalService: NgbModal,
        private store: Store<AppState>,
        private sanitizer: DomSanitizer,
        private advisorService: AdvisorService,
        private refreshDataService: RefreshDataService,
        private accessRightService: AccessRightService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.MY_PROFILE_BRANDING');
        this.angulartics2.eventTrack.next({ action: 'myProfileBranding' });
    }

    ngOnInit() {
        this.url = environment.apiUrl + '/v30/branding/images/';
        this.accessRightService.getAccess(['REG_BRAND_ADMN','REG_BRAND_ADMN_Thm','REG_BRAND_ADMN_Ban','REG_BRAND_ADMN_Rpt','REG_BRAND_ADMN_Doc','REG_BRAND_ADMN_CP','REG_BRAND_ADMN_VApp']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('choose_theme|')) {
                this.brandingDetails = JSON.parse(message.replace('choose_theme|', ''));
            } else {
                this.store.select(getBrandingDetails).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        this.brandingDetails = data;
                        this.brandingBackupDetails = JSON.parse(JSON.stringify(data));
                        this.bannerBrandingChange();
                        for (const key in this.brandingDetails) {
                            if (this.brandingDetails.hasOwnProperty(key)) {
                                this.brandingDetailChange(key);
                            }
                        }
                        this.backUpBrandingDetails = JSON.parse(JSON.stringify(data));
                    } else {
                        // this.advisorService.getAllBrandingData();
                    }
                });
            }
        });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorDetails => {
            // tslint:disable-next-line:triple-equals
            this.canCreateCustom = advisorDetails['clientFilter'] == 4;
        });
    }

    bannerBrandingChange() {
        if (this.brandingDetails['bannerBranding'].customImagePath && !this.brandingDetails['bannerBranding'].customImagePath.includes('data:image/png')) {
            this.brandingDetails['bannerBranding'].customImagePath = !this.brandingDetails['bannerBranding'].customImagePath.includes(this.url) ?
                this.url + this.brandingDetails['bannerBranding'].customImagePath : this.brandingDetails['bannerBranding'].customImagePath;
        }
        // tslint:disable-next-line:triple-equals
        if (this.brandingDetails['bannerBranding'].selection == this.BRANDING.DEFAULT) {
            // tslint:disable-next-line:triple-equals
            if (this.brandingBackupDetails['bannerBranding'].selection == this.BRANDING.CUSTOM) {
                this.translate.get([
                    'BRANDING.POPUP.TITLE',
                    'BRANDING.POPUP.TEXT',
                    'FORM.ACTION.PROCEED',
                    'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal({
                        title: i18text['BRANDING.POPUP.TITLE'],
                        text: i18text['BRANDING.POPUP.TEXT'],
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: i18text['FORM.ACTION.PROCEED'],
                        cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
                    }).then(result => {
                        if (result.value) {
                            this.imageSrc = this.url + this.brandingDetails['bannerBranding'].defaultImagePath;
                            this.brandingDetails['bannerBranding'].customImagePath = null;
                            this.brandingBackupDetails['bannerBranding'].selection = this.BRANDING.DEFAULT;
                        } else {
                            this.brandingDetails['bannerBranding'].selection = this.BRANDING.CUSTOM;
                            this.brandingBackupDetails['bannerBranding'].selection = this.BRANDING.CUSTOM;
                            if (this.brandingDetails['bannerBranding'].customImagePath.includes('data:image/png')) {
                                this.imageSrc = this.brandingDetails['bannerBranding'].customImagePath;
                            } else {
                                this.imageSrc = this.brandingDetails['bannerBranding'].customImagePath.includes(this.url) ?
                                    this.brandingDetails['bannerBranding'].customImagePath : this.url + this.brandingDetails['bannerBranding'].customImagePath;
                            }
                        }
                    });
                });
            } else {
                this.imageSrc = this.url + this.brandingDetails['bannerBranding'].defaultImagePath;
            }
        } else {
            this.brandingBackupDetails['bannerBranding'].selection = this.BRANDING.CUSTOM;
            if (this.brandingDetails['bannerBranding'].customImagePath) {
                this.imageSrc = this.brandingDetails['bannerBranding'].customImagePath.includes(this.url) ?
                    this.brandingDetails['bannerBranding'].customImagePath : this.url + this.brandingDetails['bannerBranding'].customImagePath;
            }
        }
    }

    brandingDetailChange(key) {
        if (this.brandingDetails.hasOwnProperty(key) && (this.brandingDetails[key] instanceof Object)) {
            let imageAccordions;
            if (key === 'corporateLogoForReports' || key === 'coverPageImage1' || key === 'coverPageImage2' || key === 'miPlanPlusBranding') {
                imageAccordions = true;
                if (this.brandingDetails[key].customImagePath && !this.brandingDetails[key].customImagePath.includes('data:image/png')) {
                    this.brandingDetails[key].customImagePath = !this.brandingDetails[key].customImagePath.includes(this.url) ?
                        this.url + this.brandingDetails[key].customImagePath : this.brandingDetails[key].customImagePath;
                }
            } else {
                imageAccordions = false;
            }
            // tslint:disable-next-line:triple-equals
            if (this.brandingDetails[key].selection == this.BRANDING.DEFAULT) {
                // tslint:disable-next-line:triple-equals
                if (this.brandingBackupDetails[key].selection == this.BRANDING.CUSTOM) {
                    this.translate.get([
                        'BRANDING.POPUP.TITLE',
                        'BRANDING.POPUP.TEXT',
                        'FORM.ACTION.PROCEED',
                        'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
                    ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        Swal({
                            title: i18text['BRANDING.POPUP.TITLE'],
                            text: i18text['BRANDING.POPUP.TEXT'],
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: i18text['FORM.ACTION.PROCEED'],
                            cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
                        }).then(result => {
                            if (result.value) {
                                if (imageAccordions) {
                                    this.brandingDetails[key].customImagePath = null;
                                } else {
                                    this.copyDefaultToCustom(key, this.brandingDetails[key].selection);
                                }
                                this.brandingBackupDetails[key].selection = this.BRANDING.DEFAULT;
                            } else {
                                this.brandingDetails[key].selection = this.BRANDING.CUSTOM;
                                this.brandingBackupDetails[key]['selection'] = this.BRANDING.CUSTOM;
                                if (imageAccordions) {
                                    if (!this.brandingDetails[key].customImagePath.includes('data:image/png') && !this.brandingDetails[key].customImagePath.includes(this.url)) {
                                        this.brandingDetails[key].customImagePath = this.url + this.brandingDetails[key].customImagePath;
                                    }
                                }
                            }
                        });
                    });
                } else {
                    if (!imageAccordions) {
                        this.copyDefaultToCustom(key, this.brandingDetails[key].selection);
                    }
                }
            } else {
                this.brandingBackupDetails[key]['selection'] = 1;
                if (!imageAccordions) {
                    this.copyDefaultToCustom(key, this.brandingDetails[key].selection);
                }
            }
        }
    }

    copyDefaultToCustom(key, selection) {
        let defaultKey = '';
        let customKey = '';
        for (const subKey in this.brandingDetails[key]) {
            if (this.brandingDetails[key].hasOwnProperty(subKey)) {
                if (subKey.indexOf('default') >= 0 || subKey.indexOf('Default') >= 0) {
                    defaultKey = subKey;
                }
                if (subKey.indexOf('Custom') >= 0 || subKey.indexOf('custom') >= 0) {
                    customKey = subKey;
                }
            }
        }
        if (defaultKey !== '' && customKey !== '') {
            if (selection === 0) {
                this.brandingDetails[key][customKey] = JSON.parse(JSON.stringify(this.brandingDetails[key][defaultKey]));
            } else {
                this.checkForCustom(key, customKey, defaultKey);
            }
        }
    }

    checkForCustom(mainKey, customKey, defaultKey) {
        let noCustom = false;
        if (this.brandingDetails[mainKey][customKey] === null || this.brandingDetails[mainKey][customKey] === '') {
            noCustom = true;
        } else if (this.brandingDetails[mainKey][customKey] instanceof Array) {
            noCustom = this.brandingDetails[mainKey][customKey].length === 0 ? true : false;
        } else if (this.brandingDetails[mainKey][customKey] instanceof Object) {
            for (const key in this.brandingDetails[mainKey][customKey]) {
                if (this.brandingDetails[mainKey][customKey].hasOwnProperty(key)) {
                    const array = this.brandingDetails[mainKey][customKey][key];
                    if (array.length === 0) {
                        noCustom = true;
                    }
                }
            }
        }
        if (noCustom === true) {
            this.brandingDetails[mainKey][customKey] = this.brandingDetails[mainKey][defaultKey];
        }
    }

    setCustomImagesPath() {
        this.brandingDetails['bannerBranding'].customImagePath = this.brandingDetails['bannerBranding'].customImagePath ? (!this.brandingDetails['bannerBranding'].customImagePath.includes(this.url) ?
            this.url + this.brandingDetails['bannerBranding'].customImagePath : this.brandingDetails['bannerBranding'].customImagePath)
            : this.url + this.brandingDetails['bannerBranding'].defaultImagePath;
        this.brandingDetails['corporateLogoForReports'].customImagePath = this.brandingDetails['corporateLogoForReports'].customImagePath ?
            (!this.brandingDetails['corporateLogoForReports'].customImagePath.includes(this.url) ?
                this.url + this.brandingDetails['corporateLogoForReports'].customImagePath : this.brandingDetails['corporateLogoForReports'].customImagePath)
            : this.url + this.brandingDetails['corporateLogoForReports'].defaultImagePath;
        this.brandingDetails['coverPageImage1'].customImagePath = this.brandingDetails['coverPageImage1'].customImagePath ?
            this.url + this.brandingDetails['coverPageImage1'].customImagePath : this.url + this.brandingDetails['coverPageImage1'].defaultImagePath;
        this.brandingDetails['coverPageImage2'].customImagePath = this.brandingDetails['coverPageImage2'].customImagePath ?
            this.url + this.brandingDetails['coverPageImage2'].customImagePath : this.url + this.brandingDetails['coverPageImage2'].defaultImagePath;
        this.brandingDetails['miPlanPlusBranding'].customImagePath = this.brandingDetails['miPlanPlusBranding'].customImagePath ?
            this.url + this.brandingDetails['miPlanPlusBranding'].customImagePath : this.url + this.brandingDetails['miPlanPlusBranding'].defaultImagePath;
    }

    open(content: any, type: number) {
        this.popupType = type;
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
        if (type === 1) {
            this.title = 'Upload Branding Logo';
            this.imageHeight = this.bannerImageHeight;
            this.imageWidth = this.bannerImageWidth;
            this.imageFormat = this.bannerImageFormat;
        } else if (type === 2) {
            this.title = 'Upload Corporate Logo for Reports';
        } else if (type === 3) {
            this.title = 'Upload Cover Page Image 1';
            this.imageHeight = this.coverPageHeight;
            this.imageWidth = this.coverPageWidth;
            this.imageFormat = this.coverPageFormat;
        } else if (type === 4) {
            this.title = 'Upload Cover Page Image 2';
            this.imageHeight = this.coverPageHeight;
            this.imageWidth = this.coverPageWidth;
            this.imageFormat = this.coverPageFormat;
        } else if (type === 5) {
            this.title = 'Upload miPlanPlus Branding logo';
            this.imageHeight = this.bannerImageHeight;
            this.imageWidth = this.bannerImageWidth;
            this.imageFormat = this.bannerImageFormat;
        }
    }

    b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        // const byteCharacters = atob(b64Data);
        // const byteArrays = [];

        // for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        //     const slice = byteCharacters.slice(offset, offset + sliceSize);

        //     const byteNumbers = new Array(slice.length);
        //     for (let i = 0; i < slice.length; i++) {
        //         byteNumbers[i] = slice.charCodeAt(i);
        //     }

        //     const byteArray = new Uint8Array(byteNumbers);

        //     byteArrays.push(byteArray);
        // }

        // const blob = new Blob(byteArrays, { type: contentType });
        // return blob;
        const byteString = atob(b64Data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: contentType });
        return blob;
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

    submitModal() {
        if (this.popupType === 1) {
            this.customBrandingImage = this.uploadEvent;
            this.brandingDetails['bannerBranding'].customImagePath = this.uploadedImage;
            this.imageSrc = this.uploadedImage;
        } else if (this.popupType === 2) {
            this.customCorporateLogo = this.uploadEvent;
            this.brandingDetails['corporateLogoForReports'].customImagePath = this.uploadedImage;
        } else if (this.popupType === 3) {
            this.coverPage1CustImage = this.uploadEvent;
            this.brandingDetails['coverPageImage1'].customImagePath = this.uploadedImage;
        } else if (this.popupType === 4) {
            this.coverPage2CustImage = this.uploadEvent;
            this.brandingDetails['coverPageImage2'].customImagePath = this.uploadedImage;
        } else if (this.popupType === 5) {
            this.miBrandingCustImage = this.uploadEvent;
            this.brandingDetails['miPlanPlusBranding'].customImagePath = this.uploadedImage;
        }
    }

    // removeSelected(value: number) {
    //     if (value === 1) {
    //         this.customBrandingSrc = this.defaultBrandingSrc;
    //         this.imageSrc = this.defaultBrandingSrc;
    //         this.customBrandingImage = null;
    //     } else if (value === 2) {
    //         this.custCorporateLogoSrc = '';
    //         this.customCorporateLogo = null;
    //     } else if (value === 3) {
    //         this.coverPage1CustSrc = '';
    //         this.coverPage1CustImage = null;
    //     } else if (value === 4) {
    //         this.coverPage2CustSrc = '';
    //         this.coverPage2CustImage = null;
    //     } else if (value === 5) {
    //         this.miBrandingCustSrc = '';
    //         this.miBrandingCustImage = null;
    //     }
    // }

    // convertToInt(obj) {
    //     for (const key in obj) {
    //         if (obj.hasOwnProperty(key)) {
    //             const array = obj[key];
    //             array.forEach(element => {
    //                 element = parseInt(element, 10);
    //             });
    //         }
    //     }
    //     return obj;
    // }

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
        this.advisorService.updateBranding(formData).toPromise().then(res => {
            this.translate.get(['BRANDING.POPUP.SUCCESS', 'ALERT_MESSAGE.UPDATED']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.UPDATED'], i18text['BRANDING.POPUP.SUCCESS'], 'success');
            });
            this.isEditable = false;
            this.saveDisable = false;
            this.brandingDetails = null;
            this.advisorService.getAllBrandingData();
            this.refreshDataService.changeMessage('branding_details_updated');
            this.brandingDetailChange('bannerBranding');
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
            this.saveDisable = false;
        });
    }

    cancelChanges() {
        this.isEditable = !this.isEditable;
        this.brandingDetails = Object.assign({}, this.backUpBrandingDetails);
    }

    chooseTheme() {
        this.refreshDataService.changeMessage('choose_theme|' + JSON.stringify(this.brandingDetails));
        this.router.navigate(['/my-profile', 'branding', 'graph-colour-theme']);
    }

    translateText(textInput, selection) {
        this.refreshDataService.changeMessage('branding_translation|' + JSON.stringify({ input: textInput, selection: selection }));
        this.router.navigate(['translation'], { relativeTo: this.activatedRoute });
    }

    langBanner(selection, which) {
        this.refreshDataService.changeMessage('branding_lang_image|' + JSON.stringify({ which: which, selection: selection }));
        this.router.navigate(['lang-specific-image'], { relativeTo: this.activatedRoute });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
