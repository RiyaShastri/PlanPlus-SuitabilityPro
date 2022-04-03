export interface FileModel{
    file : File; 
    fileName : string; 
    fileType : any;
    isDocumentUploaded:boolean;
    loading:boolean;
    errors:string[];
}