export const GOAL_TYPE = {
    'OTHER': 0,
    'RETIREMENT': 2,
    'EDUCATION': 3
};

export const ACCOUNT_FLAG = {
      'ON': 1,
      'OFF': 0
};

export const DEPRECIATION_TYPE = {
    'FLAT_RATE': 1,
    'DECLINING_BALANCE': 2
};

export const INVESTMENT_POLICY_VIEW = {
    'TARGET': 1,
    'TARGET_POLICY_RANGE': 2
};

export const ABOUT_ME_PORTFOLIO_CREATION_TYPE = {
    'ACCOUNT': 1,
    'INTENTED_USE': 2,
    'STRATEGIC': 3
};

export const ABOUT_ME_PORTFOLIO_SUB_TYPE = {
    'INVESTOR': 1,
    'OWNERSHIP_GROUP': 2,
    'NONE': 3
};

export const ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT = {
    'INVESTOR': 1,
    'PORTFOLIO': 2,
    'STRATEGIC': 3,
    'NONE': 4
};
export const GOAL_REVENUE_GRAPH_MAP = {
    'TIME_LINE_CHART': 1,
    'TODAY_DOLLAR': 2,
    'FUTURE_DOLLAR': 3,
};

export const GOAL_REVENUE_QUERY_PARAM = {
    'CURRENT': 'current',
    'FUTURE': 'future'
};

export const GENERATE_REPORT_PREVIOUS_URL = {
    'GOAL': 'goal',
    'PORTFOLIO': 'portfolio',
    'ASSETS_LIABILITY': 'assets',
    'CASHFLOW_MANAGEMENT': 'cashflow',
    'ESTATE_PLANNING': 'estate planning',
    'ENTITY': 'entity'
};

export const GENERATE_REPORT_REPORT_TYPES = {
    'NET_WORTH': { value: 'net_worth', label: 'NET_WORTH' },
    'INVESTMENT_HOLDINGS': { value: 'investment_holdings', label: 'INVESTMENT_HOLDINGS' },
    'WEALTH_FUND_ROLLUP': { value: 'wealth_fund_rollup', label: 'FUND_ROLLUP' },
    'INVESTMENT_FUND_ROLLUP': { value: 'investment fund_rollup', label: 'FUND_ROLLUP' },
    'ROLLUP_REPORT': { value: 'rollup_report', label: 'ROLLUP_REPORT' },
    'DETAIL_IMPLEMENTATION_STRATEGY_REPORT': { value: 'detail_implementation_strategy_report', label: 'DETAIL_IMPLEMENTATION_STRATEGY_REPORT' },
    'COMBINED_INVESTMENT_REPORT': { value: 'combined_invest', label: 'COMBINED_INVESTMENT_REPORT' },
    'GOALS_AND_OBJECTIVES': { value: 'goals_objectives', label: 'GOALS_AND_OBJECTIVES' },
    'TAX_AUDIT_REPORT': { value: 'tax_audit', label: 'TAX_AUDIT_REPORT' },
    'INCOME_TAX_PROJECTION': { value: 'income_tax_projection', label: 'INCOME_TAX_PROJECTION' },
    'CASH_FLOW_REPORT': { value: 'cash_flow_report', label: 'CASH_FLOW_REPORT' },
    'DETAILED_ESTATE_ANALYSIS': { value: 'detailed_estate_analysis', label: 'DETAILED_ESTATE_ANALYSIS' },
    'ESTATE_NET_WORTH': { value: 'rpt1', label: 'ESTATE_NET_WORTH' },
    'ESTATE_LIQUIDITY_ANALYSIS': { value: 'rpt2', label: 'ESTATE_LIQUIDITY_ANALYSIS' },
    'ESTATE_TAX': { value: 'rpt3', label: 'TAX' },
};

export const SEND_INVITATION_PARAM = {
    'RISK_TOLERANCE': 1,
    'DOCUMENT': 2,
    'VALUES': 3
};

