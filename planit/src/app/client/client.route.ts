import { Routes } from '@angular/router';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { OverviewComponent } from './overview/overview.component';


import {
    SummaryComponent,
    PersonalInfoComponent,
    RiskToleranceComponent,
    AddFamilymemberComponent,
    SendInviteComponent,
    SendReminderComponent,
    EditClientComponent,
    EngagementComponent,
    ProfileSummaryComponent,
    RiskToleranceResultsComponent,
    RiskToleranceKycComponent,
    EngagementSummaryComponent,
    ServiceLevelComponent,
    SelectValuesComponent,
    AddEntityComponent,
    EntityDetailsComponent,
    EntityOwnershipComponent,
    EditShareStructureComponent
} from './profile';

import {
    DocumentCentreComponent,
    UploadDocumentComponent,
    GenerateDocumentComponent,
    RenameDocumentComponent
} from './documents';

import {
    PlanningSummaryRouterComponent,
    PlanningSummaryComponent,
    PortfoliosLandingComponent,
    PortfolioDetailsComponent,
    ObjectivesComponent,
    AssetsSummaryComponent,
    HoldingAccountComponent,
    AddAccountComponent,
    EditAccountComponent,
    AddSavingsComponent,
    SavingsComponent,
    ProductSearchComponent,
    EditSavingsComponent,
    SavingsSpecifiedAccountComponent,
    RebalancingSummaryComponent,
    DetailedRecommendationComponent,
    ProductRecommendationComponent,
    InvestmentProductsComponent,
    ApplyModelComponent,
    AddFromFavouritesComponent,
    EditPolicyComponent,
    AnalyticsComponent,
    EditCurrentComponent,
    AddPortfolioComponent,
    AddInvestorComponent,
    LinkToGoalsComponent,
    ImplementationComponent,
    ImplementationQuestionsComponent,
    ApplySolutionComponent,
    RiskCapacityComponent,
    TransfersComponent,
    CashFlowManagementComponent
} from './planning';

import { TaskNotificationComponent } from '../task-notification/task-notification/task-notification.component';
import { AddTaskComponent } from '../task-notification/add-task/add-task.component';
import { RenameItemComponent } from '../ui/rename-item/rename-item.component';
import {
    RevenuesComponent,
    GoalsSummaryComponent,
    AddGoalComponent,
    AllSavingsComponent,
    SavingsIndividualComponent,
    EditGoalComponent,
    AddRevenueComponent,
    AnalysisComponent,
    AssumptionsComponent,
    EditRevenueComponent,
    PlantracComponent,
    EducationInstitutionComponent,
    RetirementAssumptionComponent,
} from './planning/goals';
import {
    DistributionsComponent,
    AddDistributionComponent,
    ResidualDistributionComponent,
    EstateAnalysisComponent,
    InformationComponent,
    AddNamedBeneficiaryComponent,
    NamedBeneficiaryComponent,
    EditNamedBeneficiaryComponent
} from './planning/estate';
import {
    LoanAmortizationCalculatorComponent,
    LoanCalculatorsComponent,
    DebtConsolidationComponent,
    LeverageComponent,
    LongTermCareComponent,
    CriticalIllnessComponent,
    InsuranceCalculatorsComponent,
    CalculatorComponent,
    FinancialCalculatorsComponent,
    RrifIllustrationComponent,
    LifeInsuranceComponent
} from './calculators';
import { SearchNotesComponent } from './notes/search-notes/search-notes.component';
import { NotesSidePanelComponent } from './notes/notes-side-panel/notes-side-panel.component';
import { GenerateReportComponent } from './generate-report/generate-report.component';
import { ExperienceComponent } from './profile/risk-tolerance/experience/experience.component';
import { ClientSearchComponent, AddClientComponent } from '../advisor/dashboard';
import { EmptyCaculatorComponent } from './calculators/calculator/empty-caculator/empty-caculator.component';
import {
    EntitiesListComponent,
    InvestmentReturnRiskComponent,
    CurrentYearIncomeDistributionsComponent,
    LongTermIncomeDistributionsComponent,
    DistributionSidePanelComponent,
    EditLongTermIncomeComponent,
    ViewAnalysisComponent
} from './planning/entities';
import { DashboardComponent } from '../advisor/dashboard/dashboard.component';

