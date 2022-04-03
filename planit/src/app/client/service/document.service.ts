import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { statusData } from '../client-models';

import {
    AppState,
    getFamilyMemberPayload
} from '../../shared/app.reducer';
import { SetDocuments, SetClientDocumentType } from '../../shared/app.actions';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class DocumentService {
    eventEmitter = new EventEmitter();
    inviteSent: Subject<any> = new Subject<any>();
    constructor(
        private http: HttpClient,
        private store: Store<AppState>
    ) { }

    public pushInvite(docid, docType) {
        this.inviteSent.next({ 'docid': docid, 'docType': docType });
    }

    public subscribeToInvite() {
        return this.inviteSent.asObservable();
    }

    getClientDocumentType(): any {
        this.http.get('/v30/documents/types').toPromise().then(response => {
            this.store.dispatch(new SetClientDocumentType(response));
        }).catch(errorResponse => {
            this.store.dispatch(new SetClientDocumentType([]));
        });
    }

    getClientDocuments(clientId, searchString = '', filterBy = 'ALL', sortBy = 'MOSTRECENT'): Observable<any> {
        return this.http
            .get('/v30/documents/' + clientId + '/list?filterBy=' + filterBy + '&sortBy=' + sortBy + '&searchString=' + searchString);
    }

    getClientDocumentPayloads(clientId: string) {
        this.getClientDocuments(clientId).toPromise().then(data => {
            data.forEach(function (document) {
                // if pre existing SDB item has a null status
                // default to IN_PROGRESS
                if ( !document.hasOwnProperty('status')) {
                    document.status='IN_PROGRESS';
                }
            });
    
            this.store.dispatch(new SetDocuments(data));
        }).catch(errorResponse => {
            this.store.dispatch(new SetDocuments([]));
        });
    }

    uploadDocument(document: any, documentName: string, documentType: number, cleintId): Observable<String> {
        const httpOptionObj = {};
        documentName = encodeURIComponent(documentName);
        httpOptionObj['isFile'] = 'true';
        return this.http.post('/v30/documents/upload?documentName=' + documentName + '&documentType=' + documentType + '&clinum=' + cleintId, document, httpOptionObj)
            .map((response: Response) => {
                return response;
            })
            .catch(error => Observable.throw(error));
    }

    deleteClientDocument(docId: string) {
        return this.http.delete('/v30/documents/' + docId);
    }
  sendInvite(familyId, personId, invitePayload) {
    return this.http.post('/v30/documents/sendInvite/' + personId, invitePayload);
  }

  getInviteOptions(familyId, personalId): any {
    return this.http.get('/v30/documents/' + personalId + '/getInviteOptions');
  }
    downloadClientDocument(docId: string): any {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.get('/v30/documents/' + docId + '/download', httpOptionObj);
    }

    downloadFile(blob, fileName: string, docId?: string) {
        const observable = this.updateNewDocumentStatus(docId);
        if (!this.isIE()) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            window.setTimeout(function () {
                URL.revokeObjectURL(blob);
                document.body.removeChild(link);
            }, 0);
        } else if (document.execCommand) {
            window.navigator.msSaveBlob(blob, fileName);
        }
        return observable;
    }

    updateNewDocumentStatus(docId: string) {
        const httpOptionObj = {};
        return this.http.put('/v30/documents/' + docId + '/updateNewDocumentStatus', {}, httpOptionObj);
    }

    isIE() {
        const ua = navigator.userAgent;
        /* MSIE used to detect old browsers and Trident used to newer ones*/
        return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
    }

    saveGenerateDocument(generateDocument: any): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.post('/v30/documents/generate', generateDocument, httpOptionObj);
    }

    renameClientDocument(docId: string, documentName: string) {
        return this.http.put('/v30/documents/' + docId + '/rename', documentName);
    }

    updateClientDocumentStatus(docId: string, status: string) {
        return this.http.put('/v30/documents/' + docId + '/status', status);
    }

    getDocumentByCategory(categoryId): any {
        return this.http.get('/v30/documents/' + categoryId);
    }

    getDocumentPageSelection(documentId, clientid): any {
        return this.http.get('/v30/documents/' + documentId + '/pageselection/' + clientid);
    }

    shareClientDocument(docId: string) {
        return this.http.post('/v30/documents/' + docId + '/share', {});
    }

    unshareClientDocument(docId: string) {
        return this.http.post('/v30/documents/' + docId + '/unshare', {});
    }

    saveTemplate(template) {
        return this.http.post('/v30/documents/template', template);
    }
    updateTemplate(template) {
        return this.http.put('/v30/documents/template', template);
    }
}
