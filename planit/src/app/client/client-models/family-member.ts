export class FamilyMember {
    id: string;
    relation: number;
    title: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    birthPlace: string;
    preferredName: string;
    governmentID: string;
    email: string;
    mobilePhone: string;
    retired: string;
    initials: string;
    avatar: string;
    risk: string;
    kyc: string;
    self: string;
    riskInviteStatus: number;
    docInviteStatus: number;
}


export let Relation: any = [
    { id: 12, name: 'Client 1' },
    { id: 13, name: 'Client 2' },
    { id: 1, name: 'Son' },
    { id: 2, name: 'Daughter' },
    { id: 3, name: 'Brother' },
    { id: 4, name: 'Sister' },
    { id: 5, name: 'Mother' },
    { id: 6, name: 'Father' },
    { id: 7, name: 'Grandson' },
    { id: 8, name: 'Granddaughter' },
    { id: 9, name: 'Other dependant' },
];
export let Titles: any = [
    { name: 'Mr.' },
    { name: 'Mrs.' },
    { name: 'Dr.' },
    { name: 'Miss.' }
];


export let MaritalStatus: any = [
    { id: 1, name: 'Married' },
    { id: 2, name: 'Single' },
    { id: 3, name: 'Common law' },
    { id: 4, name: 'Divorced' },
    { id: 5, name: 'Widowed' },
    { id: 6, name: 'Separated' },
    { id: -3, name: 'Married/Single' }
];