export const CALCULATOR_DEBT_INTEREST_TYPE_ID = {
    'FIXED': 1,
    'VARIABLE': 2,
    'FIXED_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT': 3,
    'VARIABLE_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT': 4
};

export const CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION = {
    'FIXED': 'Fixed',
    'VARIABLE': 'Variable',
    'FIXED_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT': 'Fixed Interest & Fixed Principal Payment',
    'VARIABLE_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT': 'Variable Interest & Fixed Principal Payment'
};

export const NOTE_FIELD_TYPES = {
    NOTE_FIELD_C_TYPE: 'c',
    NOTE_FIELD_N_TYPE: 'n',
    NOTE_FIELD_T_TYPE: 't'
};

export const PLANTRAC_TIME_PERIODS = {
    'MONTHS_12': '12 Months',
    'SINCE_INCEPTION': 'Since Inception'
};

export const PLANTRAC_VIEW_BY_OPTIONS = {
    TOTALS: 'Totals',
    TYPE: 'Type',
    ACCOUNT: 'Account',
};

export const GENERATE_REPORT_CRITERIA_ID = {
    'PERSONAL': 1,
    'CURRENT': 2,
    'ALTERNATE': 3,
    'IMPLEMENTED': 4
};
export const GENERATE_REPORT_CRITERIA_DESCRIPTION = {
    'PERSONAL': 'Personal',
    'CURRENT': 'Current',
    'ALTERNATE': 'Alternate',
    'IMPLEMENTED': 'Implemented'
};

export const GENERATE_REPORT_FORMATE_ID = {
    'PDF': 1,
    'HTML': 2,
    'WORD': 3,
    'EXCEL': 4,
};

export const GENERATE_REPORT_FORMATE_DESCRIPTION = {
    'PDF': 'PDF',
    'HTML': 'HTML',
    'WORD': 'Word Doc',
    'EXCEL': 'EXCEL',
};

export const GENERATE_DOCUMENT_FORMATE_ID = {
    'PDF': 1,
    'WORD': 2
};

export const GENERATE_DOCUMENT_FORMATE_DESCRIPTION = {
    'PDF': 'PDF',
    'WORD': 'Word Doc'
};

export const PLANNING_ALTERNATIVES_PARAMETERS = {
    'INCOME_GOAL': 'Income Goal',
    'RATE_OF_RETURN': 'Rate Of Return',
    'START_GOAL': 'Start Goal',
    'END_GOAL': 'End Goal',
    'ANNUAL_SAVINGS': 'Annual Savings'
};
export const GRAPH_TIER = {
    'TIER': 'Tier'
};

export const ASSETS_BREADCRUMB = {
    'ACCOUNT': 'account',
    'GOAL': 'goal'
};

export const COLLABORATION_DESC_TYPES = {
    'RISK': 'Risk tolerance',
    'VALUE': 'Document vault'
};

export const COLLABORATION_FILTER_ID = {
    'MOST_RECENT': 1,
    'INCONSISTENCY': 2,
    'PENDING': 3
};

export const COLLABORATION_FILTER_ITEM = {
    'MOST_RECENT': 'MOST RECENT',
    'INCONSISTENCY': 'INCONSISTENCY',
    'PENDING': 'PENDING'
};

export const COLLABORATION_FILTER_NAME = {
    'MOST_RECENT': 'Most recent',
    'INCONSISTENCY': 'Inconsistent results',
    'PENDING': 'Pending'
};

export const BENEFICIARY_RELATION = {
    'CLIENT': 1,
    'SPOUSE': 2,
    'SURVIVING_SPOUSE': 'Surviving spouse',
    'RELATION_SPOUSE': 'Spouse'
};

export const BENEFICIARY_TYPE = {
    'PRIMARY': 'primary',
    'CONTINGENT': 'contingent'
};

export const MARITAL_STATUS = {
    'MARRIED': 1,
    'SINGLE': 2,
    'COMMON_LAW': 3,
    'DIVORCED': 4,
    'WIDOWED': 5,
    'SEPARATED': 6,
    'MARRIED_SINGLE': -3,
};

