import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { Angulartics2 } from 'angulartics2';
import { NgxPermissionsService } from 'ngx-permissions';

import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import {
    AppState,
    getIsClientDocumentTypeLoaded,
    getclientDocumentTypePayload, 
    getFamilyMemberRiskPayload
} from '../../../shared/app.reducer';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { PageTitleService } from '../../../shared/page-title';
import { slideInOutAnimation } from '../../../shared/animations';
import { DocumentService, PortfolioService } from '../../service';
import {
    GENERATE_DOCUMENT_FORMATE_ID, GENERATE_DOCUMENT_FORMATE_DESCRIPTION
} from '../../../shared/constants';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-generate-document',
    templateUrl: './generate-document.component.html',
    styleUrls: ['./generate-document.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class GenerateDocumentComponent implements OnInit, OnDestroy {
    selectedFormat;
    loading = false;
    model: any = {};
    documentCategory;
    templateList = [];
    defaultSelected = {};
    documentList = [];
    clientId;
    selectedDocument;
    hasPortfolio;
    portfolioList = [];
    goalList = [];
    templatePagesList = [];
    templatePagesListGoals = [];
    templatePagesListGoalsDefaultTemplate = [];
    templateIdMapping = {};
    allTemplates = [];
    allStandardSections = [];
    hasRiskTol = false;
    closeButtonDisable = false;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    private readonly wordFormat = { id: GENERATE_DOCUMENT_FORMATE_ID.WORD, description: GENERATE_DOCUMENT_FORMATE_DESCRIPTION.WORD,
    }
    private readonly pdfFormat = { id: GENERATE_DOCUMENT_FORMATE_ID.PDF, description: GENERATE_DOCUMENT_FORMATE_DESCRIPTION.PDF,
    }
    reportFormats = [this.pdfFormat];

    


    constructor(private _location: Location,
        private documentService: DocumentService,
        private store: Store<AppState>,
        private route: ActivatedRoute,
        public translate: TranslateService,
        private portfolioService: PortfolioService,
        private advisorService: AdvisorService,
        private pageTitleService: PageTitleService,
        private ngxPermissionsService: NgxPermissionsService,
        private angulartics2: Angulartics2,
        private accessRight: AccessRightService
    ) {
        this.angulartics2.eventTrack.next({ action: 'generateDocument' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.GENERATE_DOCUMENT_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {

        this.accessRight.getAccess(['WORDDOC']).pipe(takeUntil(this.unsubscribe$)).subscribe(res =>{
            if(res){
                this.accessRights = res;
                if(this.accessRights['WORDDOC']['accessLevel'] > 0){
                    this.reportFormats.push(this.wordFormat);
                }
            }
        });

        if (this.reportFormats.length === 1) {
            this.selectedFormat = this.reportFormats[0];
        }

        this.store.select(getIsClientDocumentTypeLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(loaded => {
            if (!loaded) {
                this.documentService.getClientDocumentType();
            } else {
                this.store.select(getclientDocumentTypePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    this.documentCategory = data.filter(function (item) {
                       return (item.shared === 1);
                    });
                    this.documentCategory.forEach(i => {
                        this.translate.get('DOCUMENT.GENERATE_DOCUMENT.TYPE_NAMES.' + i.ssid.trim()).pipe(takeUntil(this.unsubscribe$)).subscribe(j =>
                            i.categoryName = j);
                    });
                });
            }
        });
        this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(payload => {
            if ( payload) {
                const riskSet = payload;
                riskSet.forEach( r => {
                    if ( r.completed) {
                        this.hasRiskTol = true;
                    }
                });
            }
        });
    }

    filterDocument() {
        this.selectedDocument = null;
        this.getDocumentByCategory();
        this.hasPortfolio = this.model.fileUnderType.hasPortfolio;
    }

    getDocumentByCategory() {
        this.documentService.getDocumentByCategory(this.model.fileUnderType.typeId).toPromise().then(result => {
            this.documentList = result.documentPayloads;
            this.documentList.forEach(i => {
                this.translate.get('DOCUMENT.GENERATE_DOCUMENT.TYPE_NAMES.' + i.documentID).pipe(takeUntil(this.unsubscribe$)).subscribe(j => i.documentName = j);
            });
        }).catch(errorResponse => {
            this.documentList = [];
        });
    }

    documentCheck(activeItem) {
        this.selectedDocument = activeItem;
        this.getDocumentPageSelection();
        this.getAllPortfoliosData();
    }

    getDocumentPageSelection() {
        const permissions = this.ngxPermissionsService.getPermissions();
        this.templateIdMapping = {};
        this.templateList = [];
        this.documentService.getDocumentPageSelection(this.selectedDocument, this.clientId).toPromise().then(result => {
            this.allTemplates = Object.assign([], result);
            this.allTemplates.forEach((template, templateIndex) => {
                this.templateIdMapping[template.id] = templateIndex;
                const itemObj = {
                    id: template.id,
                    name: template.templatePayload.templateName,
                    isDefault: false,
                    reportFormat : template.templatePayload.documentFormat
                };
                if (template.templatePayload.documentId === 'PROPLANNER') {
                    // The ProPlanner document has multiple sections that are now being combined into
                    // a single checkbox selection.  Sections id 8 (investment suitability)
                    // through section 12 (Investment Policy) will all be consolidated to
                    // a single report section using ID 8 called Investment Strategy like
                    // there is in the Profiler document.  So now those sections 9-12 will
                    // need to be hidden.  In addition if the user is a ProPlanner user only
                    // then the new Investment Strategy category will not be shown at all.
                    // So it and the other 4 categories need to be hidden.
                    this.allStandardSections = template.templatePayload.section;
                    const filteredSections = [];
                    this.allStandardSections.forEach((sec) => {
                        // For section 8 make sure it has the correct name, any saved template may still
                        // say "Investment Suitability"
                        if (sec.id === '8') {
                            this.translate.get('GOAL.ANALYSIS.LABEL.INVESTMENT_STRATEGY').pipe(takeUntil(this.unsubscribe$)).subscribe(j => sec.label = j);
                        }
                        // If user has Profiler access and there is at least 1 person with
                        // a complete risk tolerance then make sure to add section 8 to the list as well
                        if (sec.id == '8' && permissions.hasOwnProperty('PROFILER') && this.hasRiskTol) {
                            filteredSections.push(sec);
                        }
                        if ( sec.id !== '8' && sec.id !== '9' && sec.id !== '10' && sec.id !== '11' && sec.id !== '12') {
                            filteredSections.push(sec);
                        }
                    });
                    template.templatePayload.section = filteredSections;

                    if (template.type) { // default template
                        this.templatePagesListGoalsDefaultTemplate = JSON.parse(JSON.stringify(template.templatePayload.goalSection));
                    }
                    const templatePagesListGoalsDefault = JSON.parse(JSON.stringify(template.templatePayload.goalSection));
                    this.goalList = Object.assign([], template.templatePayload.goals);
                    const templatePagesListGoalsUpdate = [];
                    this.goalList.forEach(goal => {
                        const templateGoal = templatePagesListGoalsDefault.filter(t => t.goalType === this.convertGoalType(goal.goalType)).map(g => Object.assign({}, g));
                        templateGoal.forEach(t => {
                            t.goalId = goal.goalId;
                            templatePagesListGoalsUpdate.push(t);
                        });
                    });
                    template.templatePayload.goalSection = templatePagesListGoalsUpdate;
                }
                if (template.templatePayload.documentId === 'PROFIL1') {
                    this.allStandardSections = template.templatePayload.section;
                    const filteredSections = [];
                    this.allStandardSections.forEach((sec) => {
                        if (sec.id === '3') {
                            this.translate.get('GOAL.ANALYSIS.LABEL.INVESTMENT_STRATEGY').pipe(takeUntil(this.unsubscribe$)).subscribe(j => sec.label = j);
                        }
                        if (sec.id == '3' && permissions.hasOwnProperty('PROFILER') && this.hasRiskTol) {
                            filteredSections.push(sec);
                        }
                        if (sec.id != '3') {
                            filteredSections.push(sec);
                        }
                    });
                    template.templatePayload.section = filteredSections;
                }
                if (template.type) {
                    itemObj['name'] = 'Default';
                    itemObj['isDefault'] = true;
                    this.defaultSelected = itemObj;
                    this.templatePagesList = Object.assign([], template.templatePayload.section);
                    this.templatePagesListGoals = Object.assign([], template.templatePayload.goalSection);
                }
                this.templateList.push(itemObj);

            });
            this.templateList.push({ id: 'NONE', name: 'None' });
        }).catch(errorResponse => {
            this.templatePagesList = [];
            this.templatePagesListGoals = [];
            this.goalList = [];
        });
    }

    getAllPortfoliosData() {
        this.portfolioService.getAllPortfoliosData(this.clientId, false).toPromise().then(result => {
            this.portfolioList = result['portfolios'];
        }).catch(errorResponse => {
            this.portfolioList = [];
        });
    }

    templateSelect(selectedTemplete) {
        let selectedTemp = this.templateList.filter(x => x.id === selectedTemplete.id);
        this.model.templateName = selectedTemp[0].name;
        if(selectedTemp[0].reportFormat){
            this.model.reportFormat = this.reportFormats.filter(x => x.description == selectedTemp[0].reportFormat)[0];
        }else{
            this.model.reportFormat = '';
        }
        
        this.defaultSelected = selectedTemplete;
        if (selectedTemplete.id !== 'NONE') {
            const templateIndex = this.templateIdMapping[selectedTemplete.id];
            // this.templatePagesList = Object.assign([], this.allTemplates[templateIndex].templatePayload.section);
            this.templatePagesList = JSON.parse(JSON.stringify(this.allTemplates[templateIndex].templatePayload.section));
            this.templatePagesListGoals = JSON.parse(JSON.stringify(this.allTemplates[templateIndex].templatePayload.goalSection));
        }
    }

    // Select all / Select none
    selectPageSelection(isSelect: boolean) {
        this.templatePagesList.forEach(element => {
            if (!element.disabled) {
                element.isSelected = isSelect;
            }
        });
        if (this.templatePagesListGoals) {
            this.templatePagesListGoals.forEach(element => {
                element.isSelected = isSelect;
                element.isSelectedStrategy = isSelect;
            });
        }

        if (!this.defaultSelected['isDefault'] && this.defaultSelected['id'] !== 'NONE') {
            this.model.templateName = this.defaultSelected['name'];
            this.model.reportFormat = this.defaultSelected['documentFormat'];
        }
    }
    // in case of Appendix, disable 4 options below if Appendix disabled
    changePageSelection(selectionIdx: number) {
        if (this.templatePagesList[selectionIdx].disabled) {
            return;
        }
        this.templatePagesList[selectionIdx].isSelected = !this.templatePagesList[selectionIdx].isSelected;
        if (this.selectedDocument !== 'PROPLANNER') {
            if (selectionIdx === 4) {
                if (this.templatePagesList[4].isSelected) {
                    this.templatePagesList[5].isSelected = !this.templatePagesList[5].disabled;
                    this.templatePagesList[6].isSelected = !this.templatePagesList[6].disabled;
                    this.templatePagesList[7].isSelected = !this.templatePagesList[7].disabled;
                    this.templatePagesList[8].isSelected = !this.templatePagesList[8].disabled;
                } else {
                    this.templatePagesList[5].isSelected = false;
                    this.templatePagesList[6].isSelected = false;
                    this.templatePagesList[7].isSelected = false;
                    this.templatePagesList[8].isSelected = false;
                }
            }

            if (this.templatePagesList[5].isSelected || this.templatePagesList[6].isSelected || this.templatePagesList[7].isSelected || this.templatePagesList[8].isSelected) {
                this.templatePagesList[4].isSelected = true;
            } else {
                this.templatePagesList[4].isSelected = false;
            }
        }
    }
    changePageSelectionGoalsCurrent(selectionIdx: number) {
        this.templatePagesListGoals[selectionIdx].isSelected = !this.templatePagesListGoals[selectionIdx].isSelected;
    }
    changePageSelectionGoalsStrategy(selectionIdx: number) {
        this.templatePagesListGoals[selectionIdx].isSelectedStrategy = !this.templatePagesListGoals[selectionIdx].isSelectedStrategy;
    }

    SaveTemplate() {
        const existTemplate = this.templateList.filter(x => x.name.toLowerCase() === this.model.templateName.toLowerCase());
        const isSelected = {};
        let confirmMessage = [];
        let count = 0;
        const templatePagesListGoalsToSave = [];
        this.templatePagesList.forEach(item => {
            isSelected[item.id.trim()] = item.isSelected;
            if (item.isSelected) {
                count++;
            }
        });
        // remove duplicate goal type and make up 3 types if some type missing
        if (this.selectedDocument === 'PROPLANNER') {
            let goalSectionKeys = [];
            this.templatePagesListGoals.forEach(item => {
                isSelected[item.id.trim()] = item.isSelected;
                if (item.isSelected) {
                    count++;
                }
                const key = item.id.trim() + item.goalType;
                if (goalSectionKeys.indexOf(key) === -1) {
                    goalSectionKeys.push(key);
                    item.goalId = null;
                    templatePagesListGoalsToSave.push(item);
                }
            });
            goalSectionKeys = [];
            templatePagesListGoalsToSave.forEach(item => {
                const key = item.id.trim() + item.goalType;
                if (goalSectionKeys.indexOf(key) === -1) {
                    goalSectionKeys.push(key);
                }
            });
            this.templatePagesListGoalsDefaultTemplate.forEach(item => {
                const key = item.id.trim() + item.goalType;
                if (goalSectionKeys.indexOf(key) === -1) {
                    goalSectionKeys.push(key);
                    templatePagesListGoalsToSave.push(item);
                }
            });
        }

        if (count <= 0) {
            this.translate.get(['ALERT_MESSAGE.ERROR_TITLE', 'DOCUMENT.GENERATE_DOCUMENT.PAGE_NOT_SELECT_MESSAGE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    Swal(res['ALERT_MESSAGE.ERROR_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.PAGE_NOT_SELECT_MESSAGE'], 'error');
                });
            return;
        }
        const template = {
            'documentId': this.selectedDocument,
            'section': this.templatePagesList,
            'goalSection': templatePagesListGoalsToSave.length === 0 ? null : templatePagesListGoalsToSave,
            'templateName': this.model.templateName,
            'documentFormat':this.model.reportFormat.description
        };
        if (existTemplate.length > 0) {
            if (existTemplate[0].id === 'NONE' || existTemplate[0].id === 'DEFAULT') {
                this.translate.get(['ALERT_MESSAGE.ERROR_TITLE', 'DOCUMENT.GENERATE_DOCUMENT.SELECT_EXIST_TEMPLATE_ERROR'])
                    .pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
                        Swal(res['ALERT_MESSAGE.ERROR_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.SELECT_EXIST_TEMPLATE_ERROR'], 'error');
                    });
                return;
            }
            this.translate.get(['DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_CONFIRM.TITLE',
                'DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_CONFIRM.TEXT', 'DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_CONFIRM.CONFIRMBUTTONTEXT'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
                    confirmMessage = res;
                });
            Swal({
                title: confirmMessage['DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_CONFIRM.TITLE'],
                text: confirmMessage['DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_CONFIRM.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: confirmMessage['DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_CONFIRM.CONFIRMBUTTONTEXT'],
            }).then((result) => {
                if (result.value) {
                    // if (!this.hasPortfolio) {
                    //      this.saveDocument();
                    // }
                    this.documentService.updateTemplate(template).toPromise().then(response => {
                        this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_UPDATED_MESSAGE']).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                            Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_UPDATED_MESSAGE'], 'success');
                        });
                        this.defaultSelected = existTemplate[0];
                        this.getDocumentPageSelection();
                    }).catch(errorResponse => {

                    });
                }
                return result;
            });
        } else {
            this.documentService.saveTemplate(template).toPromise().then(response => {
                this.getDocumentPageSelection();
                this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_SAVE_MESSAGE']).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.TEMPLATE_SAVE_MESSAGE'], 'success');
                });
            }).catch(errorResponse => {

            });
        }
    }

    // get template form api if update or add new
    changeTemplateNone() {
        if (this.defaultSelected['isDefault']) {
            this.defaultSelected = { id: 'NONE', name: 'None', isDefault: false };
        } else if (this.defaultSelected['id'] === 'NONE') {
            this.model.templateName = '';
        } else {
            this.model.templateName = this.defaultSelected['name'];
            this.model.reportFormat = this.defaultSelected['documentFormat'];
        }
    }

    // saveGenerateDocument() {
    //     if (!this.hasPortfolio && this.model.templateName !== '' && this.model.templateName) {
    //         // Save template and Generate document both
    //         this.SaveTemplate();
    //     } else {
    //         // Save only generate document
    //         this.saveDocument();
    //     }
    // }

    saveDocument() {
        this.loading = true;
        const includeSection = {};
        let count = 0;
        this.templatePagesList.forEach(item => {
            includeSection[item.id.trim()] = item.isSelected;
            if (item.isSelected) {
                count++;
            }
        });
        if (count <= 0) {
            this.translate.get(['ALERT_MESSAGE.ERROR_TITLE', 'DOCUMENT.GENERATE_DOCUMENT.PAGE_NOT_SELECT_MESSAGE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    Swal(res['ALERT_MESSAGE.ERROR_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.PAGE_NOT_SELECT_MESSAGE'], 'error');
                });
            this.loading = false;
            return;
        }
        let portfolioId = '';
        if (this.model.portfolio) {
            portfolioId = this.model.portfolio.id;
        }
        const generateDocument = {
            documentType: this.model.fileUnderType['typeId'],
            familyId: this.clientId,
            section: this.templatePagesList,
            goalSection: this.templatePagesListGoals,
            portfolioId: portfolioId,
            documentFormat: !this.model.reportFormat ? 1:this.model.reportFormat.id
            //  documentId: 'DOC1' // this.selectedDocument
        };
        this.documentService.saveGenerateDocument(generateDocument).toPromise().then(response => {
            this.loading = false;
            if (response) {
                this.documentService.getClientDocumentPayloads(this.clientId);
                this.advisorService.getAdvisorDocumentPayload();
                const headers = response.headers.get('content-disposition');
                const filename = headers.split('=')[1];
                const docId = response.headers.get('Doc-Id');
                // this.documentService.downloadFile(response.body, filename);
                this.translate.get([
                    'ALERT_MESSAGE.SUCCESS_TITLE',
                    'DOCUMENT.GENERATE_DOCUMENT.DUCUMENT_GENERATED_MESSAGE',
                    'DOCUMENT.GENERATE_DOCUMENT.DUCUMENT_DOWNLOAD_QUESTION',
                    'DOCUMENT.GENERATE_DOCUMENT.DOWNLOAD_MESSAGE',
                    'DOCUMENT.GENERATE_DOCUMENT.DOWNLOAD'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    Swal({
                        title: res['DOCUMENT.GENERATE_DOCUMENT.DUCUMENT_GENERATED_MESSAGE'],
                        text: res['DOCUMENT.GENERATE_DOCUMENT.DUCUMENT_DOWNLOAD_QUESTION'],
                        type: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: res['DOCUMENT.GENERATE_DOCUMENT.DOWNLOAD']
                    }).then(result => {
                        if (result.value) {
                            this.documentService.downloadFile(response.body, filename, docId).pipe(takeUntil(this.unsubscribe$)).subscribe(r => { this.documentService.eventEmitter.emit(); });
                            Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.DOWNLOAD_MESSAGE'], 'success');
                        }
                        this.back();
                    });
                });
                this.model = {};
                this.templatePagesList = null;
                this.hasPortfolio = false;
                this.portfolioList = null;
                this.documentList = [];
                this.selectedDocument = null;
                this.model.portfolio = null;
            }
        }).catch(err => {
            Swal('Error', err.error.errorMessage, 'error');
            this.loading = false;
        });
    }

    back() {
        this._location.back();
    }

    convertGoalType(goalType: number) {
        if (goalType === 3) {
            return 'EDU';
        } else if (goalType === 2) {
            return 'RETIRE';
        } else {
            return 'OTHERS';
        }
    }

    getGoalDescById(goalId: string) {
        return this.goalList.filter(g => g.goalId === goalId).map(g => g.goalDesc);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}


