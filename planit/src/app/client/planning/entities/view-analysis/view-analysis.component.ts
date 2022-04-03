import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { CORPORATION_OPTIONS, ENTITY_OWNERSHIP_SHARE_TYPE, ENTITY_INCOME_DISTRIBUTION } from '../../../../shared/constants';
import { getClientPayload, AppState } from '../../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { ClientProfileService, EntitiesService, PlanningService } from '../../../service';
import { ENTITY_SSID, SCENARIOS } from '../../../../shared/constants';
import { Relation } from '../../../client-models/family-member';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-view-analysis',
    templateUrl: './view-analysis.component.html',
    styleUrls: ['./view-analysis.component.css']
})
export class ViewAnalysisComponent implements OnInit, OnDestroy {
    unsubscribe$ = new Subject<void>();
    clientId;
    entityId;
    clientData;
    entityDetail = {};
    generalAssumption = {};
    investmentRiskReturn = [];
    totalInvestmentReturn = 0;
    currentYearIncomeData = [];
    currentYearDistributions = [];
    ownershipTable = [];
    longTermIncome = [];
    longTermWithdrawals = [];
    sources = {};
    CORPORATION_OPTIONS = CORPORATION_OPTIONS;
    SSID = ENTITY_SSID;
    relation = Relation;
    SHARE_TYPE = ENTITY_OWNERSHIP_SHARE_TYPE;
    roles = {};
    retainedEarnings = [];
    retainedEarningsOwners = [];
    selectedScenario = SCENARIOS.CURRENT_SCENARIO;
    entityIncomeDistributionTypes = ENTITY_INCOME_DISTRIBUTION;
    apiCalled = 0;
    totalApiCalls = 7;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private entitiesService: EntitiesService,
        private planningService: PlanningService,
        private pageTitleService: PageTitleService,
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_VIEW_ANALYSIS');
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.entitiesService.viewAnalysisProgressBar(this.clientId, this.entityId).toPromise().then(response => {
                this.planningService.getClientPlanningSummary(this.clientId);
            }).catch(err => { });
            this.loadEntityData();
        });
    }

    loadEntityData() {
        this.clientProfileService.getEntityByEntityId(this.clientId, this.entityId).toPromise().then(entity => {
            this.apiCalled++;
            this.entitiesService.getTaxAssumptionData(this.clientId, this.entityId).toPromise().then(assumption => {
                this.apiCalled++;
                this.entityDetail = entity;
                this.generalAssumption = assumption;
            });
        }).catch(entityError => {
            if (entityError.status === 403 || entityError.status === 404) {
                this.router.navigate(['/client/' + this.clientId + '/planning/entities/list']);
            }
        });

        this.relation.forEach(element => {
            this.roles[element.id] = element.name;
        });

        this.entitiesService.getInvestmentReturnRiskData(this.clientId, this.entityId, this.selectedScenario).toPromise().then(currentRiskReturn => {
            this.apiCalled++;
            this.investmentRiskReturn = [];
            this.totalInvestmentReturn = currentRiskReturn['returnOnAssets'];
            this.entityIncomeDistributionTypes.forEach(distributionType => {
                const distributionObj = {
                    description: distributionType.description,
                    distributionValue: (currentRiskReturn.hasOwnProperty(distributionType.valueKey)) ? currentRiskReturn[distributionType.valueKey] : 0
                };
                distributionObj['distributionRisk'] = (distributionObj['distributionValue'] * currentRiskReturn['returnOnAssets']) / 100;
                this.investmentRiskReturn.push(distributionObj);
            });
        });

        this.entitiesService.getSourcesList(this.clientId).toPromise().then(sources => {
            this.apiCalled++;
            this.entitiesService.getEntityCurrentData(this.clientId, this.entityId, this.selectedScenario).toPromise().then(res => {
                this.apiCalled++;
                this.currentYearIncomeData = res['currentYearIncomePayloads'];
                this.currentYearDistributions = res['currentYearDistributionPayloads'];
                this.retainedEarnings = [];
                const earningsData = res['retainedEarnings']['retainedEarningsPayloads']['salaryDetailsBuilder'];
                earningsData.forEach((earning, earningIndex) => {
                    earning['ownerData'] = [];
                    earning['isTotalRow'] = false;
                    if (earning['ssid'] === ENTITY_SSID.TOTAL_DISTRIBUTION || earning['ssid'] === ENTITY_SSID.TOTAL_RETAINED_TAX) {
                        earning['isTotalRow'] = true;
                    }
                    res['retainedEarnings']['salaryDetails'].forEach(ownerEarning => {
                        if (earningIndex < ownerEarning['salaryDetailsBuilders'].length) {
                            earning['ownerData'].push({
                                personalKey: ownerEarning['personalKey'],
                                value: ownerEarning['salaryDetailsBuilders'][earningIndex]['value']
                            });
                        } else {
                            earning['ownerData'].push({
                                personalKey: ownerEarning['personalKey'],
                                value: ''
                            });

                        }
                    });
                });
                this.retainedEarningsOwners = res['retainedEarnings']['salaryDetails'];
                this.retainedEarnings = earningsData;
            });
            sources.forEach(source => {
                this.sources[source['id']] = source;
            });
        });

        this.clientProfileService.getOwnershipTabel(this.clientId, this.entityId).toPromise().then(ownershipObj => {
            this.apiCalled++;
            this.ownershipTable = [];
            const shareDistributions = ownershipObj['shareDistributions'];
            shareDistributions[0]['owners'].forEach((owner, ownerIndex) => {
                const ownerObj = Object.assign({}, owner);
                ownerObj['shares'] = [];
                ownershipObj['shareDistributions'].forEach(shareObj => {
                    const share = {
                        'shareClassId': shareObj['shareClassId'],
                        'shareClassDesc': shareObj['shareClassDesc'],
                        'ownerOwnedPercentage': shareObj['owners'][ownerIndex]['ownerOwnedPercentage']
                    };
                    ownerObj['shares'].push(share);
                });
                this.ownershipTable.push(ownerObj);
            });
        }).catch(errorResponse => {
            this.ownershipTable = [];
        });

        this.entitiesService.getLongTermIncomeDistributionData(this.clientId, this.entityId, this.selectedScenario).toPromise().then(res => {
            this.apiCalled++;
            this.longTermIncome = res['longTermIncomeHelpers'];
            this.longTermWithdrawals = res['longTermWithdrawalHelpers'];
        }).catch(err => {
            this.longTermIncome = [];
            this.longTermWithdrawals = [];
        });
    }

    changeEntity(entityId) {
        this.entityId = entityId;
        this.apiCalled = 0;
        this.router.navigate(['/client/' + this.clientId + '/planning/entities/' + this.entityId + '/view-analysis']);
    }

    changeScenario(value) {
        this.apiCalled = 0;
        this.selectedScenario = value.id;
        this.loadEntityData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
