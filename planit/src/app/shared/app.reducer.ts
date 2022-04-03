import {
    LOGIN,
    LOGOUT,
    SET_ADVISOR_DETAIL,
    SET_ACCESS_RIGHTS,
    SET_CLIENT,
    AppActions,
    SET_GOAL,
    SetClient,
    SetGoal,
    SET_DOCUMENTS,
    SetDocuments,
    SetPortfolio,
    SET_PORTFOLIO,
    SetAlloc,
    SET_ALLOC,
    SetNetworthInvestment,
    SET_NETWORTHINVESTMENT,
    SET_CLIENT_ADDRESS,
    SetClientAddress,
    SET_FAMILY_MEMBERS,
    SetFamilyMembers,
    SET_FAMILY_MEMBERS_RISK,
    SetFamilyMembersRisk,
    SET_CLIENT_PROGRESS,
    SetClientProgress,
    SetAdvisorWorkflow,
    SET_ADVISOR_WORKFLOW,
    SET_KYC_QUESTIONS,
    SetKycQuestions,
    SET_ADVISOR_CLIENT,
    SetAdvisorClient,
    SetAdvisorTaskNotification,
    SET_ADVISOR_TASKNOTIFICATION,
    SET_ADVISOR_DEMOGRAPHICS,
    SET_ADVISOR_DOCUMENT,
    SetAdvisorDemographic,
    SetAdvisorDocument,
    SET_ADVISOR_COLLABORATION,
    SET_ADVISOR_SUITABILITY,
    SetAdvisorCollaboration,
    SetAdvisorSuitability,
    SET_CLIENT_DOCUMENT_TYPE,
    SetClientDocumentType,
    SET_CLIENT_PORTFOLIO_LIST,
    SetClientPortfolioList,
    SetPlanningSummary,
    SET_PLANNING_SUMMARY,
    SET_HOLDING_ASSET_LIABILITY,
    SetHoldingAssetLiability,
    SET_UTILITY_ASSET_LIABILITY_DETAILS,
    SetUtilityAssetLiabilityDetails,
    SetFavouriteList,
    SET_FAVOURITE_LIST,
    SET_SAVINGS_DETAILS,
    SetSavingsDetails,
    SET_COUNTRY,
    SET_LANGUAGE,
    SET_PROVINCE,
    SetCountry,
    SetLanguage,
    SetProvince,
    SetTaskAndNotification,
    SET_TASK_AND_NOTIFICATION,
    SetAdvisorDetail,
    SetAccessRights,
    SetAllCountryFormate,
    SET_ALLCOUNTRY_FORMATE,
    SetInvestmentData,
    SET_INVESTMENT_DATA,
    SET_CLIENT_OVERVIEW_TASK_AND_NOTIFICATION,
    SetClientOverviewTaskAndNotification,
    SetBrandingDetails,
    SET_BRANDING_DETAILS,
    SetGraphColours,
    SET_GRAPH_COLOURS,
    SetEngagementValues,
    SET_ENGAGEMENT_VALUES,
    SetEngagementPriorities,
    SET_ENGAGEMENT_PRIORITIES,
    SET_ADVISOR_INVESTMENT,
    SetAdvisorInvestment,
    SET_ADVISOR_NET_WORTH,
    SetAdvisorNetWorth,
    SetGoalRetirementAssumption,
    SET_GOAL_RETIREMENT_ASSUMPTION,
    SetPlanAssumpt,
    SET_PLAN_ASSUMPT,
    SET_OTHER_BENEFICIARY,
    SetOtherBeneficiary,
    SET_ENTITY_LIST,
    SetEntityList,
    SET_CORPORATION_LIST,
    SetCorporationList,
    SET_SHARE_LIST,
    SetShareList,
    SET_REVENUE_DATES,
    SetRevenueDates,
    SetClientDefaultData,
    SET_CLIENT_DEFAULT_DATA
} from './app.actions';

import {
    Action,
    ActionReducerMap,
    createFeatureSelector,
    createSelector
} from '@ngrx/store';

