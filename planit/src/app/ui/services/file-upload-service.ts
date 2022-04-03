import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';



@Injectable()
export class FileUploadService {
    private subject = new Subject<any>();
    constructor(private router: Router) {
    }
    showExistFile(existFile) {
        this.subject.next(existFile);
    }
    getExitFile(): Observable<any> {
       return this.subject.asObservable();
    }

}
