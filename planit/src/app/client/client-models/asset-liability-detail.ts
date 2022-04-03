export let AssetLiabilityDetail: any = {
    'IsCustom': true,
    'backOfficeId': 'asset',
    'description': '',
    'exchangeCode': null,
    'productCode': '',
    'units': 0,
    'fmv': 0,
    'asOfDate': new Date(),
    'maturityAmount': null,
    'maturityDate': null,
    'purchaseAmount': 0,
    'purchaseDate': null,
    'productNumber': null,
    'yield': null,
    'acb': 0,
    'managed': 1,
    'prod_type': ' 1',
    'fundType': null,
    'currencyCode': 'CAD',
    'included': true,
    'liquid': false,
    'companyNumber': null,
    'liability': {
        'backOfficeId': 'LIAB',
        'description': null,
        'exchangeCode': null,
        'productCode': null,
        'currentBalance': 0,
        'currentDate': new Date(),
        'compoundFrequency': 0,
        'interestRate': 0,
        'interestType': 0,
        'loanInsured': 1,
        'paymentAmount': 0,
        'paymentFrequency': 1,
        'paymentType': 0,
        'renewalAmount': null,
        'renewalDate': new Date(),
        'amountBorrowed': null,
        'amountBorrowedDate': new Date(),
        'loanType': 0,
        'liabilityLoanNumber': '',
        'initialLoanAmount': 0,
        'inceptionDate': new Date(),
        'fundType': null,
        'currencyCode': 'CAD',
        'p_currency': 0,
        'prod_type': ' 2'
    },
    'assetsBreakdown': [
        {
            'allocationBreakdownId': 1,
            'allocationBreakdown': 'Cash',
            'allocationPercent': 0,
            'displayOrder': 1
        },
        {
            'allocationBreakdownId': 2,
            'allocationBreakdown': 'Sort-term fixed income',
            'allocationPercent': 0,
            'displayOrder': 2
        },
        {
            'allocationBreakdownId': 3,
            'allocationBreakdown': 'Fixed income',
            'allocationPercent': 0,
            'displayOrder': 3
        },
        {
            'allocationBreakdownId': 4,
            'allocationBreakdown': 'Canadian equities',
            'allocationPercent': 0,
            'displayOrder': 4
        },
        {
            'allocationBreakdownId': 5,
            'allocationBreakdown': 'Canadian small cap equities',
            'allocationPercent': 0,
            'displayOrder': 5
        },
        {
            'allocationBreakdownId': 6,
            'allocationBreakdown': 'US equities',
            'allocationPercent': 0,
            'displayOrder': 6
        },
        {
            'allocationBreakdownId': 7,
            'allocationBreakdown': 'US small cap equities',
            'allocationPercent': 0,
            'displayOrder': 7
        },
        {
            'allocationBreakdownId': 8,
            'allocationBreakdown': 'International equities',
            'allocationPercent': 0,
            'displayOrder': 8
        },
        {
            'allocationBreakdownId': 9,
            'allocationBreakdown': 'Emerging markets',
            'allocationPercent': 0,
            'displayOrder': 9
        }
    ]
};