import { TokenStorage } from './token.storage';

export interface AppState {
    isLoggedIn: boolean;
    advisorPayload: any;
    accessRightsPayload: any;
    isAccessRightsLoaded: boolean;
    clientPayload: any;
    isClientLoaded: boolean;
    goalPayload: any[];
    isGoalLoaded: boolean;
    documentPayloads: any;
    isDocumentsLoaded: boolean;
    portfolioPayload: any;
    isPortfolioLoaded: boolean;
    allocationPayload: any;
    networthInvestmentPayload: any;
    isNetworthInvestmentLoaded: boolean;
    clientAddressPayload: any;
    familyMemberPayload: any;
    goalRetirementAssumptionPayload: any;
    planAssumptPayload: any;
    familyMemberRiskPayload: any;
    isClientProgressLoaded: boolean;
    clientProgressPayload: any;
    advisorWorkflowPayload: any;
    isAdvisorLoaded: boolean;
    behaviouralRiskTolerancePayLoad: any;
    kycQuestionsPayLoad: any;
    advisorClientPayload: any;
    isAdvisorTaskNotificationPayload: boolean;
    isAdvisorClientLoaded: boolean;
    advisorTaskNotificationPayload: any;
    isAdvisorDemographicLoaded: boolean;
    advisorDemographicPayload: any;
    isAdvisorDocumentLoaded: boolean;
    advisorDocumentPayload: any;
    isAdvisorCollaborationPayload: boolean;
    advisorCollaborationPayload: any;
    isAdvisorSuitabilityPayload: boolean;
    advisorSuitabilityPayload: any;
    isClientDocumentTypeLoaded: boolean;
    clientDocumentTypePayload: any;
    isClientPortfolioListLoaded: boolean;
    clientPortfolioListPayload: any;
    isTemplateListLoaded: boolean;
    TemplateListPayload: any;
    isPlanningSummaryLoaded: boolean;
    planningSummaryPayload: any;
    isHoldingAssetLiabilityLoaded: boolean;
    holdingAssetLiabilityPayload: any;
    isUtilityAssetLiabilityDetailsLoaded: boolean;
    utilityAssetLiabilityDetailsPayload: any;
    isfavouriteListLoaded: boolean;
    favouriteListPayload: any;
    savingsDetailsPayload: any;
    countryPayload: any;
    languagePayload: any;
    provincePayload: any;
    taskandnotificationPayload: any;
    allCountryFormatePayload: any;
    investmenAlltData: any;
    clientOverviewTaskAndNotificationData: any;
    brandingDetailsPayload: any;
    graphColoursPayload: any;
    engagementValuePayload: any;
    engagementPrioritiesPayload: any;
    advisorInvestmentPaylod: any;
    advisorNetWorthPaylod: any;
    otherBeneficiaryPaylod: any;
    entityListPayload: any;
    corporationListPayload: any;
    shareListPayload: any;
    revenueDates: any;
    clientDefaultData: any;
}