export const PERSON_RELATION = {
        'CLIENT1': 12,
        'CLIENT2': 13,
        'OTHER': 9,
        'SON': 1,
        'DAUGHTER': 2,
        'BROTHER': 3,
        'SISTER': 4,
        'MOTHER': 5,
        'FATHER': 6,
        'GRANDSON': 7,
        'GRANDDAUGHTER': 8,
        'ENTITY': 14,
};

export const OTHER_BENEFICIARY_RELATION = {
        'SPOUSE': 1,
        'CHILD': 2,
        'GRAND_PARENT': 3,
        'SIBLING': 4,
        'BUSINESS_PARTNER': 5,
        'OTHER_OTHER': 6,
        'CHARITY': 7,
        'NON_TAXABLE_TRANSFER': 8,
        'BROTHER': 9,
        'SISTER': 10,
        'SON': 11,
        'DAUGHTER': 12,
        'FATHER': 13,
        'MOTHER': 14,
        'GRANDSON': 15,
        'GRANDDAUGHTER': 16,
        'NEPHEW': 17,
        'NIECE': 18,
        'SPOUSE_NO_TAX': 19,
        'ESTATE_NO_TAX': 20,
        'ESTATE_TAX': 21,
};

export const DEBT_CONSOLIDATION_LOAN_TYPE = {
    'VARIABLE_RATE_LOAN': 1,
    'FIXED_RATE_LOAN': 2,
    'FIXED_AND_VARIABLE_COMBINED': 3,
    'MORTAGE_TYPE': 5
};

export const RELATION = {
    'SPOUSE': 12,
    'SON': 1,
    'DAUGHTER': 2
};

export const LOAN_AMORTIZATION_ACCORDION = {
    'INTEREST_RATE': 1,
    'MAXIMUM_LOAN': 2,
    'LEVERAGE_BREAK': 3
};

export const LOAN_AMORTIZATION_RETAIN_TYPE = {
    'PAYMENT': 1,
    'AMORTIZATION': 2
};

export const PROVINCE = {
    'QUEBEC': 'QC'
};

export const AMORTIZATION_PERIOD = {
    'MONTHS': 1,
    'YEARS': 2
};

export const LEGAL_CODES = {
    'CIVIL_LAW': 2
};

export const LEVERAGE_REPORT_TYPE = {
    'SUMMARY': 0,
    'SUMMARY_WITH_SIGNATURES': 1,
    'DETAILED_SCHEDULE': 2,
    'UNCERTAINTY_ANALYSIS': 3
};

export const BRANDING_RADIO_BUTTON_VALUE = {
    'DEFAULT': 0,
    'CUSTOM': 1
};

export const IMPLEMENTATION_ACCOUNTS_ACTIONS = {
    'NO_ACTION': 0,
    'CUSTOM_SOLUTION': 1,
    'KEEP_CURRENT_HOLDINGS': 2,
    'RESET': 3
};

export const SOLUTION_TYPES = {
    'TAILORED_SOLUTION': 1,
    'FUND_OF_FUNDS_SOLUTION': 2,
    'SINGLE_FUND_SOLUTION': 3
};

export const ACCOUNT_NAME_STRING = 'accountName';
export const ENTITY_TYPES = {
    'HOLDING_COMPANY': 1,
    'ACTIVE_BUISNESS': 2
};

export const SAVE_OPTIONS = {
    'SAVE_ENTITY': 1,
    'SAVE_AND_EDIT_ENTITY': 2,
    'SAVE/ADD_ENTITY': 3,
};

export const CORPORATION_OPTIONS = {
    'YES': 'Yes',
    'NO': 'No'
};

export const FAMILY_MEMBER_DROPDOWN_TYPE = {
    'RISK': 'risk',
    'FAMILY': 'family',
    'ENTITY': 'entity'
};

export const ENTITY_OWNERSHIP_SHARE_TYPE = {
    'OWNERS': 'owners',
    'SHARES': 'shares',
    'OTHER': 'Other',
    'COMMON': 'Common',
    'OTHER_ROLE': 3
};

