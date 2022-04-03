import { Action } from '@ngrx/store';
export const LOGIN = '[app] Login';
export const LOGOUT = '[app] Logout';
export const SET_REVENUE_DATES = '[Holding_Details] Retirement Dates'
export const SET_CLIENT_DEFAULT_DATA = '[Holding_Details] Client Default Data'
export const SET_ADVISOR_DETAIL = '[app] Advisor Details';
export const SET_ACCESS_RIGHTS = '[app] Access Rights';
export const SET_CLIENT = '[app] Set Client';
export const SET_GOAL = '[goal] Set Goal';
export const SET_DOCUMENTS = '[documents] Set Documents';
export const SET_PORTFOLIO = '[portfolio] Set Portfolio';
export const SET_ALLOC = '[alloc] Set Alloc';
export const SET_TASKS = '[tasks] Set Tasks';
export const SET_CLIENT_ADDRESS = '[clientAddress] Set ClientAddress';
export const SET_NETWORTHINVESTMENT = '[networthInvestment] Set NetworthInvesment';
export const SET_FAMILY_MEMBERS = '[familyMembers] Set FamilyMembers';
export const SET_GOAL_RETIREMENT_ASSUMPTION = '[goal] Set RetirementAssumption';
export const SET_PLAN_ASSUMPT = '[planAssumpt] Set PlanAssumpt';
export const SET_FAMILY_MEMBERS_RISK = '[FamilyMembersRisk] Set FamilyMembersRisk';
export const SET_CLIENT_PROGRESS = '[SET_CLIENT_PROGRESS] Set SET_CLIENT_PROGRESS';
export const SET_ADVISOR_WORKFLOW = '[SET_ADVISOR_WORKFLOW] Set SET_ADVISOR_WORKFLOW';
export const SET_BEHAVIOURAL_RISK_TOLERANCE = '[SET_BEHAVIOURAL_RISK_TOLERANCE] Set SET_BEHAVIOURAL_RISK_TOLERANCE';
export const SET_KYC_QUESTIONS = '[SET_KYC_QUESTIONS] Set SET_KYC_QUESTIONS';
export const SET_ADVISOR_NETWORTHINVESTMENT = '[advisorNetworthInvestment] Set AdvisorNetworthInvesment';
export const SET_ADVISOR_CLIENT = '[SET_ADVISOR_CLIENT] set SET_ADVISOR_CLIENT';
export const SET_ADVISOR_TASKNOTIFICATION = '[advisorTaskNotification] Set AdvisorTaskNotification';
export const SET_ADVISOR_DEMOGRAPHICS = '[advisorDemographic] Set AdvisorDemographic';
export const SET_ADVISOR_DOCUMENT = '[setAdvisorDocument] Set setAdvisorDocument';
export const SET_ADVISOR_COLLABORATION = '[advisorCollaboration] Set AdvisorCollaboration';
export const SET_ADVISOR_SUITABILITY = '[advisorSuitability] Set AdvisorSuitability';
export const SET_CLIENT_DOCUMENT_TYPE = '[clientDocumentType] Set ClientDocumentType';
export const SET_CLIENT_PORTFOLIO_LIST = '[setClientPortfolioList] Set setClientPortfolioList';
export const SET_TEMPLATE_LIST = '[setTemplateList] Set setTemplateList';
export const SET_PLANNING_SUMMARY = '[SET_PLANNING_SUMMARY] Set setPlanningSummary';
export const SET_HOLDING_ASSET_LIABILITY = '[setHoldingAssetLiability] Set setHoldingAssetLiability';
export const SET_UTILITY_ASSET_LIABILITY_DETAILS = '[setUtilityAssetLiabilityDetails] Set setUtilityAssetLiabilityDetails';
export const SET_ACCOUNT_SUMMARY_LIST = '[setAccountSummaryList] Set setAccountSummaryList';
export const SET_FAVOURITE_LIST = '[setFavouritList] Set setFavouritList';
export const SET_SAVINGS_DETAILS = '[setSavingsDetails] Set setSavingsDetails';
export const SET_COUNTRY = '[setCountry] Set setCountry';
export const SET_LANGUAGE = '[setLanguage] Set setLanguage';
export const SET_PROVINCE = '[setProvince] Set setProvince';
export const SET_TASK_AND_NOTIFICATION = '[setTaskAndNotification] Set setTaskAndNotification';
export const SET_ALLCOUNTRY_FORMATE = '[setAllCountryFormate] Set setAllCountryFormate';
export const SET_INVESTMENT_DATA = '[SetInvestmentData] Set SetInvestmentData';
export const SET_CLIENT_OVERVIEW_TASK_AND_NOTIFICATION = '[SetClientOverviewTaskAndNotification] Set SetClientOverviewTaskAndNotification';
export const SET_BRANDING_DETAILS = '[setBrandingDetails] Set setBrandingDetails';
export const SET_GRAPH_COLOURS = '[setGraphColours] Set setGraphColours';
export const SET_ENGAGEMENT_VALUES = '[SetEngagementValues] Set SetEngagementValues';
export const SET_ENGAGEMENT_PRIORITIES = '[SetEngagementPriorities] Set SetEngagementPriorities';
export const SET_ADVISOR_INVESTMENT = '[SetAdvisorInvestment] Set SetAdvisorInvestment';
export const SET_ADVISOR_NET_WORTH = '[SetAdvisorNetWorth] Set SetAdvisorNetWorth';
export const SET_OTHER_BENEFICIARY = '[SetOtherBeneficiary] Set SetOtherBeneficiary';
export const SET_ENTITY_LIST = '[SetEntityList] Set SetEntityList';
export const SET_CORPORATION_LIST = '[SetCorporationList] Set SetCorporationList';
export const SET_SHARE_LIST = '[SetShareList] Set SetShareList';
export class Login implements Action {
    readonly type = LOGIN;
}

