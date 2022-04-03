import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs';
@Injectable()
export class RefreshDataService {

    private messageSource = new BehaviorSubject('default message');
    currentMessage = this.messageSource.asObservable();

    private replayMessages = new ReplaySubject(4);
    currentReplays = this.replayMessages.asObservable();

    private isEditableServiceLevel = new BehaviorSubject(false);
    editServiceLevel = this.isEditableServiceLevel.asObservable();

    private timeoutService = new BehaviorSubject('initialTimeout');
    manageTimeout = this.timeoutService.asObservable();

    private translationSource = new BehaviorSubject('{"default" : "translation"}');
    currentTranslation = this.translationSource.asObservable();

    private customProductResource = new BehaviorSubject('');
    currentCustomProduct = this.customProductResource.asObservable();

    private selectedAccountsResource = new BehaviorSubject('');
    selectedAccounts = this.selectedAccountsResource.asObservable();

   
    private selectedScenarioResource = new BehaviorSubject<Scenario>(null);
    selectedScenario = this.selectedScenarioResource.asObservable();

    timer = null;
    constructor(
        private ngZone: NgZone) {
    }

    changeMessage(message: string) {
        this.messageSource.next(message);
    }

    addMessage(message: string){
        this.replayMessages.next(message);
    }

    changeEdit(edit: boolean) {
        this.isEditableServiceLevel.next(edit);
    }

    updateTimeout(timeout: string) {
        this.timeoutService.next(timeout);
    }

    changeTranslation(message: string) {
        this.translationSource.next(message);
    }

    newCustomProduct(message: string) {
        this.customProductResource.next(message);
    }

    setSelectedAccounts(message: string) {
        this.selectedAccountsResource.next(message);
    }

    selectScenario(scenario: Scenario){
        this.selectedScenarioResource.next(scenario);
    }

}

export type Scenario = {id: string, name:string};