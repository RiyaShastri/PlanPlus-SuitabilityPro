import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from '../services/file-upload-service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { DocumentService } from '../../client/service/document.service';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState, getIsClientDocumentTypeLoaded, getclientDocumentTypePayload } from '../../shared/app.reducer';
import { HttpErrorResponse } from '@angular/common/http';
import { FileModel } from './FileModel.model';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput: ElementRef;
    errors: Array<string> = [];
    @Input() fileExt = 'JPG, GIF, PNG, JPEG';
    @Input() maxFiles = 1;
    @Input() existFile: any;
    @Input() maxSize = 5; // 5MB
    @Output() fileSelected = new EventEmitter();
    @Input() iconClass = 'ion-md-cloud-upload';
    @Input() isBase64 = true;
    @Input() isFileNamePreview = false;
    @Input() dropHereLabel: any;
    uploadedImage: any[];
    clientId: string;
    base64Image: string | ArrayBuffer;
    dragAreaClass = 'dragarea';
    isFileselected: Boolean;
    fileUnderList: any;
    documentTypes = [];
    selectedDocumentTypes: any;
    fileList: FileModel[] = [];
    isFilePreview = true;
    browseDisabled = false;
    totalFilesInQueue = 0;
    ImageExtention = ['JPG', 'GIF', 'PNG'];
    private unsubscribe$ = new Subject<void>();
    constructor(public translate: TranslateService,
        private _location: Location,
        private fileUploadService: FileUploadService,
        private advisorService: AdvisorService,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private documentService: DocumentService
    ) {
        this.isFileselected = false;
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }
    ngOnInit() {
        this.fileUploadService.getExitFile().pipe(takeUntil(this.unsubscribe$)).subscribe(file => {
            if (file) {
                this.base64Image = file;
                this.isFileselected = true;
            }
        });

        this.store.select(getIsClientDocumentTypeLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(loaded => {
            if (!loaded) {
                this.documentService.getClientDocumentType();
            } else {
                this.store.select(getclientDocumentTypePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    this.fileUnderList = data;
                    this.documentTypes = [];
                    for (let item of this.fileUnderList) {
                        const element = { typeId: item.typeId, description: item.description };
                        this.documentTypes.push(element);
                    }
                });
            }
        });
    }

    @HostListener('drop', ['$event']) onDrop(event: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: any; }; }) {
        this.errors = [];
        this.dragAreaClass = 'dragarea';
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer.files) {
            for (let file of event.dataTransfer.files) {

                const singleFile: FileModel = {
                    file: file,
                    fileName: file.name.split('.')[0],
                    fileType: undefined,
                    isDocumentUploaded: false,
                    loading: false,
                    errors: []
                }

                if (this.isValidFiles(event.dataTransfer.files, singleFile)) {
                    this.isFileselected = true;
                    this.readThis(singleFile);
                    if (this.totalFilesInQueue >= this.maxFiles) {
                       // this.translate.get('FILEUPLOAD.ERROR.MAX_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                        //    this.errors.push(res);
                        //});
                    } else {
                        this.fileList.push(singleFile);
                        this.totalFilesInQueue++;
                    }
                } else {
                    this.base64Image = '';
                    this.isFileselected = false;
                }
            }
        }
    }

    readThis(inputValue: any) {
        const file: File = inputValue.file;
        if (this.isFilePreview) {
            const myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
                this.base64Image = myReader.result;
                if (this.isBase64) {
                    inputValue.file = myReader.result;
                } else {
                    inputValue.file = file;
                }
            };
            myReader.readAsDataURL(file);
        } else {
            inputValue.file = file;
        }
    }

    @HostListener('dragover', ['$event']) onDragOver(event: { preventDefault: () => void; }) {
        this.dragAreaClass = 'droparea';
        event.preventDefault();
    }
    @HostListener('dragenter', ['$event']) onDragEnter(event: { preventDefault: () => void; }) {
        this.dragAreaClass = 'droparea';
        event.preventDefault();
    }

    @HostListener('dragend', ['$event']) onDragEnd(event: { preventDefault: () => void; }) {
        this.dragAreaClass = 'dragarea';
        event.preventDefault();
    }

    @HostListener('dragleave', ['$event']) onDragLeave(event: { preventDefault: () => void; }) {
        this.dragAreaClass = 'dragarea';
        event.preventDefault();
    }
    showFilelected(fileInput: any) {
        this.errors = [];

        if (fileInput.target.files) {
            for (let file of fileInput.target.files) {

                const singleFile: FileModel = {
                    file: file,
                    fileName: file.name.split('.')[0],
                    fileType: undefined,
                    isDocumentUploaded: false,
                    loading: false,
                    errors: []
                }

                if (this.isValidFiles(fileInput.target.files, singleFile)) {
                    this.isFileselected = true;
                    this.readThis(singleFile);
                    if (this.totalFilesInQueue >= this.maxFiles) {
                       // this.translate.get('FILEUPLOAD.ERROR.MAX_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                        //    this.errors.push(res);
                        //});
                    } else {
                        this.fileList.push(singleFile);
                        this.totalFilesInQueue++;
                    }

                } else {
                    this.base64Image = '';
                    this.isFileselected = false;
                }
            }
        }
        // this.uploadImage(this.fileList);
    }

    removeSelected(index: number) {
        this.fileList.splice(index, 1);
        this.totalFilesInQueue--;
    }

    browseFile() {
        const el: HTMLElement = this.fileInput.nativeElement as HTMLElement;
        
        if(this.totalFilesInQueue < this.maxFiles){
            this.browseDisabled = false;
        }else{
            this.browseDisabled = true;
        }

        if(!this.browseDisabled){
            el.click();
        }
    }

    private isValidFiles(Allfiles, oneFile: FileModel) {
        // Check Number of files
        if (Allfiles.length > this.maxFiles) {
            // this.translate.get('FILEUPLOAD.ERROR.MAX_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
            //     this.errors.push(res);
            //     
            // });
           return false;
        }

        if (this.errors.length === 0) {
            this.isValidFileExtension(oneFile);
        }
        return this.errors.length === 0;
    }

    private isValidFileExtension(file: FileModel) {
        this.isFilePreview = true;
        // Make array of file extensions
        const extensions = (this.fileExt.split(','))
            .map(function (x) { return x.toLocaleUpperCase().trim(); });

        // Get file extension
        const ext = file.file.name.toUpperCase().split('.').pop() || file.file.name;

        // Check the extension exists
        if (!this.ImageExtention.includes(ext)) {
            this.isFilePreview = false;
        }
        const exists = extensions.includes(ext);
        if (!exists) {
            this.translate.get('FILEUPLOAD.ERROR.INVALID_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                file.errors.push(res);
            });
        }
        // Check file size
        this.isValidFileSize(file);

    }

    private isValidFileSize(file: FileModel) {
        const fileSizeinMB = file.file.size / (1024 * 1000);
        const size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
        if (size > this.maxSize) {
            this.translate.get('FILEUPLOAD.ERROR.FILE_SIZE', { value: this.maxSize }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                file.errors.push(res);
            });
        }
    }

    async uploadDocument(index: number) {
        if (!this.fileList[index].file) {
            this.translate.get(['ALERT_MESSAGE.ERROR_TITLE', 'DOCUMENT.DOCUMENT_UPLOAD.ERROR_FILE_NOT_SELECT']).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                Swal(res['ALERT_MESSAGE.ERROR_TITLE'], res['DOCUMENT.DOCUMENT_UPLOAD.ERROR_FILE_NOT_SELECT'], 'error');
            });
            return;
        }


        this.fileList.forEach((image, index) => {
            if (image && (this.fileList[index].fileName.split('.')[0].trim() === '' || this.fileList[index].fileName.split('.')[0] === '' || this.fileList[index].fileName.split('.')[0] === undefined)) {
                this.fileList[index].fileName = image.file.name;
            }


        });

        let counter = 0;
        let newName: string = this.fileList[index].fileName;

        let maximumNo = 1;
        await this.documentService.getClientDocuments(this.clientId, '', 'ALL', 'MOSTRECENT').toPromise().then(oldDocuments => {
            oldDocuments.forEach(document => {
                if (document.documentName == newName) {
                    newName = this.fileList[index].fileName + '(' + (++counter) + ')';
                }
                if (document.documentName.includes(newName) && document.documentName.lastIndexOf("(") > 0) {
                    const index1 = document.documentName.lastIndexOf("(");
                    const index2 = document.documentName.lastIndexOf(")");

                    const count: string = document.documentName.substring(index1 + 1, index2);
                    let countNo: number = parseInt(count, 10);
                    if (maximumNo <= countNo) {
                        newName = document.documentName.substring(0, index1 + 1) + (++countNo) + ')';
                        maximumNo = countNo;
                    }

                }
            });

        });

        const formData = new FormData();
        /// This needs to be modified yet
        formData.append('file', this.fileList[index].file);

        this.fileList[index].loading = true;
        this.documentService.uploadDocument(formData, newName, this.fileList[index].fileType.typeId, this.clientId).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            this.documentService.getClientDocumentPayloads(this.clientId);
            this.advisorService.getAdvisorDocumentPayload();
            this.fileList[index].isDocumentUploaded = true;
            this.fileList[index].file = null;
            this.fileList[index].loading = false;

            let noOfNotUploadedFiles = 0;
            this.fileList.forEach(file => {
                if(!file.isDocumentUploaded){
                    noOfNotUploadedFiles++;
                }
            });
            this.totalFilesInQueue = noOfNotUploadedFiles;
        }, error => {
            this.translate.get(['ALERT_MESSAGE.ERROR_TITLE', 'DOCUMENT.DOCUMENT_UPLOAD.ERROR_FILE_NOT_SELECT']).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                Swal(res['ALERT_MESSAGE.ERROR_TITLE'], error.statusText, 'error');
                this.removeSelected(index);
            })
        });;
    }

    back() {
        this._location.back();
    }

    checkFileUnderList(event) {
    }
    
    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