export const ENTITY_VIEW_LIST = {
    'VIEW_BY_%': 1,
    'VIEW_BY_$': 2,
    'VIEW_BY_SHARE': 3
};

export const ASSET_CLASS_COLOURS = {
    'A_ASSCAT042': 0,
    'A_ASSCAT043': 1,
    'A_ASSCAT044': 2,
    'A_ASSCAT045': 3,
    'A_ASSCAT046': 4,
    'A_ASSCAT047': 5,
    'A_ASSCAT048': 6,
    'A_ASSCAT049': 7,
    'A_ASSCAT050': 8,
    'A_ASSCAT051': 9,
    'A_ASSCAT062': 10,
};

export const SHARE_TYPES = {
    'FIXED_VALUE': 0,
    'GROWTH': 1
};

export const PORTFOLIO_ALLOCATION_TYPE = {
    'CURRENT': 'current',
    'IMPLEMENTED': 'implemented',
    'TARGET': 'target'
};

export const EFFICIENT_FRONTIER = {
    'CURRENT_KEY': 'currentSeries',
    'IMPLEMENTED_KEY': 'implementedSeries',
    'TARGET_KEY': 'modelSeries'
};

export const PORTFOLIO_ALLOCATION_VIEW_BY = {
    'CURRENT': { id: 1, value: 'Current' },
    'CURRENT_POLICY_RANGE': { id: 2, value: 'Current-PolicyRange' },
    'TARGET_POLICY_RANGE': { id: 3, value: 'Target-PolicyRange' },
    'IMPLEMENTED_POLICY_RANGE': { id: 4, value: 'Implemented-PolicyRange' },
    'CURRENT_VS_TARGET': { id: 5, value: 'CurrentvsTarget' },
    'CURRENT_VS_IMPLEMENTED': { id: 6, value: 'CurrentvsImplemented' },
    'TARGET_VS_IMPLEMENTED': { id: 7, value: 'TargetvsImplemented' },
    'CURRENT_VS_TARGET_VS_IMPLEMENTED': { id: 8, value: 'CurrentvsTargetvsImplemented' }
};

export const ASSET_TYPE = {
    'CASH': 'Cash',
    'EQUITY': 'Equity',
    'BALANCED': 'BALANCED'
};

export const ASSETS_CLASS_OPTIONS = {
    'DETAIL': 'Detail',
    '3_CLASSES': '3-classes'
};

export const RANGE_RADIOBUTTON_OPTIONS = {
    'DEFAULT': 'default',
    'CUSTOM': 'custom',
    'INPUT': 'input'
};

export const ADVISOR_TYPES = {
    'PROFILER': 'profiler',
    'PROPLANNER': 'proplanner',
    'PROTRACKER': 'protracker'
};

export const RISK_RANGES = {
    'TOO_MUCH': 'TooMuch',
    'MARGINAL_UPPER': 'MarginalUpper',
    'TOO_LITTLE': 'TooLittle',
    'MARGINAL_LOWER': 'MarginalLower',
    'OK': 'OK'
};

export const SCENARIOS = {
    'CURRENT_SCENARIO': '00',
    'STRATEGY_SCENARIO': '01'
};

export const INVESTMENT_STRATEGY = {
    'CUSTOM': 0,
    'CURRENT': -1,
    'TARGET': -2
};

export const ENTITY_SSID = {
    'CLAWBACKFACTOR': 'clawbackFactor',
    'TOTAL_DISTRIBUTION': 'total_distribution',
    'TOTAL_RETAINED_TAX': 'total_retained_tax',
    'NET_CORPORATE_INCOME': 'net_corporate_income',
    'NET_ACTIVE_BUSINESS_INCOME': 'net_active_business_income',
    'SALARY': 'salary',
    'REPORT': 'Report'
};

export const ENTITY_ASSUMPTION_TYPES = [
    {
        'ssid': 'sbdLimit',
        'isOpcoOnly': 1
    },
    {
        'ssid': 'initialSettling',
        'isOpcoOnly': 1
    },
    {
        'ssid': 'nrdtohPool',
        'isOpcoOnly': 0
    },
    {
        'ssid': 'erdtohPool',
        'isOpcoOnly': 0
    },
    {
        'ssid': 'cda',
        'isOpcoOnly': 0
    },
    {
        'ssid': 'grip',
        'isOpcoOnly': 0
    }
];