export class Logout implements Action {
    readonly type = LOGOUT;
}

export class SetAdvisorDetail implements Action {
    readonly type = SET_ADVISOR_DETAIL;
    constructor(public advisorPayload: any) { }
}

export class SetAccessRights implements Action {
    readonly type = SET_ACCESS_RIGHTS;
    constructor(public accessRightsPayload: any) { }
}

export class SetClient implements Action {
    readonly type = SET_CLIENT;
    constructor(public clientPayload: any) { }
}

export class SetGoal implements Action {
    readonly type = SET_GOAL;
    constructor(public goalPayload: any[]) { }
}

export class SetDocuments implements Action {
    readonly type = SET_DOCUMENTS;
    constructor(public documentPayloads) { }
}

export class SetAlloc implements Action {
    readonly type = SET_ALLOC;
    constructor(public allocPayload: any) { }
}

export class SetNetworthInvestment implements Action {
    readonly type = SET_NETWORTHINVESTMENT;
    constructor(public networthInvestmentPayload: any) { }
}

export class SetPortfolio implements Action {
    readonly type = SET_PORTFOLIO;
    constructor(public portfolioPayload: any) { }
}

export class SetClientAddress implements Action {
    readonly type = SET_CLIENT_ADDRESS;
    constructor(public clientAddressPayload: any) { }
}

export class SetFamilyMembers implements Action {
    readonly type = SET_FAMILY_MEMBERS;
    constructor(public familyMemberPayload: any) { }
}

export class SetGoalRetirementAssumption implements Action {
    readonly type = SET_GOAL_RETIREMENT_ASSUMPTION;
    constructor(public goalRetirementAssumptionPayload: any) { }
}

export class SetPlanAssumpt implements Action {
    readonly type = SET_PLAN_ASSUMPT;
    constructor(public planAssumptPayload: any) { }
}

