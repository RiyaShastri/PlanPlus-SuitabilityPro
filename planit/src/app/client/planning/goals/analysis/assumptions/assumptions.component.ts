import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../../shared/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalService } from '../../../../service';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import {
    AppState,
    getClientPayload,
} from '../../../../../shared/app.reducer';
@Component({
    selector: 'app-assumptions',
    templateUrl: './assumptions.component.html',
    styleUrls: ['./assumptions.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AssumptionsComponent implements OnInit, OnDestroy {

    goalId;
    clientId;
    options = [
        { id: 1, description: 'Current' },
        { id: 2, description: 'Strategy' }
    ];
    type = 'current';
    selectedOption = this.options[0];
    portfolioTypes = [];
    incomeDistributionInvalid = false;
    data: any = {};
    assumptions: any;
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
    });
    percentMask1 = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    percentMask2 = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    incomeDistribution = [];
    clientData = {};
    currency = '$';
    saveDisable = false;
    retirementGoal = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private router: Router,
        private goalsService: GoalService,
        private sharedService: RefreshDataService,
        private translateService: TranslateService
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.type = param['type'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.goalId = param['goalId'];
        });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
     this.goalsService.getGoalByGoalId(this.goalId).toPromise().then(response => {
        if (response) {
            this.retirementGoal = response['goalType'] === '2';
        }});
        this.selectedOption = this.options.find(opt => (opt.description).toLowerCase() === this.type);
        this.goalsService.getPortfolioTypesForAssumptions(this.clientId).toPromise().then(res => {
            this.portfolioTypes = res;
            this.sharedService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
                if (message.includes('pass_assumptions_data|')) {
                    this.data = JSON.parse(message.replace('pass_assumptions_data|', ''));
                    this.processAssumptionsData();
                } else {
                    this.goalsService.getAssumptionsData(this.goalId, 'Strategy Scenario').toPromise().then(response => {
                        this.data = response;
                        this.processAssumptionsData();
                    });
                }
            });
        });
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
            this.processAssumptionsData();
        });
    }

    async processAssumptionsData() {
        this.assumptions = null;
        this.data['activeGoal'] = this.goalId;
        if (this.type === 'current') {
            this.data['selectedScenario'] = 'Current Scenario';
            this.assumptions = await this.data['scenarios'].find(s => s.scenarioName === 'Current Scenario');
            // this.assumptions = JSON.parse(JSON.stringify(assumptions));
        } else if (this.type === 'strategy') {
            this.data['selectedScenario'] = 'Strategy Scenario';
            this.assumptions = await this.data['scenarios'].find(s => s.scenarioName === 'Strategy Scenario');
            // this.assumptions = JSON.parse(JSON.stringify(assumptions));
        }
        this.assumptions['useCustom'] = !this.assumptions['useDefault'];
        this.assumptions['portfolio'] = this.portfolioTypes.find(p => p.id === this.assumptions['investmentStrategy']);
        this.assumptions['weightedAmount'] = this.assumptions['investmentStrategyDTO']['portfolioSummaryPayloads'].reduce((sum, item) => sum + item.amount, 0);
        this.assumptions['returnOnAssets'] = this.assumptions['returnOnAssets'].endsWith('%') ? parseFloat((this.assumptions['returnOnAssets'].slice(0, -1)))
            : parseFloat(this.assumptions['returnOnAssets']);
        this.assumptions['standardDeviation'] = this.assumptions['standardDeviation'].endsWith('%') ? parseFloat((this.assumptions['standardDeviation'].slice(0, -1)))
            : parseFloat(this.assumptions['standardDeviation']);
        this.assumptions['cclassTaxDefe'] = this.assumptions['cclassTaxDefe'].endsWith('%') ? parseFloat((this.assumptions['cclassTaxDefe'].slice(0, -1)))
            : parseFloat(this.assumptions['cclassTaxDefe']);

        this.translateService.get([
            'GOAL.ANALYSIS.LABEL.INTEREST',
            'GOAL.ANALYSIS.LABEL.DIVIDEND',
            'GOAL.ANALYSIS.LABEL.DEFERRED_CAPITAL_GAINS',
            'GOAL.ANALYSIS.LABEL.REALIZED_CAPITAL_GAINS',
            'GOAL.ANALYSIS.LABEL.NON_TAXABLE'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.incomeDistribution = [
                { displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.INTEREST'], valueKey: 'interest' },
                { displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.DIVIDEND'], valueKey: 'dividend' },
                { displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.DEFERRED_CAPITAL_GAINS'], valueKey: 'capitalGains' },
                { displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.REALIZED_CAPITAL_GAINS'], valueKey: 'realized' },
                { displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.NON_TAXABLE'], valueKey: 'nonTaxable' }
            ];
        });
        this.incomeDistribution.forEach(a => {
            const customValue = this.assumptions[a['valueKey'] + 'CustomStr'];
            this.assumptions[a['valueKey'] + 'CustomStr'] = customValue.endsWith('%') ? parseFloat((customValue.slice(0, -1))) : parseFloat(customValue);
            const defaultValue = this.assumptions[a['valueKey'] + 'DefaultStr'];
            this.assumptions[a['valueKey'] + 'DefaultStr'] = defaultValue.endsWith('%') ? parseFloat((defaultValue.slice(0, -1))) : parseFloat(defaultValue);
        });
    }

    saveAssumptions() {
        this.saveDisable = true;
        if (this.type === 'current') {
            this.data['scenarios'].forEach(element => {
                if (element.scenarioName === 'Current Scenario') {
                    this.assumptions['useDefault'] = !this.assumptions['useCustom'];
                    element = Object.assign({}, this.assumptions);
                    element['investmentStrategy'] = this.assumptions['portfolio']['id'];
                }
            });
        } else {
            this.data['scenarios'].forEach(element => {
                if (element.scenarioName === 'Strategy Scenario') {
                    this.assumptions['useDefault'] = !this.assumptions['useCustom'];
                    element = Object.assign({}, this.assumptions);
                    element['investmentStrategy'] = this.assumptions['portfolio']['id'];
                }
            });
        }
        this.goalsService.updateAssumptionsData(this.data).toPromise().then(res => {
            this.translateService.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'GOAL.ANALYSIS.POPUP.ASSUMPTIONS_SUCCESS'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['GOAL.ANALYSIS.POPUP.ASSUMPTIONS_SUCCESS'], 'success');
            });
            this.saveDisable = false;
            this.sharedService.changeMessage('assumptions updated');
            this.back();
        }).catch(err => {
            this.translateService.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
            this.saveDisable = false;
        });
    }

    portfolioSelected() {
        if (this.type === 'current') {
            this.data['scenarios'].forEach(element => {
                if (element.scenarioName === 'Current Scenario') {
                    element['investmentStrategy'] = this.assumptions['portfolio']['id'];
                }
            });
        } else if (this.type === 'strategy') {
            this.data['scenarios'].forEach(element => {
                if (element.scenarioName === 'Strategy Scenario') {
                    element['investmentStrategy'] = this.assumptions['portfolio']['id'];
                }
            });
        }
        this.goalsService.updateAssumptionsData(this.data).toPromise().then(res => {
            this.translateService.get([
                'ALERT.TITLE.SUCCESS',
                'GOAL.ANALYSIS.POPUP.ASSUMPTIONS_PORTFOLIO_UPDATED'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT.TITLE.SUCCESS'], i18text['GOAL.ANALYSIS.POPUP.ASSUMPTIONS_PORTFOLIO_UPDATED'], 'success');
            });
            this.assumptions = null;
            this.sharedService.changeMessage('porfolio in assumptions updated');
            this.goalsService.getAssumptionsData(this.goalId, 'Strategy Scenario').toPromise().then(response => {
                this.data = response;
                this.processAssumptionsData();
            }).catch(err => { });
        }).catch(err => {
            swal('Oops!', 'Issue in updating portfolio selection.', 'error');
        });
    }

    changeOption(optId) {
        this.selectedOption = this.options.find(opt => opt.id === optId);
        this.type = this.selectedOption.description.toLowerCase();
        this.router.navigate(['/client', this.clientId, 'planning', 'goals', this.goalId, 'analysis', 'assumptions', this.selectedOption.description.toLowerCase()]);
        this.processAssumptionsData();
    }

    conserveTotalIncomeDistribution(){
        const total = parseInt(this.assumptions['dividendCustomStr'].toString().replace('%','')) + parseInt(this.assumptions['capitalGainsCustomStr'].toString().replace('%','')) + 
        parseInt(this.assumptions['realizedCustomStr'].toString().replace('%','')) + parseInt(this.assumptions['nonTaxableCustomStr'].toString().replace('%',''));
        
        if (total <= 100){
            this.assumptions['interestCustomStr'] = 100 - total;
        }
        
        const interest = parseInt(this.assumptions['interestCustomStr'].toString().replace('%',''));
        const grandTotal = total + interest;
        
        if(grandTotal == 100){
            this.incomeDistributionInvalid = false;
        } else if(grandTotal != 100){
            this.incomeDistributionInvalid = true;
        }

    }

    setInvalidFlagIfCustomAndInvalidIncomeDistribution(){
        if(!this.assumptions['useCustom']){
            this.incomeDistributionInvalid = false;
        }else{
            this.conserveTotalIncomeDistribution();
        }
    }

    back() {
        this.sharedService.changeMessage('default message');
        this.router.navigate(['/client', this.clientId, 'planning', 'goals', this.goalId, 'analysis']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
    

}