export const CLIENT_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
    },
    {
        path: 'overview',
        component: OverviewComponent,
        children: [
            {
                path: ':personalId/send-invitation',
                component: SendInviteComponent
            },
            {
                path: ':personalId/send-reminder',
                component: SendReminderComponent
            },
            {
                path: ':portfolioId/rename',
                component: RenameItemComponent
            },
            {
                path: 'link-portfolios-to-goals',
                component: LinkToGoalsComponent,
                data: {
                    permissions: {
                        only: 'ADVISOR',
                        redirectTo: '/login'
                    }
                }
            }
        ]
    },
    {
        path: 'task-notification',
        component: TaskNotificationComponent,
        children: [
            {
                path: 'add-task',
                component: AddTaskComponent
            }
        ]
    },
    {
        path: 'coming-soon',
        component: ComingSoonComponent
    },
    {
        path: 'profile',
        component: SummaryComponent
    },
    {
        path: 'profile',
        component: ProfileSummaryComponent,
        children: [
            {
                path: 'risk-tolerance',
                component: RiskToleranceComponent,
                children: [
                    {
                        path: ':personalId/send-invitation',
                        component: SendInviteComponent
                    },
                    {
                        path: ':personalId/send-reminder',
                        component: SendReminderComponent
                    }
                ]
            },
            {
                path: 'personal-info',
                component: PersonalInfoComponent,
                children: [
                    {
                        path: 'add',
                        component: AddFamilymemberComponent
                    },
                    {
                        path: 'add-beneficiary',
                        component: AddFamilymemberComponent
                    },
                    {
                        path: 'edit-beneficiary/:beneficiaryId',
                        component: AddFamilymemberComponent
                    },
                    {
                        path: 'add-entity',
                        component: AddEntityComponent
                    }
                ]
            },
            {
                path: 'personal-info/:entityId/entity-details',
                component: EntityDetailsComponent
            },
            {
                path: 'personal-info/:entityId/entity-ownership',
                component: EntityOwnershipComponent,
                children: [
                    {
                        path: ':shareId/edit-share-structure',
                        component: EditShareStructureComponent
                    },
                    {
                        path: 'add-share-class',
                        component: EditShareStructureComponent
                    }
                ]

            },
            {
                path: 'personal-info/:personalId/edit',
                component: EditClientComponent,
                children: [
                    {
                        path: 'search-spouse',
                        component: ClientSearchComponent
                    },
                    {
                        path: 'add-spouse',
                        component: AddFamilymemberComponent
                    }
                ]
            },
            {
                path: 'engagement',
                component: EngagementComponent,
                children: [
                    {
                        path: 'summary',
                        component: EngagementSummaryComponent,
                        children: [
                            {
                                path: ':personalId/send-invite',
                                component: SendInviteComponent
                            },
                            {
                                path: ':personalId/send-reminder',
                                component: SendReminderComponent
                            },
                            {
                                path: ':personalId/select-values',
                                component: SelectValuesComponent
                            }
                        ]
                    },
                    {
                        path: 'service-level',
                        component: ServiceLevelComponent
                    }
                ]
            },
            {
                path: 'risk-tolerance/:personalId/results',
                component: RiskToleranceResultsComponent,
            },
            {
                path: 'risk-tolerance/:personalId/know-your-client',
                component: RiskToleranceKycComponent,
            },
            {
                path: 'risk-tolerance/:personalId/experience',
                component: ExperienceComponent,
            }

        ]
    },
    {
        path: 'document-centre',
        component: DocumentCentreComponent,
        children: [
            {
                path: 'upload',
                component: UploadDocumentComponent
            },
            {
                path: 'generate',
                component: GenerateDocumentComponent
            },
            {
                path: 'rename/:docId',
                component: RenameDocumentComponent
            },
            {
                path: ':personalId/send-reminder/:docTypeId/:docId',
                component: SendReminderComponent
            },
            {
                path: ':docTypeId/:docId/rename',
                component: RenameItemComponent
            },
            {
                path: ':personalId/send-invite/:docTypeId/:docId',
                component: SendInviteComponent
            }
        ]
    },
    {
        path: 'planning',
        component: PlanningSummaryComponent,
    },
    {
        path: 'planning',
        component: PlanningSummaryRouterComponent,
        children: [
            {
                path: 'portfolios',
                component: PortfoliosLandingComponent,
                children: [
                    {
                        path: 'add-portfolio',
                        component: AddPortfolioComponent
                    },
                    {
                        path: 'add-investor',
                        component: AddInvestorComponent,
                    },
                    {
                        path: ':portfolioId/rename',
                        component: RenameItemComponent
                    },
                    {
                        path: ':portfolioId/analytics/:chartType',
                        component: AnalyticsComponent,
                    },
                    {
                        path: 'link-portfolios-to-goals',
                        component: LinkToGoalsComponent,

                    }
                ]
            },
            {
                path: 'cash-flow-management',
                component: CashFlowManagementComponent,
                children: []
            },
            {
                path: 'portfolios/:portfolioId/details',
                component: PortfolioDetailsComponent,
                children: [
                    {
                        path: 'edit-current',
                        component: EditCurrentComponent
                    },
                    {
                        path: 'edit-policy',
                        component: EditPolicyComponent,
                    },
                    {
                        path: 'analytics/:chartType',
                        component: AnalyticsComponent,
                    },
                    {
                        path: 'add-portfolio',
                        component: AddPortfolioComponent
                    },
                    {
                        path: 'rename',
                        component: RenameItemComponent
                    }
                ]
            },
            {
                path: 'portfolios/:portfolioId/details/edit',
                component: PortfolioDetailsComponent,
                children: [
                    {
                        path: 'edit-current',
                        component: EditCurrentComponent
                    },
                    {
                        path: 'edit-policy',
                        component: EditPolicyComponent,
                    },
                    {
                        path: 'analytics/:chartType',
                        component: AnalyticsComponent,
                    },
                    {
                        path: 'add-investor',
                        component: AddInvestorComponent,
                    },
                    {
                        path: 'add-portfolio',
                        component: AddPortfolioComponent
                    },
                    {
                        path: 'rename',
                        component: RenameItemComponent
                    },
                    {
                        path: 'link-portfolios-to-goals',
                        component: LinkToGoalsComponent,

                    }
                ]
            },
            {
                path: 'portfolios/:portfolioId/implementation',
                component: ImplementationComponent,
                children: [
                    {
                        path: 'edit-questions',
                        component: ImplementationQuestionsComponent
                    },
                    {
                        path: 'add-account',
                        component: AddAccountComponent
                    },
                    {
                        path: ':accountId/apply-solution',
                        component: ApplySolutionComponent
                    },
                    {
                        path: ':accountId/add-favourites',
                        component: AddFromFavouritesComponent
                    },
                    {
                        path: ':accountId/add-product',
                        component: ProductSearchComponent
                    },
                    {
                        path: 'analytics/:chartType',
                        component: AnalyticsComponent,
                    },
                    {
                        path: 'apply-solution',
                        component: ApplySolutionComponent
                    },
                    {
                        path: 'transfer',
                        component: TransfersComponent
                    },
                    {
                        path: 'add-portfolio',
                        component: AddPortfolioComponent
                    },
                    {
                        path: 'rename',
                        component: RenameItemComponent
                    }
                ]
            },
            {
                path: 'portfolios/:portfolioId/analysis/:goalId',
                component: RiskCapacityComponent
                ,
                children: [
                    {
                        path: 'add-portfolio',
                        component: AddPortfolioComponent
                    },
                    {
                        path: 'rename',
                        component: RenameItemComponent
                    }
                ]
            },
            {
                path: 'portfolios/:portfolioId/objectives',
                component: ObjectivesComponent
            },
            {
                path: 'assets-liabilities',
                component: AssetsSummaryComponent,

                children: [
                    {
                        path: ':accountId/add-savings',
                        component: AddSavingsComponent
                    },
                    {
                        path: 'add-account',
                        component: AddAccountComponent
                    }
                ]
            },
            {
                path: 'assets-liabilities-savings',
                component: SavingsComponent,

                children: [
                    {
                        path: 'add-savings',
                        component: AddSavingsComponent
                    },
                    {
                        path: ':accountId/add-savings',
                        component: AddSavingsComponent
                    }
                ]
            },
            {
                path: 'assets-liabilities/:accountId/holding-account',
                component: HoldingAccountComponent,

                children: [
                    {
                        path: 'product-search/:assetId',
                        component: ProductSearchComponent
                    },
                    {
                        path: 'product-search',
                        component: ProductSearchComponent
                    }
                ]
            },
            {
                path: 'assets-liabilities/:accountId/edit-account',
                component: EditAccountComponent,
                children: [
                    {
                        path: 'add-portfolio',
                        component: AddPortfolioComponent
                    },
                    {
                        path: 'add-named-beneficiary',
                        component: AddNamedBeneficiaryComponent,
                    }
                ]
            },
            {
                path: 'assets-liabilities-savings/:savingsId/edit-savings',
                component: EditSavingsComponent

            },
            {
                path: 'assets-liabilities/:accountId/savings',
                component: SavingsSpecifiedAccountComponent,
                children: [
                    {
                        path: 'add-savings',
                        component: AddSavingsComponent
                    }
                ]
            },
            {
                path: 'assets-liabilities/:accountId/savings/:savingsId/edit-savings',
                component: EditSavingsComponent
            },
            {
                path: 'product-recommendation',
                component: ProductRecommendationComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'investment-products',
                        pathMatch: 'full'
                    },
                    {
                        path: 'investment-products',
                        component: InvestmentProductsComponent,
                        children: [
                            {
                                path: 'add-account',
                                component: AddAccountComponent
                            },
                            {
                                path: ':accountId/apply-model',
                                component: ApplyModelComponent
                            },
                            {
                                path: ':accountId/add-favourites',
                                component: AddFromFavouritesComponent
                            },
                            {
                                path: ':accountId/add-product',
                                component: ProductSearchComponent
                            }
                        ]
                    },
                    {
                        path: 'rebalancing-summary',
                        component: RebalancingSummaryComponent
                    },
                    {
                        path: 'detailed-recommendation',
                        component: DetailedRecommendationComponent
                    }
                ]
            },
            {
                path: 'goals',
                redirectTo: 'goals/summary',
                pathMatch: 'full'
            },
            {
                path: 'goals/summary',
                component: GoalsSummaryComponent,

                children: [
                    {
                        path: 'add-goal',
                        component: AddGoalComponent
                    },
                    {
                        path: 'education-institution',
                        component: EducationInstitutionComponent
                    },
                    {
                        path: 'link-portfolios-to-goals',
                        component: LinkToGoalsComponent

                    }
                ]
            },
            {
                path: 'goals/savings',
                component: AllSavingsComponent,
                data: {
                    permissions: {
                        only: 'ADVISOR',
                        redirectTo: '/login'
                    }
                },
                children: [
                    {
                        path: 'add-savings',
                        component: AddSavingsComponent
                    },
                    {
                        path: ':accountId/add-savings',
                        component: AddSavingsComponent
                    }
                ]
            },
            {
                path: 'goals/savings/:savingsId/edit-savings',
                component: EditSavingsComponent
            },
            {
                path: 'goals/revenues',
                component: RevenuesComponent,

                children: [
                    {
                        path: ':goalId/add-savings',
                        component: AddSavingsComponent
                    },
                    {
                        path: 'add-revenue',
                        component: AddRevenueComponent
                    },
                    {
                        path: ':goalId/add-revenue',
                        component: AddRevenueComponent
                    }
                ]
            },
            {
                path: 'goals/:goalId/edit-goal',
                component: EditGoalComponent,

                children: [
                    {
                        path: 'education-institution',
                        component: EducationInstitutionComponent
                    },
                    {
                        path: 'retirement-assumption',
                        component: RetirementAssumptionComponent
                    },
                    {
                        path: 'link-portfolios-to-goals',
                        component: LinkToGoalsComponent

                    }
                ],
            },
            {
                path: 'goals/:goalId/savings',
                component: SavingsIndividualComponent,


                children: [
                    {
                        path: 'add-savings',
                        component: AddSavingsComponent
                    },
                    {
                        path: ':accountId/add-savings',
                        component: AddSavingsComponent
                    }
                ]
            },
            {
                path: 'goals/:goalId/savings/:savingsId/edit-savings',
                component: EditSavingsComponent,
            },
            {
                path: 'goals/:goalId/plantrac',
                component: PlantracComponent,

                children: []
            },
            {

                path: 'goals/:goalId/analysis',
                component: AnalysisComponent,
                children: [
                    {
                        path: 'assumptions/:type',
                        component: AssumptionsComponent
                    }
                ]
            },
            {
                path: 'goals/revenues/:revenueId/edit-revenue',
                component: EditRevenueComponent

            },
            {
                path: 'goals/:goalId/revenues/:revenueId/edit-revenue',
                component: EditRevenueComponent

            },
            {
                path: 'goals/:goalId/revenues',
                component: RevenuesComponent,
                children: [
                    {
                        path: 'add-savings',
                        component: AddSavingsComponent
                    },
                    {
                        path: 'add-revenue',
                        component: AddRevenueComponent
                    }
                ]
            },
            {
                path: 'estate',
                redirectTo: 'estate/information',
                pathMatch: 'full'
            },
            {
                path: 'estate/information',
                component: InformationComponent,
            },
            {
                path: 'estate/distributions',
                component: DistributionsComponent,
                children: [
                    {
                        path: 'add-distribution',
                        component: AddDistributionComponent
                    },
                    {
                        path: 'edit-distribution',
                        component: AddDistributionComponent
                    },
                    {
                        path: ':testatorId/residual-distribution',
                        component: ResidualDistributionComponent
                    },
                    {
                        path: 'add-beneficiary',
                        component: AddFamilymemberComponent
                    },
                    {
                        path: 'add-named-beneficiary',
                        component: AddNamedBeneficiaryComponent
                    }
                ]
            },
            {
                path: 'estate/analysis',
                component: EstateAnalysisComponent

            },
            {
                path: 'estate/named-beneficiary',
                component: NamedBeneficiaryComponent,
                children: [
                    {
                        path: ':accountId/edit-named-beneficiary',
                        component: EditNamedBeneficiaryComponent
                    },
                    {
                        path: ':accountId/add-named-beneficiary',
                        component: AddNamedBeneficiaryComponent
                    }
                ]
            },
            {
                path: 'entities',
                redirectTo: 'entities/list',
                pathMatch: 'full'
            },
            {
                path: 'entities/list',
                component: EntitiesListComponent
            },
            {
                path: 'entities/:entityId/investment-return-risk',
                component: InvestmentReturnRiskComponent
            },
            {
                path: 'entities/:entityId/current-year-income-distributions',
                component: CurrentYearIncomeDistributionsComponent
            },
            {
                path: 'entities/:entityId/long-term-income-distributions',
                component: LongTermIncomeDistributionsComponent,
                children: [
                    {
                        path: 'add-distribution',
                        component: DistributionSidePanelComponent
                    },
                    {
                        path: ':distributionId/edit-distribution',
                        component: DistributionSidePanelComponent
                    },
                    {
                        path: ':incomeId/edit-long-term-income',
                        component: EditLongTermIncomeComponent
                    },
                     {
                    path: 'add-income',
                    component: EditLongTermIncomeComponent
                    }
                ]
            },
            {
                path: 'entities/:entityId/view-analysis',
                component: ViewAnalysisComponent
            }
        ]
    },
    {
        path: 'calculators',
        component: CalculatorComponent,
        children: [
            {
                path: '',
                redirectTo: 'empty-calculator',
                pathMatch: 'full'
            },
            {
                path: 'empty-calculator',
                component: EmptyCaculatorComponent,
            },
            {
                path: 'loan-calculator',
                component: LoanCalculatorsComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'empty-calculator',
                        pathMatch: 'full'
                    },
                    {
                        path: 'empty-calculator',
                        component: EmptyCaculatorComponent,
                    },
                    {
                        path: 'loan-amortization',
                        component: LoanAmortizationCalculatorComponent,
                    },
                    {
                        path: 'debt-consodlidation',
                        component: DebtConsolidationComponent
                    },
                    {
                        path: 'leverage',
                        component: LeverageComponent
                    }
                ]
            },
            {
                path: 'insurance-calculator',
                component: InsuranceCalculatorsComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'empty-calculator',
                        pathMatch: 'full'
                    },
                    {
                        path: 'empty-calculator',
                        component: EmptyCaculatorComponent,
                    },
                    {
                        path: 'long-term-care',
                        component: LongTermCareComponent
                    },
                    {
                        path: 'critical-illness',
                        component: CriticalIllnessComponent
                    },
                    {
                        path: 'life-insurance',
                        component: LifeInsuranceComponent
                    },
                    {
                        path: 'disability-insurance',
                        component: LifeInsuranceComponent
                    }
                ]
            },
            {
                path: 'financial-calculator',
                component: FinancialCalculatorsComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'empty-calculator',
                        pathMatch: 'full'
                    },
                    {
                        path: 'empty-calculator',
                        component: EmptyCaculatorComponent
                    },
                    {
                        path: 'rrif-illustration',
                        component: RrifIllustrationComponent
                    }
                ]
            }
        ]
    },
    {
        path: 'search-notes',
        component: SearchNotesComponent,
    },
    {
        path: 'add-note',
        component: NotesSidePanelComponent,
    },
    {
        path: 'view-note/:noteId',
        component: NotesSidePanelComponent,
    },
    {
        path: 'generate-report',
        component: GenerateReportComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
            {
                path: 'add-client',
                component: AddClientComponent
            },
            {
                path: 'client-search/advanced',
                component: ClientSearchComponent
            },
            {
                path: 'client-search',
                component: ClientSearchComponent
            },
            {
                path: ':clientId/add-family-member',
                component: AddFamilymemberComponent
            },
            {
                path: ':clientId/:personalId/send-reminder',
                component: SendReminderComponent
            }
        ]
    }
];