export class SetFamilyMembersRisk implements Action {
    readonly type = SET_FAMILY_MEMBERS_RISK;
    constructor(public familyMemberRiskPayload: any) { }
}

export class SetClientProgress implements Action {
    readonly type = SET_CLIENT_PROGRESS;
    constructor(public clientProgressPayload: any) { }
}

export class SetAdvisorWorkflow implements Action {
    readonly type = SET_ADVISOR_WORKFLOW;
    constructor(public advisorWorkflowPayload: any) { }
}

export class SetKycQuestions implements Action {
    readonly type = SET_KYC_QUESTIONS;
    constructor(public kycQuestionsPayLoad: any) { }
}

export class SetAdvisorClient implements Action {
    readonly type = SET_ADVISOR_CLIENT;
    constructor(public advisorClientPayload: any) { }
}

export class SetAdvisorTaskNotification implements Action {
    readonly type = SET_ADVISOR_TASKNOTIFICATION;
    constructor(public advisorTaskNotificationPayload: any) { }
}

export class SetAdvisorDemographic implements Action {
    readonly type = SET_ADVISOR_DEMOGRAPHICS;
    constructor(public advisorDemographicPayload: any) { }
}

export class SetAdvisorDocument implements Action {
    readonly type = SET_ADVISOR_DOCUMENT;
    constructor(public advisorDocumentPayload: any) { }
}

export class SetAdvisorCollaboration implements Action {
    readonly type = SET_ADVISOR_COLLABORATION;
    constructor(public advisorCollaborationPayload: any) { }
}

export class SetAdvisorSuitability implements Action {
    readonly type = SET_ADVISOR_SUITABILITY;
    constructor(public advisorSuitabilityPayload: any) { }
}
export class SetClientDocumentType implements Action {
    readonly type = SET_CLIENT_DOCUMENT_TYPE;
    constructor(public clientDocumentTypePayload: any) { }
}

export class SetClientPortfolioList implements Action {
    readonly type = SET_CLIENT_PORTFOLIO_LIST;
    constructor(public clientPortfolioListPayload: any) { }
}

export class SetTemplateList implements Action {
    readonly type = SET_TEMPLATE_LIST;
    constructor(public TemplateListPayload: any) { }
}

export class SetPlanningSummary implements Action {
    readonly type = SET_PLANNING_SUMMARY;
    constructor(public planningSummaryPayload: any) { }
}

export class SetHoldingAssetLiability implements Action {
    readonly type = SET_HOLDING_ASSET_LIABILITY;
    constructor(public holdingAssetLiabilityPayload: any) { }
}

export class SetUtilityAssetLiabilityDetails implements Action {
    readonly type = SET_UTILITY_ASSET_LIABILITY_DETAILS;
    constructor(public utilityAssetLiabilityDetailsPayload: any) { }
}

export class SetAccountSummaryList implements Action {
    readonly type = SET_ACCOUNT_SUMMARY_LIST;
    constructor(public accountSummaryListPayload: any) { }
}

