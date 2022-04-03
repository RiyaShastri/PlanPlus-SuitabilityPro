export const WorkgroupPayload = {
    'myWorkgroups': [
        {
            'id': 0,
            'workgroupName': 'Aliquam nec risus vitae tortor',
            'members': ['John Smith', 'Harrison', 'Foster', 'Danielle', 'Burton']
        },
        {
            'id': 1,
            'workgroupName': 'Quisque ultrices risus',
            'members': ['Jason Archibald', 'Elena Gauthier', 'Ryan Murphy', 'Jamie Chapman']
        },
        {
            'id': 2,
            'workgroupName': 'Pellentesque pellentesque mattis',
            'members': ['Erin Ball', 'John Smith', 'Json Archibald', 'Adalyn Castillo', 'Sara Lambert']
        }
    ],
    'memberWorkgroups': [
        {
            'id': 0,
            'workgroupName': 'Quisque ultrices risus',
            'members': ['Jason Archibald', 'Elena Gauthier', 'Ryan Murphy', 'Jamie Chapman'],
            'isMember': true
        },
        {
            'id': 1,
            'workgroupName': 'Pellentesque pellentesque mattis',
            'members': ['Erin Ball', 'John Smith', 'Json Archibald', 'Adalyn Castillo', 'Sara Lambert'],
            'isMember': false
        }
    ]
};

export const LICENCES = [
    { name: 'PROfiler', authorized: true },
    { name: 'PRO Tracker', authorized: false },
    { name: 'PRO Planner', authorized: false },
    { name: 'PRO Planner+', authorized: false },
];

export const DESIGNATIONS = [
    { label: 'AIF', id: 0 },
    { label: 'CIM', id: 1 },
    { label: 'FCSI', id: 2 },
    { label: 'CEBC', id: 3 },
    { label: 'CIP', id: 4 },
    { label: 'PFS', id: 5 },
    { label: 'CFP', id: 6 },
    { label: 'CIWM', id: 7 },
    { label: 'PFP', id: 8 },
    { label: 'CFA', id: 9 },
    { label: 'CLU', id: 10 },
    { label: 'RFP', id: 11 },
    { label: 'ChFC', id: 12 },
    { label: 'CPA', id: 13 },
    { label: 'XYZ', id: 14 },
    { label: 'ChFP', id: 15 },
];

export const otherAdvisorDetails = {
    'company': 'PlanPlus',
    'officePhone': 1234567890,
    'mobilePhone': 1234567890,
    'officeFax': 1234567890,
    'role': 'Advisor',
    // 'userAvatar': ''
    // 'preferedLang': 'English',
    // 'initials': 'JP'
};

export const addressDetails = {
    'address1': '1st main street',
    'address2': '',
    'city': 'Sackville',
    // 'country': '',
    // 'provience': '',
    'postalCode': 'E4L4R',
};
