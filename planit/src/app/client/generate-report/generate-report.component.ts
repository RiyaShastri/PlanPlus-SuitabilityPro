import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { slideInOutAnimation } from '../../shared/animations';
import { RefreshDataService, Scenario } from '../../shared/refresh-data';
import {
    GENERATE_REPORT_PREVIOUS_URL, GENERATE_REPORT_CRITERIA_ID, GENERATE_REPORT_CRITERIA_DESCRIPTION,
    GENERATE_REPORT_FORMATE_DESCRIPTION, GENERATE_REPORT_FORMATE_ID, GENERATE_REPORT_REPORT_TYPES,
    ENTITY_REPORT_TYPES, ESTATE_REPORT_TYPES, BUDGET_REPORT_TYPES, GOAL_REPORT_TYPES, INVESTMENT_REPORT_TYPES, WEALTH_REPORT_TYPES,
    FAMILY_MEMBER_DROPDOWN_TYPE, SCENARIOS, ENTITY_SSID
} from '../../shared/constants';
import { GoalService, PlanningService, DocumentService, EstateService, PortfolioService, ClientProfileService } from '../service';
import { AccessRightService } from '../../shared/access-rights.service';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../shared/app.reducer';

@Component({
    selector: 'app-generate-report',
    templateUrl: './generate-report.component.html',
    styleUrls: ['./generate-report.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class GenerateReportComponent implements OnInit, OnDestroy {
    allExpanded = false;
    clientId;
    criterias :any[] = [
        { id: GENERATE_REPORT_CRITERIA_ID.PERSONAL, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.PERSONAL }
    ];
    portfolios = [];
    private readonly pdfFormat = { id: GENERATE_REPORT_FORMATE_ID.PDF, description: GENERATE_REPORT_FORMATE_DESCRIPTION.PDF };
    private readonly wordFormat = { id: GENERATE_REPORT_FORMATE_ID.WORD, description: GENERATE_REPORT_FORMATE_DESCRIPTION.WORD };
    reportFormats = [this.pdfFormat];
    reportFormatsTaxAudit = [
        { id: GENERATE_REPORT_FORMATE_ID.EXCEL, description: GENERATE_REPORT_FORMATE_DESCRIPTION.EXCEL }
    ];
    portfolioId;
    portfolioType;
    selectedPortfolio;
    holdingType = 'Current';
    clientData: any = {};
    planningCountry;

    selectedFormat;
    selectedFormatTaxAudit;
    isWealth = false;
    isInvestment = false;
    isGoal = false;
    previousUrl;
    GENERATE_REPORT_PREVIOUS_URL = GENERATE_REPORT_PREVIOUS_URL;
    accorIndex = [];
    isBudget = false;
    isEstatePlanning = false;
    selectedReport = null;
    saveDisable = false;
    cancelDisable = false;
    REPORT_TYPES = GENERATE_REPORT_REPORT_TYPES;
    taxReportScenarioOptions = [];
    taxReportScenario;
    accessRights;
    isGoalHidden = true;
    isPortfolioHidden = true;
    goalsList = [];
    goals = [];
    entities = [];
    selectedEntity = null;
    showScenario = false;
    entityScenarios = [];
    selectedEntityScenario = {};
    scenarioList: Scenario[];
    selectedScenario: Scenario;
    criteria;
    goal;
    portfolio;
    blob: Blob;
    url: string;
    isEntity = false;
    entityReportTypes = ENTITY_REPORT_TYPES;
    estateReportTypes = ESTATE_REPORT_TYPES;
    budgetReportTypes = BUDGET_REPORT_TYPES;
    goalReportTypes = GOAL_REPORT_TYPES;
    investmentReportTypes = INVESTMENT_REPORT_TYPES;
    wealthReportTypes = WEALTH_REPORT_TYPES;
    ENTITY = FAMILY_MEMBER_DROPDOWN_TYPE['ENTITY'];
    REPORT = ENTITY_SSID.REPORT;

    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: ActivatedRoute,
        private datasharing: RefreshDataService,
        private translate: TranslateService,
        private planningService: PlanningService,
        private location: Location,
        private documentService: DocumentService,
        private accessRightsService: AccessRightService,
        private estateService: EstateService,
        private goalService: GoalService,
        private portfolioService: PortfolioService,
        private clientProfileService: ClientProfileService,
        private store: Store<AppState>,
    ) {
        this.router.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.datasharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            this.accorIndex = [];
            if (message.includes('go_to_generateReport')) {
                this.previousUrl = JSON.parse(message.replace('go_to_generateReport|', ''));
                this.isGoal = false;
                this.isWealth = false;
                this.isInvestment = false;
                this.isBudget = false;
                this.isEstatePlanning = false;
                this.isEntity = false;

                switch (this.previousUrl) {
                    case this.GENERATE_REPORT_PREVIOUS_URL.GOAL:
                        this.isGoal = true;
                        this.accorIndex.push(2);
                        break;

                    case this.GENERATE_REPORT_PREVIOUS_URL.ASSETS_LIABILITY:
                        this.isWealth = true;
                        this.accorIndex.push(0);
                        break;

                    case this.GENERATE_REPORT_PREVIOUS_URL.PORTFOLIO:
                        this.isInvestment = true;
                        this.accorIndex.push(1);
                        break;

                    case this.GENERATE_REPORT_PREVIOUS_URL.CASHFLOW_MANAGEMENT:
                        this.isBudget = true;
                        this.accorIndex.push(3);
                        break;

                    case this.GENERATE_REPORT_PREVIOUS_URL.ESTATE_PLANNING:
                        this.isEstatePlanning = true;
                        this.accorIndex.push(4);
                        break;

                    case this.GENERATE_REPORT_PREVIOUS_URL.ENTITY:
                        this.isEntity = true;
                        this.accorIndex.push(5);
                        break;

                    default:
                        break;
                }
            }
        });
    }

    ngOnInit() {
        this.accessRightsService.getAccess(['EST01_SP', 'EST02_SP', 'WORDDOC', 'EST03_SP', 'EST04_SP', 'CLI13_SP', 'HLDST', 'NETWT', 'FFS01', 'TXDRP', 'PORTROLLUP', 'GOALNOBJ', 'ENTITY', 'DISPOSITION', 'PORTIMPLTAB']).pipe(takeUntil(this.unsubscribe$))
            .subscribe(res => {
                this.accessRights = res;
                if (this.accessRights['WORDDOC']['accessLevel'] > 0) {
                    this.reportFormats.push(this.wordFormat);
                }
            });
        this.getGoalList();
        this.getEntityList();
        if (this.reportFormats.length === 1) {
            this.selectedFormat = this.reportFormats[0];
        }
        if (this.reportFormatsTaxAudit.length === 1) {
            this.selectedFormatTaxAudit = this.reportFormatsTaxAudit[0];
        }
        this.translate.stream([
            'GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_CLIENT_FIRST_DEATH',
            'GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_SPOUSE_SECOND_DEATH',
            'GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_SPOUSE_FIRST_DEATH',
            'GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_CLIENT_SECOND_DEATH',
            'ENTITY.CURRENT_SCENARIO',
            'ENTITY.STRATEGY_SCENARIO',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            this.taxReportScenarioOptions = [
                { id: 'rpt3-1-1', description: text['GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_CLIENT_FIRST_DEATH'] },
                { id: 'rpt3-2-2', description: text['GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_SPOUSE_SECOND_DEATH'] },
                { id: 'rpt3-2-1', description: text['GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_SPOUSE_FIRST_DEATH'] },
                { id: 'rpt3-1-2', description: text['GENERATE_REPORT.TAX_REPORT_SCENARIOS.ON_CLIENT_SECOND_DEATH'] }
            ];

            this.entityScenarios = [
                {
                    id: SCENARIOS.CURRENT_SCENARIO,
                    name: text['ENTITY.CURRENT_SCENARIO']
                },
                {
                    id: SCENARIOS.STRATEGY_SCENARIO,
                    name: text['ENTITY.STRATEGY_SCENARIO']
                }
            ];
            this.selectedEntityScenario = this.entityScenarios[0];
        });

        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            if (this.clientData['planningCountry'] !== undefined) {
                this.planningCountry = this.clientData['planningCountry'];
            } else {
                this.planningCountry = 'CAN';   // default
            }
        });

        this.portfolioService.getListOfPortfolios(this.clientId).toPromise().then(async res => {
            this.portfolioType = await res['portfolios'];
            this.portfolios = [];
            for (const item of this.portfolioType) {
                const element = { id: item.id, description: item.description };
                this.portfolios.push(element);
            }
            if (this.portfolioType.length === 1) {
                this.selectedPortfolio = this.portfolioType[0];
            }
        });
    }

    back() {
        this.cancelDisable = true;
        this.location.back();
        this.cancelDisable = false;
    }

    expandALL() {
        this.allExpanded = !this.allExpanded;
        if (this.allExpanded === true) {
            this.isGoal = true;
            this.isInvestment = true;
            this.isWealth = true;
            this.isBudget = true;
            this.isEstatePlanning = true;
            this.isEntity = true;
            this.accorIndex = [0, 1, 2];
        } else {
            this.isGoal = false;
            this.isInvestment = false;
            this.isWealth = false;
            this.isBudget = false;
            this.isEstatePlanning = false;
            this.isEntity = true;
            this.accorIndex = [];
        }
    }

    openTab(event) {
        if (event.index === 0) {
            this.isWealth = true;
        } else if (event.index === 1) {
            this.isInvestment = true;
        } else if (event.index === 2) {
            this.isGoal = true;
        } else if (event.index === 3) {
            this.isBudget = true;
        }
        this.accorIndex.push(event.index);
        if (this.accorIndex.length === 4) {
            this.allExpanded = true;
        }
    }

    onTabClose(event) {
        for (let i = 0; i < this.accorIndex.length; i++) {
            if (this.accorIndex[i] === event.index) {
                this.accorIndex.splice(i, 1);
                if (event.index === 0) {
                    this.isWealth = false;
                } else if (event.index === 1) {
                    this.isInvestment = false;
                } else if (event.index === 2) {
                    this.isGoal = false;
                } else if (event.index === 3) {
                    this.isBudget = false;
                }
            }
        }
        if (this.accorIndex.length === 0) {
            this.allExpanded = false;
        }
    }

    generateReport(f: NgForm) {
        if (this.selectedReport === null) {
            this.translate.get([
                'GENERATE_REPORT.POPUP.REPORT_NOT_SELECTED',
                'ALERT_MESSAGE.OOPS_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], text['GENERATE_REPORT.POPUP.REPORT_NOT_SELECTED'], 'error');
            });
        }

        if (f.form.valid) {
            this.saveDisable = true;
            if (this.selectedReport['id'] === 'INCOME_TAX_PROJECTION') {
                this.createIncomeTaxReport();
            } else if (this.selectedReport['id'] === 'CASH_FLOW_REPORT') {
                this.createCashFlowReport();
            }else if (this.selectedReport['id'] === 'DISPOSITION_REPORT') {
                this.createDispositionReport();
            }else if (this.selectedReport['id'] === 'NET_WORTH') {
                this.createNetWorthReport();
            } else if (this.selectedReport['id'] === 'ROLLUP_REPORT') {
                this.createRollupReport();
            } else if (this.selectedReport['id'] === 'FUND_ROLLUP') {
                this.createFundRollupReport();
            } else if (this.selectedReport['id'] === 'DETAIL_IMPLEMENTATION_STRATEGY_REPORT') {
                this.createDetailedInvestmentStrategyReport();
            } else if (this.selectedReport['id'] === 'INVESTMENT_HOLDINGS') {
                this.createInvestmentHoldingsReport();
            } else if (this.selectedReport['id'] === 'DETAILED_ESTATE_ANALYSIS' ||
                this.selectedReport['id'] === 'ESTATE_NET_WORTH' ||
                this.selectedReport['id'] === 'ESTATE_LIQUIDITY_ANALYSIS' ||
                this.selectedReport['id'] === 'TAX'
            ) {
                this.createEstatePlanningReports();
            } else if (this.selectedReport['id'] === 'TAX_AUDIT_REPORT' ||
                this.selectedReport['id'] === 'GOALS_AND_OBJECTIVES') {
                this.createGoalReport();
            } else if (this.selectedReport['type'] === this.ENTITY) {
                this.createEntityCorpReport();
            }
        }
    }

    createEntityCorpReport() {
        this.planningService.createEntityReport(this.clientId, this.selectedEntity['entityId'], this.selectedEntityScenario['id'], this.selectedReport['value']).toPromise().then(response => {
            this.downloadReportFromResponse(response);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    downloadReport(file, filename, reportName) {
        this.translate.get([
            'GENERATE_REPORT.POPUP.REPORT_GENERATED_MESSAGE',
            'GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION',
            'CUSTOM.DOWNLOAD'
        ], { reportName: reportName }).pipe(takeUntil(this.unsubscribe$)).subscribe((text: string) => {
            Swal({
                title: text['GENERATE_REPORT.POPUP.REPORT_GENERATED_MESSAGE'],
                text: text['GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION'],
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: text['CUSTOM.DOWNLOAD']
            }).then(result => {
                if (result.value) {
                    this.documentService.downloadFile(file, filename);
                }
            });
        });
        this.saveDisable = false;
        this.back();
    }

    downloadReportFromResponse(res) {
        const file = res['body'];
        const headers = res.headers.get('content-disposition');
        const filename = headers.split('=')[1];
        this.translate.get([
            this.selectedReport['label'],
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            const selectedLableArr = (text[this.selectedReport['label']]).split(' ');
            const isTrue = (selectedLableArr[selectedLableArr.length - 1].toLowerCase()) === this.REPORT.toLowerCase();
            if (isTrue) {
                selectedLableArr.splice(-1, 1);
            }
            const lable = selectedLableArr.join(' ');
            this.downloadReport(file, filename, lable);
        });
    }

    displayErrorWithSSID(err) {
        this.translate.get([
            'ALERT_MESSAGE.OOPS_TEXT',
            'SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            if (JSON.parse(err).errorSsid) {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], text['SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid], 'error');
            } else {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(err).errorMessage, 'error');
            }
        });
        this.saveDisable = false;
    }

    createIncomeTaxReport() {
        this.planningService.generateIncomeTaxReport(this.clientId, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createGoalReport() {
        const generateReport = {
            reportType: this.selectedReport['value'],
            goalID: this.goal.id,
            criteria: this.criteria ? this.criteria['description'] : null,
            format: this.selectedReport['id'] === 'GOALS_AND_OBJECTIVES' ? this.selectedFormat['description'] : this.selectedFormatTaxAudit['description']
        };

        this.goalService.saveReport(this.clientId, generateReport).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.translate.get([
                'ALERT_MESSAGE.OOPS_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], '', 'error');
            });
            this.saveDisable = false;
        });
    }

    createNetWorthReport() {
        this.planningService.generateNetWorthReport(this.clientId, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createCashFlowReport() {
        this.planningService.generateCashFlowReport(this.clientId, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createDispositionReport() {
        const reportData = {
            assetKey: this.criteria.id,
            scenario: this.selectedScenario.id
        }
        this.planningService.generateDispositionReport(this.clientId, this.selectedFormat.description, reportData).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createInvestmentHoldingsReport() {
        this.planningService.generateInvestmentHoldingsReport(this.clientId, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createEstatePlanningReports() {
        let reportType = this.selectedReport['value'];
        if (this.selectedReport['id'] === 'TAX') {
            reportType = this.taxReportScenario.id;
        }
        this.estateService.generateEstatePlanningReport(this.clientId, this.selectedFormat.description, reportType).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    getGoalList() {
        this.goalService.getGoalsByClientId(this.clientId).toPromise().then(res => {
            this.goalsList = res;
            this.goals = [];
            this.goalsList.forEach(goal => {
                const goals = { id: goal.key, description: goal.description };
                this.goals.push(goals);
            });
        });
    }

    getEntityList() {
        this.clientProfileService.getEntityList(this.clientId).toPromise().then(res => {
            this.entities = res;
        });
    }

    async showGoals(selectedField: string) {
        if (selectedField === 'goals_objectives' || selectedField === 'tax_audit') {
            this.isGoalHidden = false;
            this.showScenario = false;
            this.isPortfolioHidden = true;
            this.criterias = [
                { id: GENERATE_REPORT_CRITERIA_ID.CURRENT, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.CURRENT },
                { id: GENERATE_REPORT_CRITERIA_ID.ALTERNATE, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.ALTERNATE }
            ];
        } else if (selectedField === 'investment fund_rollup') {
            this.isGoalHidden = true;
            this.isPortfolioHidden = false;
            this.showScenario = false;

            this.criterias = [
                { id: GENERATE_REPORT_CRITERIA_ID.CURRENT, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.CURRENT }  // only current holding is available.
            ];
            // check for access to implementation
            if (this.accessRights['PORTIMPLTAB']['accessLevel'] > 0) {
                // check if the portfolio has had a solution applied
                this.portfolioService.getRecommendedSolution(this.selectedPortfolio['id']).toPromise().then(res => {
                    if (res) {
                        this.criterias = [
                            { id: GENERATE_REPORT_CRITERIA_ID.CURRENT, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.CURRENT },
                            { id: GENERATE_REPORT_CRITERIA_ID.IMPLEMENTED, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.IMPLEMENTED }  
                        ];
                    }
                });
            }
            if (this.portfolioType !== undefined) {
                for (const item of this.portfolioType) {
                    const element = { id: item.id, description: item.description };
                    this.portfolios.push(element);
                }
                if (this.portfolioType.length === 1) {
                    this.selectedPortfolio = this.portfolioType[0];
                }
            }
        } else {
            this.isGoalHidden = true;
            this.isPortfolioHidden = true;
            this.showScenario = false;
            this.criterias = [
                { id: GENERATE_REPORT_CRITERIA_ID.PERSONAL, description: GENERATE_REPORT_CRITERIA_DESCRIPTION.PERSONAL }

            ];
            if(selectedField === 'disposition_report'){
                await this.loadScenarios();
                this.criterias = await this.populateCriteriaDropdown();
                this.showScenario = true;
            }
        }
    }

    async loadScenarios(){
        if(!this.scenarioList){
            this.scenarioList = [];
            await this.clientProfileService.getClientScenarios(this.clientId,false).toPromise().then((result: any[]) => result.forEach(scenario => {
                this.scenarioList.push({ name: scenario.scenarioDescription, id: scenario.scenarioType })
            }));
        }
        
    }

    async populateCriteriaDropdown(){
        let criterias = [];
        await this.planningService.getAccountList(this.clientId).toPromise().then(account => {
            for (let prop in account) {
                criterias.push({ id: prop, description: account[prop] });
            }
        });

        return criterias;
    }

    checkPortfolio(event) {
        if (this.portfolio !== undefined) {
            this.selectedPortfolio = this.portfolio;
        } else if (this.portfolioType !== undefined && this.portfolioType.length > 0) {
            this.selectedPortfolio = this.portfolioType[0];
        }
    }

    checkCriteria(event) {
        if (this.criteria !== undefined) {
            this.holdingType = this.criteria;
        } else {
            this.holdingType = 'Current';   // default at this moment.
        }
    }

    createRollupReport() {
        this.planningService.generateRollupReport(this.clientId, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createDetailedInvestmentStrategyReport() {
        this.planningService.generateDetailedInvestmentStrategyReort(this.clientId, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createFundRollupReport() {
        const payload = {
            portfolioNum: this.selectedPortfolio['id'],
            holdingType: this.holdingType
        };
        this.planningService.generateFundRollupReort(this.planningCountry, payload, this.selectedFormat.description).toPromise().then(res => {
            this.downloadReportFromResponse(res);
        }).catch(err => {
            this.displayErrorWithSSID(err);
        });
    }

    createEntityReport() {

    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
