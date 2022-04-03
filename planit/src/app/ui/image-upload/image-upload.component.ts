import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadService } from '../services/file-upload-service';
import { TranslateService } from '@ngx-translate/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit, OnChanges, OnDestroy {
    closeResult: string;
    @ViewChild('fileInput') fileInput: ElementRef;
    @ViewChild('cropImageTemplate') cropImageTemplate: NgbModalRef;
    errors: Array<string> = [];
    @Input() maxFiles = 1;
    @Input() maxSize = 5; // 5MB
    @Input() iconClass = 'ion-md-cloud-upload';
    @Input() dropHereLabel;
    @Input() isBrandingLogo ?= false;
    @Input() popupType ?= 0;
    @Input() existingFile = '';
    @Input() fileExt = 'JPG, JPEG, PNG';
    @Input() isFileselected ? = false;
    @Input() isEntity ?= false;
    ImageExtention = ['JPG', 'JPEG', 'PNG'];
    @Output() fileSelected = new EventEmitter();
    dragAreaClass = 'dragarea';
    imageChangedEvent: any;
    croppedImage: any = '';
    croppedImageFile: any;
    imageSrc = '';
    allowedHex = ['89504E47', 'FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1'];
    private unsubscribe$ = new Subject<void>();
    constructor(
        private modalService: NgbModal,
        public translate: TranslateService,
        private fileUploadService: FileUploadService
    ) { }

    ngOnInit() {
        if (this.existingFile) {
            this.croppedImage = this.existingFile;
            this.isFileselected = true;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['existingFile']) {
            this.croppedImage = changes['existingFile']['currentValue'];
        }
    }

    getBase64(file) {
        const myReader: FileReader = new FileReader();
        myReader.readAsDataURL(file);
        myReader.onloadend = (e) => {
            this.croppedImage = myReader.result;
        };
    }

    removeSelected() {
        this.croppedImage = null;
        this.isFileselected = false;
        this.fileSelected.emit();
        this.fileInput.nativeElement.value = '';
    }

    browseFile() {
        const el: HTMLElement = this.fileInput.nativeElement as HTMLElement;
        el.click();
    }

    private isValidFiles(files) {
        // Check Number of files
        if (files.length > this.maxFiles) {
            this.translate.get('FILEUPLOAD.ERROR.MAX_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                this.errors.push(res);
                return false;
            });
        }

        if (this.errors.length === 0) {
            this.isValidFileExtension(files);
        }

        if (this.errors.length === 0) {
            this.isValidFileSize(files);
        }

        return this.errors.length === 0;
    }

    private isValidFileExtension(files) {
        // Make array of file extensions
        const extensions = (this.fileExt.split(','))
            .map(function (x) { return x.toLocaleUpperCase().trim(); });

        for (let i = 0; i < files.length; i++) {
            // Get file extension
            const ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
            // Check the extension exists
            if (!this.ImageExtention.includes(ext)) {
                // this.isFilePreview = false;
            }
            const exists = extensions.includes(ext);
            if (!exists) {
                this.translate.get('FILEUPLOAD.ERROR.INVALID_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    this.errors.push(res);
                });
            }
            if (this.errors.length > 0) {
                return;
            }
            // Check file size
            // this.isValidFileSize(files[i]);
        }
    }

    private isValidFile(file) {
        const filereader = new FileReader();
        filereader.readAsArrayBuffer(file);
        filereader.onloadend = (evt) => {
            if (evt.target['readyState'] === filereader.DONE) {
                const uint = new Uint8Array(evt.target['result']);
                const bytes = [];
                uint.forEach((byte) => {
                    bytes.push(byte.toString(16));
                });
                const hex = bytes.join('').toUpperCase().slice(0, 8);
                if ((this.allowedHex.indexOf(hex) > -1) && this.errors.length === 0) {
                    if (!this.isBrandingLogo) {
                        this.openModal(this.cropImageTemplate);
                    } else {
                        this.getBase64(file);
                        this.fileSelected.emit(file);
                    }
                    return true;
                } else {
                    this.translate.get('FILEUPLOAD.ERROR.INVALID_FILE', { value: this.maxFiles }).pipe(takeUntil(this.unsubscribe$)).subscribe(async (res: string) => {
                        this.errors.push(res);
                        await this.removeSelected();
                        return false;
                    });
                }
            }
        };
    }

    private isValidFileSize(file) {
        const fileSizeinMB = file[0].size / (1024 * 1000);
        const size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
        if (size > this.maxSize) {
            this.translate.get('FILEUPLOAD.ERROR.FILE_SIZE', { value: this.maxSize })
            .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    this.errors.push(res);
                    this.removeSelected();
                });
        }
    }

    fileChangeEvent(fileInput: any): void {
        this.errors = [];
        if (fileInput.type === 'change') {
            if (fileInput.target.files && fileInput.target.files[0]) {
                if (this.isValidFiles(fileInput.target.files)) {
                    this.isFileselected = true;
                    this.imageChangedEvent = fileInput;
                    if (!this.isBrandingLogo) {
                        this.isValidFile(fileInput.target.files[0]);
                        // this.openModal(this.cropImageTemplate);
                        // this.fileSelected.emit(fileInput.target.files[0]);
                    } else {
                        this.isValidFile(fileInput.target.files[0]);
                    }
                } else {
                    this.croppedImage = null;
                    this.isFileselected = false;
                }
            }
        }
    }

    imageCropped(image: ImageCroppedEvent) {
        this.croppedImage = image.base64;
        this.croppedImageFile = image.file;
    }

    openModal(content) {
        this.modalService.open(content, { backdrop: 'static', keyboard: false }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            if (result === 'Save click') {
                this.fileSelected.emit(new File([this.croppedImageFile], 'personId.png'));
            }
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
