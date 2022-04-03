import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { PlanningService } from '../../service';
import { AppState, getFamilyMemberPayload, getClientPayload, getGraphColours } from '../../../shared/app.reducer';
import { RefreshDataService } from '../../../shared/refresh-data';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { chartColors } from '../../client-models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../shared/constants';
import { fadeInAnimation } from '../../../shared/animations';

@Component({
    selector: 'app-cash-flow-management',
    templateUrl: './cash-flow-management.component.html',
    styleUrls: ['./cash-flow-management.component.css'],
    animations: [fadeInAnimation],
    // tslint:disable-next-line: use-host-property-decorator
    host: { '[@fadeInAnimation]': '' },
})
export class CashFlowManagementComponent implements OnInit, OnDestroy {
    clientId;
    isAddCustom = false;
    currencyPrefix = '$';
    currencyMask = createNumberMask({
        prefix: this.currencyPrefix
    });
    savingsTaxesObj = [];
    expenseObj = [];
    incomeObj = [];
    cashFlowDetails = [];
    incomeCategories = { categories: [], totalExpenses: 0, clientTotal: 0, spouseTotal: 0, total: 0, title: '', totalTitle: '', allExpanded: false, allowJoint: false, showExpenses: false };
    expenseCategories = { categories: [], totalExpenses: 0, clientTotal: 0, spouseTotal: 0, total: 0, title: '', totalTitle: '', allExpanded: false, allowJoint: false, showExpenses: false };
    savingsCategories = { categories: [], totalExpenses: 0, clientTotal: 0, spouseTotal: 0, total: 0, title: '', totalTitle: '', allExpanded: false, allowJoint: false, showExpenses: false };
    cashFlowData: any;
    client1;
    client2;
    clientData;
    cashFlowBackupData;
    graphColors = chartColors;
    graphDataProvider = [];
    showGraph = false;
    unallocated;
    personal;
    personalCategory;
    totalExpenses = { totalExpenses: 0, clientTotal: 0, spouseTotal: 0, total: 0 };
    cashFlowTotal = 0;
    saveDisable = false;
    dataLoaded = false;
    private unsubscribe$ = new Subject<void>();
    $calculate: Subject<void> = new Subject<void>();
    cashFlowPayload = {};
    PERSON_RELATION = PERSON_RELATION;
    constructor(
        private route: ActivatedRoute,
        private AmCharts: AmChartsService,
        private translate: TranslateService,
        private planningService: PlanningService,
        private store: Store<AppState>,
        private dataSharing: RefreshDataService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

        this.$calculate.debounceTime(2000).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.performCalculation();
        });
    }

    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyPrefix = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currencyPrefix
            });
        });
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.client1 = data['familyMembers'].filter(x => x.relation === PERSON_RELATION.CLIENT1)[0];
                this.client2 = data['familyMembers'].filter(x => x.relation === PERSON_RELATION.CLIENT2)[0];
            }
        });
        this.getCashFlowData();

        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_cashFlow')) {
                this.getCashFlowData();
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    getCashFlowData() {
        this.planningService.getCashFlowDetails(this.clientId).toPromise().then(res => {
            this.cashFlowData = res;
            this.incomeCategories.title = 'CASH_FLOW_MANAGEMENT.INCOME';
            this.incomeCategories.totalTitle = 'CASH_FLOW_MANAGEMENT.TOTAL_INCOME';
            this.expenseCategories.title = 'CASH_FLOW_MANAGEMENT.EXPENSES';
            this.expenseCategories.totalTitle = 'CASH_FLOW_MANAGEMENT.TOTAL_FAMILY_LIVING_EXPENSES';
            this.savingsCategories.title = 'CASH_FLOW_MANAGEMENT.SAVINGS_AND_TAXES';
            this.savingsCategories.totalTitle = 'CASH_FLOW_MANAGEMENT.TOTAL_SAVINGS_TAXES';
            this.getCategoryTranslations();
        }).catch(err => { });
    }

    getCategoryTranslations() {
        if (this.cashFlowData && this.cashFlowData.hasOwnProperty('categories')) {
            this.cashFlowData.categories.forEach(category => {
                this.translate.stream(['SSID_LABELS.CASH_FLOWS.' + category['categoryName']]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    category.description = text['SSID_LABELS.CASH_FLOWS.' + category['categoryName']];
                });
                this.cashFlowBackupData = JSON.parse(JSON.stringify(this.cashFlowData));
            });
            for (let i = 0; i < this.cashFlowData.categories.length; i++) {
                for (let j = 0; j < this.cashFlowData.categories[i].cashflows.length; j++) {
                    this.cashFlowData.categories[i].cashflows[j].yearlyClientAmount = this.cashFlowData.categories[i].cashflows[j].clientAmount;
                    this.cashFlowData.categories[i].cashflows[j].yearlySpouseAmount = this.cashFlowData.categories[i].cashflows[j].spouseAmount;

                    if (this.cashFlowData.monthly) {
                        this.cashFlowData.categories[i].cashflows[j].clientAmount = Math.round(parseFloat(this.cashFlowData.categories[i].cashflows[j].clientAmount) / 12);
                        this.cashFlowData.categories[i].cashflows[j].spouseAmount = Math.round(parseFloat(this.cashFlowData.categories[i].cashflows[j].spouseAmount) / 12);
                    }
                }
            }
            this.processData(this.cashFlowData.categories);
        }
    }

    processData(categories) {
        this.incomeCategories.categories = [];
        this.incomeCategories.totalExpenses = 0;
        this.incomeCategories.clientTotal = 0;
        this.incomeCategories.spouseTotal = 0;
        this.incomeCategories.total = 0;
        this.incomeCategories.allExpanded = false;
        this.expenseCategories.categories = [];
        this.expenseCategories.totalExpenses = 0;
        this.expenseCategories.clientTotal = 0;
        this.expenseCategories.spouseTotal = 0;
        this.expenseCategories.total = 0;
        this.expenseCategories.allExpanded = false;
        this.savingsCategories.categories = [];
        this.savingsCategories.totalExpenses = 0;
        this.savingsCategories.clientTotal = 0;
        this.savingsCategories.spouseTotal = 0;
        this.savingsCategories.total = 0;
        this.savingsCategories.allExpanded = false;
        this.showGraph = false;
        this.cashFlowDetails = [];
        this.graphDataProvider = [];
        const autoInvestmentIncome = { clientIncome: 0, spouseIncome: 0, total: 0 };
        categories.forEach(category => {
            category.clientTotal = 0;
            category.spouseTotal = 0;
            category.total = 0;
            category.editable = true;
            category['category'] = category['category'].toUpperCase();
            // tslint:disable-next-line: triple-equals
            if ((category['category'] == 'O' || category['category'] == 'Q') && category.categoryExpanded) {
                this.savingsCategories.allExpanded = true;
            } else if (category.expenseCategory && category.categoryExpanded) {
                this.expenseCategories.allExpanded = true;
            } else if (!category.expenseCategory && category.categoryExpanded) {
                this.incomeCategories.allExpanded = true;
            }

            category.cashflows.forEach(cashflow => {
                if (cashflow.category === 'A' ||
                    cashflow.category === 'B' ||
                    cashflow.category === 'C' ||
                    cashflow.category === 'F') {
                    if (cashflow.joint) {
                        cashflow.hasTaxImpact = true;
                    }
                }
                if (cashflow.id === '93') {
                    this.unallocated = cashflow;
                    this.personal = category;
                } else {
                    const parseClient = cashflow.clientAmount;
                    const parseSpouse = cashflow.spouseAmount;
                    if (((parseClient > 0 || parseSpouse > 0) && cashflow.id.substr(0, 3) !== '998') || category.category === 'Q' || category.category === 'O') {
                        category.editable = false;
                    }
                    if (cashflow.id.substr(0, 3) === '998') {
                        category['misc'] = cashflow;
                    }
                    if (((cashflow.id === '83') && category.category === 'Q') || category.category !== 'Q') {
                        category.clientTotal += parseClient;
                        if (!category.joint) {
                            category.spouseTotal += parseSpouse;
                        }
                    }
                    cashflow.total = parseClient + parseSpouse;
                }
                if (cashflow.id !== '33' && cashflow.category === 'C') {
                    autoInvestmentIncome.clientIncome += cashflow.clientAmount;
                    autoInvestmentIncome.spouseIncome += cashflow.spouseAmount;
                    autoInvestmentIncome.total += cashflow.total;
                }
                if (cashflow.category === 'O' && cashflow.id === '31') {
                    if (this.cashFlowData.autoReInvest === true) {
                        cashflow.clientAmount = autoInvestmentIncome.clientIncome;
                        cashflow.spouseAmount = autoInvestmentIncome.spouseIncome;
                        cashflow.total = autoInvestmentIncome.total;
                    } else {
                        cashflow.clientAmount = 0;
                        cashflow.spouseAmount = 0;
                        cashflow.total = 0;
                    }
                }
            });
            category.total = category.clientTotal + (this.client2 ? category.spouseTotal : 0);
            if (category.expenseCategory && category.category !== 'O' && category.category !== 'Q') {
                this.expenseCategories.categories.push(category);
                this.expenseCategories.clientTotal += category.clientTotal;
                this.expenseCategories.spouseTotal += category.spouseTotal;
                this.expenseCategories.total += category.total;
            } else if (!category.expenseCategory && category.category !== 'O' && category.category !== 'Q') {
                this.incomeCategories.categories.push(category);
                this.incomeCategories.clientTotal += category.clientTotal;
                this.incomeCategories.spouseTotal += category.spouseTotal;
                this.incomeCategories.total += category.total;
            } else {
                this.savingsCategories.categories.push(category);
                this.savingsCategories.clientTotal += category.clientTotal;
                this.savingsCategories.spouseTotal += category.spouseTotal;
                this.savingsCategories.total += category.total;
            }

        });
        this.totalExpenses.clientTotal = this.expenseCategories.clientTotal + this.savingsCategories.clientTotal;
        this.totalExpenses.spouseTotal = this.expenseCategories.spouseTotal + this.savingsCategories.spouseTotal;
        this.totalExpenses.total = this.expenseCategories.total + this.savingsCategories.total;

        this.unallocated.clientAmount = Math.max(0, this.incomeCategories.total - this.totalExpenses.total);
        if (this.incomeCategories.total - this.totalExpenses.total > 0) {
            this.personal.editable = false;
        }
        this.totalExpenses.clientTotal += this.unallocated.clientAmount;
        this.unallocated.amount = this.unallocated.clientAmount;
        this.personal.clientTotal += this.unallocated.clientAmount;
        this.personal.total = this.personal.clientTotal + this.personal.spouseTotal;

        this.expenseCategories.clientTotal = this.totalExpenses.clientTotal - this.savingsCategories.clientTotal;
        this.expenseCategories.spouseTotal = this.totalExpenses.spouseTotal - this.savingsCategories.spouseTotal;
        this.expenseCategories.total = this.expenseCategories.clientTotal + this.expenseCategories.spouseTotal;

        this.totalExpenses.total = this.totalExpenses.clientTotal + this.totalExpenses.spouseTotal;

        this.expenseCategories.totalExpenses = this.expenseCategories.total / this.totalExpenses.total;

        this.savingsCategories.totalExpenses = this.savingsCategories.total / this.totalExpenses.total;

        this.totalExpenses.totalExpenses = this.expenseCategories.totalExpenses + this.savingsCategories.totalExpenses;

        this.cashFlowData['surplusDeficit'] = this.incomeCategories.total - this.totalExpenses.total;

        const tempObj = [];
        categories.forEach(category => {
            if (category.expenseCategory && this.totalExpenses.total) {
                category.expensePercent = category.total / this.totalExpenses.total;
                this.translate.stream(['SSID_LABELS.CASH_FLOWS.' + category['categoryName']]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    if (!text['SSID_LABELS.CASH_FLOWS.' + category['categoryName']].includes('SSID_LABELS.CASH_FLOWS.')) {
                        const description = text['SSID_LABELS.CASH_FLOWS.' + category['categoryName']];
                        if (!tempObj.includes(description)) {
                            tempObj.push(description);
                            this.graphDataProvider.push(
                                {
                                    category: description,
                                    expense: Math.round(category.expensePercent * 100)
                                }
                            );
                        }
                    }
                });
            } else {
                category.expensePercent = 0;
            }
            if (category.expensePercent > 0) {
                this.showGraph = true;
            }
            category.width = Math.round(category.expensePercent * 100);
        });

        this.cashFlowDetails.push(this.incomeCategories);
        this.cashFlowDetails.push(this.expenseCategories);
        this.cashFlowDetails.push(this.savingsCategories);
        this.checkExpensesAndJoint();
    }

    checkExpensesAndJoint() {
        this.cashFlowDetails.forEach(type => {
            type.allowJoint = false;
            type.showExpenses = false;
            type.categories.forEach(category => {
                if (category.expenseCategory) {
                    type.showExpenses = true;
                }
                category.cashflows.forEach(cashflow => {
                    if (cashflow.allowJoint === true) {
                        type.allowJoint = true;
                    }
                });
            });
        });
        setTimeout(() => {
            this.drawGraph();
        }, 3000);
        this.dataLoaded = true;
    }

    onChangeCalculate() {
        this.$calculate.next();
    }

    async performCalculation() {
        this.dataLoaded = await false;
        await this.processData(this.cashFlowData.categories);
        this.cashFlowPayload = await this.makeCashFlowPayload();
        this.callForTaxCalculation();
    }

    callForTaxCalculation() {
        this.planningService.calculateCashflowTax(this.clientId, this.cashFlowPayload).toPromise().then(res => {
            this.cashFlowData = res;
            this.getCategoryTranslations();
        }).catch(err => { });
    }

    changeMonthly() {
        for (let i = 0; i < this.cashFlowData.categories.length; i++) {
            for (let j = 0; j < this.cashFlowData.categories[i].cashflows.length; j++) {
                if (this.cashFlowData.monthly) {
                    this.cashFlowData.categories[i].cashflows[j].yearlyClientAmount = this.cashFlowData.categories[i].cashflows[j].clientAmount;
                    this.cashFlowData.categories[i].cashflows[j].yearlySpouseAmount = this.cashFlowData.categories[i].cashflows[j].spouseAmount;
                    this.cashFlowData.categories[i].cashflows[j].clientAmount = Math.round(parseFloat(this.cashFlowData.categories[i].cashflows[j].clientAmount) / 12);
                    this.cashFlowData.categories[i].cashflows[j].spouseAmount = Math.round(parseFloat(this.cashFlowData.categories[i].cashflows[j].spouseAmount) / 12);
                } else {
                    this.cashFlowData.categories[i].cashflows[j].clientAmount = this.cashFlowData.categories[i].cashflows[j].yearlyClientAmount;
                    this.cashFlowData.categories[i].cashflows[j].spouseAmount = this.cashFlowData.categories[i].cashflows[j].yearlySpouseAmount;
                }
            }
        }
        this.$calculate.next();
    }

    drawGraph() {
        this.AmCharts.makeChart('chartdiv', {
            'type': 'pie',
            'startDuration': 0,
            'theme': 'light',
            'legend': {
                'position': 'right',
                'align': 'center',
                'valueText': ''
            },
            'innerRadius': '45%',
            'dataProvider': this.graphDataProvider,
            'colors': this.graphColors,
            'balloonText': '[[category]] [[expense]]%',
            'valueField': 'expense',
            'titleField': 'category',
            'pullOutRadius': 0,
            'labelRadius': -35,
            'labelText': '[[expense]]%',
            'percentPrecision': 0,
            'export': {
                'enabled': true
            },
            'responsive': {
                'enabled': true,
                'addDefaultRules': false,
                'rules': [
                    {
                        'maxWidth': 400,
                        'overrides': {
                            'legend': {
                                'enabled': false
                            },
                            'radius': 65,
                            'innerRadius': '40%',
                            'labelRadius': 20,
                            'labelText': '[[category]]: [[expense]]%',
                            'maxLabelWidth': 100,
                        },
                    },
                    {
                        'maxWidth': 355,
                        'overrides': {
                            'legend': {
                                'enabled': false
                            },
                            'radius': '15%',
                            'innerRadius': '35%',
                            'labelRadius': 15,
                            'labelText': '[[category]]: [[expense]]%',
                            'maxLabelWidth': 90,
                        },
                    },
                ]
            }
        });
    }

    expandState(index) {
        const obj = this.cashFlowDetails[index];
        obj['allExpanded'] = !obj['allExpanded'];
        if (obj['allExpanded']) {
            obj['categories'].forEach((item) => item['categoryExpanded'] = true);
        } else {
            obj['categories'].forEach((item) => item['categoryExpanded'] = false);
        }
    }

    changeJoint(cashflow) {
        if (cashflow.joint) {
            cashflow.clientAmount = cashflow.clientAmount + cashflow.spouseAmount;
            cashflow.spouseAmount = 0;
        }
        this.processData(this.cashFlowData.categories);
    }

    closePanel() {
        this.isAddCustom = false;
    }

    cancelChanges() {
        this.cashFlowData = null;
        this.cashFlowData = JSON.parse(JSON.stringify(this.cashFlowBackupData));
        this.processData(this.cashFlowData.categories);
    }

    deleteCashFlowItem(cashFlowId) {
        this.translate.get([
            'CASH_FLOW_MANAGEMENT.POPUP.SUCCESSFULLY_DELETED',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.planningService.deleteCashFlowItem(cashFlowId).toPromise().then(res => {
                this.getCashFlowData();
                Swal(i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18text['CASH_FLOW_MANAGEMENT.POPUP.SUCCESSFULLY_DELETED'], 'success');
            }).catch(err => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
    }

    makeCashFlowPayload() {
        const payload = JSON.parse(JSON.stringify(this.cashFlowData));
        payload['categories'] = [];
        const details = JSON.parse(JSON.stringify(this.cashFlowDetails));
        details.forEach(mainItem => {
            mainItem.categories.forEach(category => {
                delete category['editable'];
                delete category['misc'];
                delete category['description'];
                delete category['width'];
                category.cashflows.forEach(cashflow => {
                    if (payload.monthly) {
                        cashflow.clientAmount = cashflow.clientAmount * 12;
                        cashflow.spouseAmount = cashflow.spouseAmount * 12;
                    }
                });
                payload.categories.push(category);
            });
        });

        return payload;
    }

    async updateCasFlow(showPoup = true) {
        this.dataLoaded = await false;
        const cashFlowPayload = await this.makeCashFlowPayload();
        this.translate.get([
            'CASH_FLOW_MANAGEMENT.POPUP.SUCCESSFULLY_UPDATED',
            'ALERT_MESSAGE.UPDATED',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.planningService.updateCashFlow(cashFlowPayload).toPromise().then(res => {
                if (showPoup) {
                    Swal(i18text['ALERT_MESSAGE.UPDATED'], i18text['CASH_FLOW_MANAGEMENT.POPUP.SUCCESSFULLY_UPDATED'], 'success');
                }
                this.saveDisable = false;
                this.cashFlowData = null;
                this.cashFlowDetails = [];
                this.getCashFlowData();
            }).catch(err => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                this.saveDisable = false;
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