const initialState: AppState = {
    // isLoggedIn: (TokenStorage.exists) ? true : false,
    isLoggedIn: (new TokenStorage().getToken('AuthToken')) ? true : false,
    clientPayload: {},
    advisorPayload: {},
    accessRightsPayload: {},
    isAccessRightsLoaded: false,
    isClientLoaded: false,
    goalPayload: [],
    isGoalLoaded: false,
    documentPayloads: [],
    isDocumentsLoaded: false,
    portfolioPayload: {},
    isPortfolioLoaded: false,
    allocationPayload: null,
    networthInvestmentPayload: null,
    isNetworthInvestmentLoaded: false,
    clientAddressPayload: [],
    familyMemberPayload: {},
    goalRetirementAssumptionPayload: {},
    planAssumptPayload: {},
    familyMemberRiskPayload: [],
    isClientProgressLoaded: false,
    clientProgressPayload: {},
    advisorWorkflowPayload: {},
    isAdvisorLoaded: false,
    behaviouralRiskTolerancePayLoad: {},
    kycQuestionsPayLoad: {},
    advisorClientPayload: {},
    advisorTaskNotificationPayload: null,
    isAdvisorTaskNotificationPayload: false,
    isAdvisorClientLoaded: false,
    isAdvisorDemographicLoaded: false,
    advisorDemographicPayload: [],
    isAdvisorDocumentLoaded: false,
    advisorDocumentPayload: [],
    isAdvisorCollaborationPayload: false,
    advisorCollaborationPayload: {},
    isAdvisorSuitabilityPayload: false,
    advisorSuitabilityPayload: null,
    isClientDocumentTypeLoaded: false,
    clientDocumentTypePayload: [],
    isClientPortfolioListLoaded: false,
    clientPortfolioListPayload: [],
    isTemplateListLoaded: false,
    TemplateListPayload: [],
    isPlanningSummaryLoaded: false,
    planningSummaryPayload: {},
    isHoldingAssetLiabilityLoaded: false,
    holdingAssetLiabilityPayload: [],
    isUtilityAssetLiabilityDetailsLoaded: false,
    utilityAssetLiabilityDetailsPayload: null,
    isfavouriteListLoaded: false,
    favouriteListPayload: null,
    savingsDetailsPayload: null,
    countryPayload: null,
    languagePayload: null,
    provincePayload: null,
    taskandnotificationPayload: null,
    allCountryFormatePayload: null,
    investmenAlltData: null,
    clientOverviewTaskAndNotificationData: null,
    brandingDetailsPayload: null,
    graphColoursPayload: null,
    engagementValuePayload: [],
    engagementPrioritiesPayload: [],
    advisorInvestmentPaylod: null,
    advisorNetWorthPaylod: null,
    otherBeneficiaryPaylod: null,
    entityListPayload: null,
    corporationListPayload: null,
    shareListPayload: null,
    revenueDates: null,
    clientDefaultData: null
};

export interface State {
    app: AppState;
}
export function clearState(reducer) {
    return function (state, action) {

        if (action.type === LOGOUT) {
            state = undefined;
        }

        return reducer(state, action);
    };
}