export class SetFavouriteList implements Action {
    readonly type = SET_FAVOURITE_LIST;
    constructor(public favouriteListPayload: any) { }
}
export class SetSavingsDetails implements Action {
    readonly type = SET_SAVINGS_DETAILS;
    constructor(public savingsDetailsPayload: any) { }
}
export class SetCountry implements Action {
    readonly type = SET_COUNTRY;
    constructor(public countryPayload: any) { }
}
export class SetLanguage implements Action {
    readonly type = SET_LANGUAGE;
    constructor(public languagePayload: any) { }
}
export class SetProvince implements Action {
    readonly type = SET_PROVINCE;
    constructor(public provincePayload: any) { }
}
export class SetTaskAndNotification implements Action {
    readonly type = SET_TASK_AND_NOTIFICATION;
    constructor(public taskandnotificationPayload: any) { }
}
export class SetAllCountryFormate implements Action {
    readonly type = SET_ALLCOUNTRY_FORMATE;
    constructor(public allCountryFormatePayload: any) { }
}
export class SetInvestmentData implements Action {
    readonly type = SET_INVESTMENT_DATA;
    constructor(public investmenAlltData: any) { }
}
export class SetClientOverviewTaskAndNotification implements Action {
    readonly type = SET_CLIENT_OVERVIEW_TASK_AND_NOTIFICATION;
    constructor(public clientOverviewTaskAndNotificationData: any) { }
}
export class SetBrandingDetails implements Action {
    readonly type = SET_BRANDING_DETAILS;
    constructor(public brandingDetailsPayload: any) { }
}
export class SetGraphColours implements Action {
    readonly type = SET_GRAPH_COLOURS;
    constructor(public graphColoursPayload: any) { }
}
export class SetEngagementValues implements Action {
    readonly type = SET_ENGAGEMENT_VALUES;
    constructor(public engagementValuePayload: any) { }
}
export class SetEngagementPriorities implements Action {
    readonly type = SET_ENGAGEMENT_PRIORITIES;
    constructor(public engagementPrioritiesPayload: any) { }
}
export class SetAdvisorInvestment implements Action {
    readonly type = SET_ADVISOR_INVESTMENT;
    constructor (public advisorInvestmentPaylod: any) { }
}
export class SetAdvisorNetWorth implements Action {
    readonly type = SET_ADVISOR_NET_WORTH;
    constructor (public advisorNetWorthPaylod: any) { }
}
export class SetOtherBeneficiary implements Action {
    readonly type = SET_OTHER_BENEFICIARY;
    constructor (public otherBeneficiaryPaylod: any) { }
}
export class SetEntityList implements Action {
    readonly type = SET_ENTITY_LIST;
    constructor (public entityListPayload: any) { }
}
export class SetCorporationList implements Action {
    readonly type = SET_CORPORATION_LIST;
    constructor (public corporationListPayload: any ) { }
}

export class SetShareList implements Action {
    readonly type = SET_SHARE_LIST;
    constructor (public shareListPayload: any) { }
}
export class SetRevenueDates implements Action {
    readonly type = SET_REVENUE_DATES;
    constructor (public revenueDatesPayload: any) { }
}

export class SetClientDefaultData implements Action {
    readonly type = SET_CLIENT_DEFAULT_DATA;
    constructor (public clientDefaultDataPayload: any) { }
}

export type AppActions =
    | Login
    | Logout
    | SetAdvisorDetail
    | SetAccessRights
    | SetClient
    | SetGoal
    | SetDocuments
    | SetAlloc
    | SetPortfolio
    | SetNetworthInvestment
    | SetClientAddress
    | SetFamilyMembers
    | SetGoalRetirementAssumption
    | SetPlanAssumpt
    | SetFamilyMembersRisk
    | SetClientProgress
    | SetAdvisorWorkflow
    | SetKycQuestions
    | SetAdvisorClient
    | SetAdvisorTaskNotification
    | SetAdvisorDemographic
    | SetAdvisorDocument
    | SetAdvisorCollaboration
    | SetAdvisorSuitability
    | SetClientDocumentType
    | SetClientPortfolioList
    | SetTemplateList
    | SetPlanningSummary
    | SetHoldingAssetLiability
    | SetUtilityAssetLiabilityDetails
    | SetAccountSummaryList
    | SetFavouriteList
    | SetSavingsDetails
    | SetCountry
    | SetLanguage
    | SetProvince
    | SetTaskAndNotification
    | SetAllCountryFormate
    | SetInvestmentData
    | SetClientOverviewTaskAndNotification
    | SetBrandingDetails
    | SetGraphColours
    | SetEngagementValues
    | SetEngagementPriorities
    | SetAdvisorInvestment
    | SetAdvisorNetWorth
    | SetOtherBeneficiary
    | SetEntityList
    | SetCorporationList
    | SetShareList
    | SetRevenueDates
    | SetClientDefaultData;