export const OPCO_ENTITY_ASSUMPTION_TYPES = {
    'SDB_RATE': 'sbdLimit',
    'DBD_RATE': 'initialSettling'
};

export const ENTITIES_CURRENT_YEAR_INCOME_TYPE = {
    'FEDERAL': 'federal',
    'PROVINCIAL': 'provincial'
};

export const WEALTH_REPORT_TYPES = [
    {
        'id': 'NET_WORTH',
        'label': 'GENERATE_REPORT.NET_WORTH',
        'value': 'net_worth',
        'accessRights': 'NETWT'
    },
    {
        'id': 'INVESTMENT_HOLDINGS',
        'label': 'GENERATE_REPORT.INVESTMENT_HOLDINGS',
        'value': 'investment_holdings',
        'accessRights': 'HLDST'
    },
    {
        'id': 'DISPOSITION_REPORT',
        'label': 'GENERATE_REPORT.DISPOSITION_REPORT',
        'value': 'disposition_report',
        'accessRights': 'DISPOSITION'
    }
];

export const INVESTMENT_REPORT_TYPES = [
    {
        'id': 'ROLLUP_REPORT',
        'label': 'GENERATE_REPORT.ROLLUP_REPORT',
        'value': 'rollup_report',
        'accessRights': 'PORTROLLUP'
    },
    {
        'id': 'DETAIL_IMPLEMENTATION_STRATEGY_REPORT',
        'label': 'GENERATE_REPORT.DETAIL_IMPLEMENTATION_STRATEGY_REPORT',
        'value': 'detail_implementation_strategy_report',
        'accessRights': 'PORTROLLUP'
    },
    {
        'id': 'FUND_ROLLUP',
        'label': 'GENERATE_REPORT.FUND_ROLLUP',
        'value': 'investment fund_rollup',
        'accessRights': 'FFS01'
    },
];

export const GOAL_REPORT_TYPES = [
    {
        'id': 'GOALS_AND_OBJECTIVES',
        'label': 'GENERATE_REPORT.GOALS_AND_OBJECTIVES',
        'value': 'goals_objectives',
        'accessRights': 'GOALNOBJ'
    },
    {
        'id': 'TAX_AUDIT_REPORT',
        'label': 'GENERATE_REPORT.TAX_AUDIT_REPORT',
        'value': 'tax_audit',
        'accessRights': 'TXDRP'
    }
];

export const BUDGET_REPORT_TYPES = [
    {
        'id': 'INCOME_TAX_PROJECTION',
        'label': 'GENERATE_REPORT.INCOME_TAX_PROJECTION',
        'value': 'income_tax_projection',
        'accessRights': ''
    },
    {
        'id': 'CASH_FLOW_REPORT',
        'label': 'GENERATE_REPORT.CASH_FLOW_REPORT',
        'value': 'cash_flow_report',
        'accessRights': ''
    }
];
export const ESTATE_REPORT_TYPES = [
    {
        'id': 'DETAILED_ESTATE_ANALYSIS',
        'label': 'GENERATE_REPORT.DETAILED_ESTATE_ANALYSIS',
        'value': 'detailed_estate_analysis',
        'accessRights': 'EST02_SP'
    },
    {
        'id': 'ESTATE_NET_WORTH',
        'label': 'GENERATE_REPORT.ESTATE_NET_WORTH',
        'value': 'rpt1',
        'accessRights': 'EST03_SP'
    },
    {
        'id': 'ESTATE_LIQUIDITY_ANALYSIS',
        'label': 'GENERATE_REPORT.ESTATE_LIQUIDITY_ANALYSIS',
        'value': 'rpt2',
        'accessRights': 'EST04_SP'
    },
    {
        'id': 'TAX',
        'label': 'GENERATE_REPORT.TAX',
        'value': 'rpt3',
        'accessRights': ''
    }
];