export function appReducer(state: AppState = initialState, action: AppActions) {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                isLoggedIn: true
            };
        case LOGOUT:
            return {
                ...state,
                isLoggedIn: false,
                advisorPayload: {},
                accessRightsPayload: {},
                brandingDetailsPayload: null,
                advisorClientPayload: {},
                advisorTaskNotificationPayload: null,
                advisorDocumentPayload: [],
                allCountryFormatePayload: null
            };
        case SET_ADVISOR_DETAIL:
            return {
                ...state,
                advisorPayload: (<SetAdvisorDetail>action).advisorPayload
            };
        case SET_ACCESS_RIGHTS:
            return {
                ...state,
                isAccessRightsLoaded: true,
                accessRightsPayload: (<SetAccessRights>action).accessRightsPayload
            };
        case SET_CLIENT:
            return {
                ...state,
                isClientLoaded: true,
                clientPayload: (<SetClient>action).clientPayload
            };
        case SET_GOAL:
            return {
                ...state,
                isGoalLoaded: true,
                goalPayload: (<SetGoal>action).goalPayload
            };
        case SET_DOCUMENTS:
            return {
                ...state,
                isDocumentsLoaded: true,
                documentPayloads: (<SetDocuments>action).documentPayloads
            };
        case SET_PORTFOLIO:
            return {
                ...state,
                isPortfolioLoaded: true,
                portfolioPayload: (<SetPortfolio>action).portfolioPayload
            };
        case SET_ALLOC:
            return {
                ...state,
                allocationPayload: (<SetAlloc>action).allocPayload
            };
        case SET_NETWORTHINVESTMENT:
            return {
                ...state,
                isNetworthInvestmentLoaded: true,
                networthInvestmentPayload: (<SetNetworthInvestment>action).networthInvestmentPayload
            };
        case SET_CLIENT_ADDRESS:
            return {
                ...state,
                isClientLoaded: true,
                clientAddressPayload: (<SetClientAddress>action).clientAddressPayload
            };
        case SET_FAMILY_MEMBERS:
            return {
                ...state,
                isClientLoaded: true,
                familyMemberPayload: (<SetFamilyMembers>action).familyMemberPayload
            };
        case SET_GOAL_RETIREMENT_ASSUMPTION:
            return {
                ...state,
                goalRetirementAssumptionPayload: (<SetGoalRetirementAssumption>action).goalRetirementAssumptionPayload
            };
        case SET_PLAN_ASSUMPT:
            return {
                ...state,
                planAssumptPayload: (<SetPlanAssumpt>action).planAssumptPayload
            };
        case SET_FAMILY_MEMBERS_RISK:
            return {
                ...state,
                isClientLoaded: true,
                familyMemberRiskPayload: (<SetFamilyMembersRisk>action).familyMemberRiskPayload
            };
        case SET_CLIENT_PROGRESS:
            return {
                ...state,
                isClientProgressLoaded: true,
                clientProgressPayload: (<SetClientProgress>action).clientProgressPayload
            };
        case SET_ADVISOR_WORKFLOW:
            return {
                ...state,
                isAdvisorLoaded: true,
                advisorWorkflowPayload: (<SetAdvisorWorkflow>action).advisorWorkflowPayload
            };
        case SET_KYC_QUESTIONS:
            return {
                ...state,
                kycQuestionsPayLoad: (<SetKycQuestions>action).kycQuestionsPayLoad
            };
        case SET_ADVISOR_CLIENT:
            return {
                ...state,
                isAdvisorClientLoaded: true,
                advisorClientPayload: (<SetAdvisorClient>action).advisorClientPayload
            };
        case SET_ADVISOR_TASKNOTIFICATION:
            return {
                ...state,
                isAdvisorTaskNotificationPayload: true,
                advisorTaskNotificationPayload: (<SetAdvisorTaskNotification>action).advisorTaskNotificationPayload
            };
        case SET_ADVISOR_DEMOGRAPHICS:
            return {
                ...state,
                isAdvisorDemographicLoaded: true,
                advisorDemographicPayload: (<SetAdvisorDemographic>action).advisorDemographicPayload
            };
        case SET_ADVISOR_DOCUMENT:
            return {
                ...state,
                isAdvisorDocumentLoaded: true,
                advisorDocumentPayload: (<SetAdvisorDocument>action).advisorDocumentPayload

            };
        case SET_ADVISOR_COLLABORATION:
            return {
                ...state,
                isAdvisorCollaborationPayload: true,
                advisorCollaborationPayload: (<SetAdvisorCollaboration>action).advisorCollaborationPayload
            };
        case SET_ADVISOR_SUITABILITY:
            return {
                ...state,
                isAdvisorSuitabilityPayload: true,
                advisorSuitabilityPayload: (<SetAdvisorSuitability>action).advisorSuitabilityPayload
            };
        case SET_CLIENT_DOCUMENT_TYPE:
            return {
                ...state,
                isClientDocumentTypeLoaded: true,
                clientDocumentTypePayload: (<SetClientDocumentType>action).clientDocumentTypePayload
            };
        case SET_CLIENT_PORTFOLIO_LIST:
            return {
                ...state,
                isClientPortfolioListLoaded: true,
                clientPortfolioListPayload: (<SetClientPortfolioList>action).clientPortfolioListPayload
            };
        case SET_PLANNING_SUMMARY:
            return {
                ...state,
                isPlanningSummaryLoaded: true,
                planningSummaryPayload: (<SetPlanningSummary>action).planningSummaryPayload
            };
        case SET_HOLDING_ASSET_LIABILITY:
            return {
                ...state,
                isHoldingAssetLiabilityLoaded: true,
                holdingAssetLiabilityPayload: (<SetHoldingAssetLiability>action).holdingAssetLiabilityPayload
            };
        case SET_UTILITY_ASSET_LIABILITY_DETAILS:
            return {
                ...state,
                isUtilityAssetLiabilityDetailsLoaded: true,
                utilityAssetLiabilityDetailsPayload: (<SetUtilityAssetLiabilityDetails>action).utilityAssetLiabilityDetailsPayload
            };

        case SET_FAVOURITE_LIST:
            return {
                ...state,
                isfavouriteListLoaded: true,
                favouriteListPayload: (<SetFavouriteList>action).favouriteListPayload
            };
        case SET_SAVINGS_DETAILS:
            return {
                ...state,
                isSavingsDetails: true,
                savingsDetailsPayload: (<SetSavingsDetails>action).savingsDetailsPayload

            };
        case SET_COUNTRY:
            return {
                ...state,
                isSavingsDetails: true,
                countryPayload: (<SetCountry>action).countryPayload

            };
        case SET_LANGUAGE:
            return {
                ...state,
                isSavingsDetails: true,
                languagePayload: (<SetLanguage>action).languagePayload

            };
        case SET_PROVINCE:
            return {
                ...state,
                isSavingsDetails: true,
                provincePayload: (<SetProvince>action).provincePayload

            };
        case SET_TASK_AND_NOTIFICATION:
            return {
                ...state,
                taskandnotificationPayload: (<SetTaskAndNotification>action).taskandnotificationPayload
            };
        case SET_ALLCOUNTRY_FORMATE:
            return {
                ...state,
                allCountryFormatePayload: (<SetAllCountryFormate>action).allCountryFormatePayload
            };
        case SET_INVESTMENT_DATA:
            return {
                ...state,
                investmenAlltData: (<SetInvestmentData>action).investmenAlltData
            };
        case SET_CLIENT_OVERVIEW_TASK_AND_NOTIFICATION:
            return {
                ...state,
                clientOverviewTaskAndNotificationData: (<SetClientOverviewTaskAndNotification>action).clientOverviewTaskAndNotificationData
            };
        case SET_BRANDING_DETAILS:
            return {
                ...state,
                brandingDetailsPayload: (<SetBrandingDetails>action).brandingDetailsPayload
            };
        case SET_GRAPH_COLOURS:
            return {
                ...state,
                graphColoursPayload: (<SetGraphColours>action).graphColoursPayload
            };
        case SET_ENGAGEMENT_VALUES:
            return {
                ...state,
                engagementValuePayload: (<SetEngagementValues>action).engagementValuePayload
            };
        case SET_ENGAGEMENT_PRIORITIES:
            return {
                ...state,
                engagementPrioritiesPayload: (<SetEngagementPriorities>action).engagementPrioritiesPayload
            };
        case SET_ADVISOR_INVESTMENT:
            return {
                ...state,
                advisorInvestmentPaylod: (<SetAdvisorInvestment>action).advisorInvestmentPaylod
            };
        case SET_ADVISOR_NET_WORTH:
            return {
                ...state,
                advisorNetWorthPaylod: (<SetAdvisorNetWorth>action).advisorNetWorthPaylod
            };
        case SET_OTHER_BENEFICIARY:
            return {
                ...state,
                otherBeneficiaryPaylod: (<SetOtherBeneficiary>action).otherBeneficiaryPaylod
            };
        case SET_ENTITY_LIST:
            return {
                ...state,
                entityListPayload: (<SetEntityList>action).entityListPayload
            };
        case SET_CORPORATION_LIST:
            return {
                ...state,
                corporationListPayload: (<SetCorporationList>action).corporationListPayload
            };
        case SET_SHARE_LIST:
            return {
                ...state,
                shareListPayload: (<SetShareList>action).shareListPayload
            };
        case SET_REVENUE_DATES:
            return {
                ...state,
                revenueDates: (<SetRevenueDates>action).revenueDatesPayload
            };
        case SET_CLIENT_DEFAULT_DATA:
            return {
                ...state,
                clientDefaultData: (<SetClientDefaultData>action).clientDefaultDataPayload
            }

        default:
            return state;
    }
}

