import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../../shared/app.reducer';
import { SetOtherBeneficiary } from '../../shared/app.actions';
import { ClientProfileService } from './profile.service';

@Injectable()
export class EstateService {

    constructor(
        private http: HttpClient,
        private profileService: ClientProfileService,
        private store: Store<AppState>
    ) { }

    getRelationsForBeneficiaries(): any {
        return this.http.get('/v30/common/beneficiary-relations');
    }

    saveOtherBeneficiary(familyId, payload): any {
        return this.http.post('/v30/client/' + familyId + '/other-beneficiaries/', payload);
    }

    getListOfOtherBeneficiaries(familyId): any {
        return this.http.get('/v30/client/' + familyId + '/other-beneficiaries/');
    }

    getOtherBeneficiaryList(familyId: string) {
        this.getListOfOtherBeneficiaries(familyId).toPromise().then(result => {
            this.store.dispatch(new SetOtherBeneficiary(result));
        }).catch(error => {
            this.store.dispatch(new SetOtherBeneficiary([]));
        });
    }

    getBeneficiaryById(familyId, beneficiaryId): any {
        return this.http.get('/v30/client/' + familyId + '/other-beneficiaries/' + beneficiaryId);
    }

    updateBeneficiary(familyId, payload): any {
        return this.http.put('/v30/client/' + familyId + '/other-beneficiaries/', payload);
    }

    addDistribution(familyId, payload): any {
        return this.http.post('/v30/client/' + familyId + '/will-distribution', payload);
    }

    getDistributions(familyId): any {
        return this.http.get('/v30/client/' + familyId + '/will-distribution');
    }

    deleteDistribution(familyId, payload): any {
        return this.http.put('/v30/client/' + familyId + '/will-distribution', payload);
    }

    getAnalysisData(familyId): any {
        return this.http.get('/v30/client/' + familyId + '/will-analysis');
    }

    saveAnalysisData(familyId, payload): any {
        return this.http.put('/v30/client/' + familyId + '/will-analysis', payload);
    }

    generateEstatePlanningReport(familyId, format, reportType): any {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.post('/v30/client/' + familyId + '/will-analysis/report?format=' + format + '&whichReport=' + reportType, {}, httpOptionObj)
            .pipe(catchError(this.profileService.parseErrorBlob));
    }

    updateResidualDistribution(familyId, payload): any {
        return this.http.put('/v30/client/' + familyId + '/will-distribution/residual-distribution', payload);
    }
}