export const ENTITY_REPORT_TYPES = [
    {
        'id': 'SUMMARY_REPORT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.SUMMARY_REPORT',
        'value': 1,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'CORP_REPORT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.CORP_REPORT',
        'value': 2,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'CORP_INCOME_TAX_AUDIT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.CORP_INCOME_TAX_AUDIT',
        'value': 3,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'SUMMARY_TOTAL_TAX_AUDIT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.SUMMARY_TOTAL_TAX_AUDIT',
        'value': 4,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'RDTOH_AUDIT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.RDTOH_AUDIT',
        'value': 5,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'CAPITAL_TAX_AUDIT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.CAPITAL_TAX_AUDIT',
        'value': 6,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'CDA_AUDIT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.CDA_AUDIT',
        'value': 7,
        'accessRights': '',
        'type': 'entity'
    },
    {
        'id': 'GRIP_AUDIT',
        'label': 'GENERATE_REPORT.ENTITY_REPORT_TYPE.GRIP_AUDIT',
        'value': 8,
        'accessRights': '',
        'type': 'entity'
    }
];

export const ASSETS_LIABILITY_ACCOUNT_TYPE = {
    'OTHER_OWNER_ACCOUNT': 1,
    'OWNER_ACCOUNT_TYPE': '12YKI'
};

export const ENTITY_INCOME_DISTRIBUTION = [
    {
        description: 'SETTINGS.INCOME_DISTRIBUTION.INTEREST',
        valueKey: 'interest'
    },
    {
        description: 'SETTINGS.INCOME_DISTRIBUTION.DIVIDEND',
        valueKey: 'dividends'
    },
    {
        description: 'SETTINGS.INCOME_DISTRIBUTION.DEFERRED_CAPITAL_GAINS',
        valueKey: 'deferredCapitalGains'
    },
    {
        description: 'SETTINGS.INCOME_DISTRIBUTION.REALIZED_CAPITAL_GAINS',
        valueKey: 'realizedCapitalGains'
    },
    {
        description: 'SETTINGS.INCOME_DISTRIBUTION.NON_TAXABLE',
        valueKey: 'nonTaxble'
    }
];

export const ENTITY_OWNER_TYPE = {
    'OWNER_TYPE_ACCOUNT': 0,
    'OWNER_TYPE_DEATH_BENEF': 1,
    'OWNER_TYPE_ENTITY': 2
};

export const CALCULATOR_REPORTS = {
    'LOAN_CALCULATORS': [
        {
            label: 'CALCULATOR.HEADER.LOAN_AMORTIZATION',
            value: 1,
            criteria: [],
            type: 'loan-amortization'
        },
        {
            label: 'CALCULATOR.HEADER.DEBT_CONSOLIDATION',
            value: 2,
            criteria: [],
            type: 'debt-consodlidation'
        },
        {
            label: 'CALCULATOR.HEADER.LEVERAGE',
            value: 3,
            type: 'leverage',
            criteria: [
                {
                    label: 'CALCULATOR.LEVERAGE.SUMMARY',
                    value: 0
                },
                {
                    label: 'CALCULATOR.LEVERAGE.SUMMARY_SIGNATURES',
                    value: 1
                },
                {
                    label: 'CALCULATOR.LEVERAGE.DETAILED_SCHEDULE',
                    value: 2
                },
                {
                    label: 'CALCULATOR.LEVERAGE.UNCERTAINTY_ANALYSIS',
                    value: 3
                }
            ]
        }
    ],
    'INSURANCE_CALCULATORS': [
        {
            label: 'CALCULATOR.HEADER.LONG_TERM_CARE',
            value: 4,
            type: 'long-term-care',
            criteria: []
        },
        {
            label: 'CALCULATOR.HEADER.CRITICAL_ILLNESS',
            value: 5,
            type: 'critical-illness',
            criteria: []
        },
    ],
    'INVESTMENT_CALCULATORS': [],
    'FINANCIAL_CALCULATORS': [],
};