export const reducers: ActionReducerMap<State> = {
    app: appReducer
};

export const getAppState = createFeatureSelector<AppState>('app');

export const getIsLoggedIn = createSelector(
    getAppState,
    (state: AppState) => state.isLoggedIn
);

export const getAdvisorPayload = createSelector(
    getAppState,
    (state: AppState) => state.advisorPayload
);

export const getAccessRightsPayload = createSelector(
    getAppState,
    (state: AppState) => state.accessRightsPayload
);

export const getIsAccessRightsLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isAccessRightsLoaded
);

export const getClientPayload = createSelector(
    getAppState,
    (state: AppState) => state.clientPayload
);

export const getIsClientLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isClientLoaded
);

export const getIsGoalLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isGoalLoaded
);

export const getGoalPayload = createSelector(
    getAppState,
    (state: AppState) => state.goalPayload
);

export const getIsDocumentLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isDocumentsLoaded
);

export const getDocumentPayloads = createSelector(
    getAppState,
    (state: AppState) => state.documentPayloads
);

export const getIsPortfolioLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isPortfolioLoaded
);
export const getPortfolioPayload = createSelector(
    getAppState,
    (state: AppState) => state.portfolioPayload
);

export const getAllocPayload = createSelector(
    getAppState,
    (state: AppState) => state.allocationPayload
);

export const getIsNetworthInvestmentLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isNetworthInvestmentLoaded
);

export const getNetworthInvestmentPayload = createSelector(
    getAppState,
    (state: AppState) => state.networthInvestmentPayload
);

export const getClientAddressPayload = createSelector(
    getAppState,
    (state: AppState) => state.clientAddressPayload
);

export const getFamilyMemberPayload = createSelector(
    getAppState,
    (state: AppState) => state.familyMemberPayload
);

export const getGoalRetirementAssumptionPayload = createSelector(
    getAppState,
    (state: AppState) => state.goalRetirementAssumptionPayload
);

export const getPlanAssumptPayload = createSelector(
    getAppState,
    (state: AppState) => state.planAssumptPayload
);

export const getFamilyMemberRiskPayload = createSelector(
    getAppState,
    (state: AppState) => state.familyMemberRiskPayload
);

export const getIsClientProgressLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isClientProgressLoaded
);

export const getClientProgressPayload = createSelector(
    getAppState,
    (state: AppState) => state.clientProgressPayload
);
export const getIsAdvisorLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorLoaded
);
export const getAdvisorWorkflowPayload = createSelector(
    getAppState,
    (state: AppState) => state.advisorWorkflowPayload
);

export const getkycQuestionsPayLoad = createSelector(
    getAppState,
    (state: AppState) => state.kycQuestionsPayLoad
);

export const getAdvisorClientPayLoad = createSelector(
    getAppState,
    (state: AppState) => state.advisorClientPayload
);

export const getAdvisorTaskNotificationPayload = createSelector(
    getAppState,
    (state: AppState) => state.advisorTaskNotificationPayload
);

export const getIsAdvisorTaskNotificationPayload = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorTaskNotificationPayload
);
export const getIsAdvisorClientLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorClientLoaded
);
export const getIsAdvisorDemographicLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorDemographicLoaded
);
export const getAdvisorDemographicPayload = createSelector(
    getAppState,
    (state: AppState) => state.advisorDemographicPayload
);
export const getAdvisorDocument = createSelector(
    getAppState,
    (state: AppState) => state.advisorDocumentPayload
);
export const getIsAdvisorDocument = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorDocumentLoaded
);
export const getAdvisorCollaborationPayload = createSelector(
    getAppState,
    (state: AppState) => state.advisorCollaborationPayload
);

export const getIsAdvisorCollaborationPayload = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorCollaborationPayload
);

export const getAdvisorSuitabilityPayload = createSelector(
    getAppState,
    (state: AppState) => state.advisorSuitabilityPayload
);

