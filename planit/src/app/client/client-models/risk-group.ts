export let RiskGroups: any = {
    'FM10-G1': 'Very Low',
    'FM10-G2': 'Low',
    'FM10-G3': 'Average',
    'FM10-G4': 'High',
    'FM10-G5': 'Very High',
    'FM25-G1': '1',
    'FM25-G2': '2',
    'FM25-G3': '3',
    'FM25-G4': '4',
    'FM25-G5': '5',
    'FM25-G6': '6',
    'FM25-G7': '7',
};


export let RiskLabels: any = {
    '1': 'Very Low',
    '2': 'Low',
    '3': 'Average',
    '4': 'High',
    '5': 'Very High'
};

export function riskScoreBadge(score) {
    const riskGroupDetails = {
        label: '',
        group: '',
        riskGroup: 0
    };
    if (score >= 0 && score <= 34) {
        riskGroupDetails.label = 'Very Low';
        riskGroupDetails.group = 'G1';
        riskGroupDetails.riskGroup = 1;
    } else if (score >= 35 && score <= 44) {
        riskGroupDetails.label = 'Low';
        riskGroupDetails.group = 'G2';
        riskGroupDetails.riskGroup = 2;
    } else if (score >= 45 && score <= 54) {
        riskGroupDetails.label = 'Average';
        riskGroupDetails.group = 'G3';
        riskGroupDetails.riskGroup = 3;
    } else if (score >= 55 && score <= 64) {
        riskGroupDetails.label = 'High';
        riskGroupDetails.group = 'G4';
        riskGroupDetails.riskGroup = 4;
    } else if (score >= 65 && score <= 100) {
        riskGroupDetails.label = 'Very High';
        riskGroupDetails.group = 'G5';
        riskGroupDetails.riskGroup = 3;
    } else {
        riskGroupDetails.label = 'N/A';
        riskGroupDetails.group = '';
    }
    return riskGroupDetails;
}