export const getIsAdvisorSuitabilityPayload = createSelector(
    getAppState,
    (state: AppState) => state.isAdvisorSuitabilityPayload
);
export const getIsClientDocumentTypeLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isClientDocumentTypeLoaded
);

export const getclientDocumentTypePayload = createSelector(
    getAppState,
    (state: AppState) => state.clientDocumentTypePayload
);


export const getIsTemplateListLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isTemplateListLoaded
);

export const getTemplateListLoaded = createSelector(
    getAppState,
    (state: AppState) => state.TemplateListPayload
);

export const getIsPlanningSummaryLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isPlanningSummaryLoaded
);

export const getPlanningSummaryPayload = createSelector(
    getAppState,
    (state: AppState) => state.planningSummaryPayload
);

export const getIsholdingAssetLiabilityLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isHoldingAssetLiabilityLoaded
);

export const getholdingAssetLiabilityPayload = createSelector(
    getAppState,
    (state: AppState) => state.holdingAssetLiabilityPayload
);

export const getIsUtilityAssetLiabilityDetailsLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isUtilityAssetLiabilityDetailsLoaded
);

export const getUtilityAssetLiabilityDetailsPayload = createSelector(
    getAppState,
    (state: AppState) => state.utilityAssetLiabilityDetailsPayload
);

export const getIsFavouriteListLoaded = createSelector(
    getAppState,
    (state: AppState) => state.isfavouriteListLoaded
);

export const getFavouriteListPayload = createSelector(
    getAppState,
    (state: AppState) => state.favouriteListPayload
);

export const getSavingsDetailsPayload = createSelector(
    getAppState,
    (state: AppState) => state.savingsDetailsPayload
);

export const getCountryPayload = createSelector(
    getAppState,
    (state: AppState) => state.countryPayload
);

export const getLangualePayload = createSelector(
    getAppState,
    (state: AppState) => state.languagePayload
);

export const getProvincePayload = createSelector(
    getAppState,
    (state: AppState) => state.provincePayload
);

export const getTaskAndNotificationPayload = createSelector(
    getAppState,
    (state: AppState) => state.taskandnotificationPayload
);

export const getAllCountryFormatePayload = createSelector(
    getAppState,
    (state: AppState) => state.allCountryFormatePayload
);

export const getInvestmentData = createSelector(
    getAppState,
    (state: AppState) => state.investmenAlltData
);

export const getClientOverviewTaskData = createSelector(
    getAppState,
    (state: AppState) => state.clientOverviewTaskAndNotificationData
);
export const getBrandingDetails = createSelector(
    getAppState,
    (state: AppState) => state.brandingDetailsPayload
);
export const getGraphColours = createSelector(
    getAppState,
    (state: AppState) => state.graphColoursPayload
);
export const getEngagementValue = createSelector(
    getAppState,
    (state: AppState) => state.engagementValuePayload
);
export const getEngagementPriority = createSelector(
    getAppState,
    (state: AppState) => state.engagementPrioritiesPayload
);
export const getAdvisoreInvestment = createSelector(
    getAppState,
    (state: AppState) => state.advisorInvestmentPaylod
);
export const getAdvisorNetWorth = createSelector(
    getAppState,
    (state: AppState) => state.advisorNetWorthPaylod
);
export const getOtherBeneficiary = createSelector(
    getAppState,
    (state: AppState) => state.otherBeneficiaryPaylod
);
export const getEntities = createSelector(
    getAppState,
    (state: AppState) => state.entityListPayload
);
export const getCorporationList = createSelector(
    getAppState,
    (state: AppState) => state.corporationListPayload
);
export const getShareList = createSelector(
    getAppState,
    (state: AppState) => state.shareListPayload
);
export const getRevenueDates = createSelector(
    getAppState,
    (state: AppState) => state.revenueDates
);
export const getClientDefaultData = createSelector(
    getAppState,
    (state: AppState) => state.clientDefaultData
);