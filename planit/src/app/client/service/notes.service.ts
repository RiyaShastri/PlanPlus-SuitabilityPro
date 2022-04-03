import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class NotesService {
    
    constructor(
        private http: HttpClient
    ) { }

    getListOfNoteTypes(isSearch): any {
        return this.http.get('/v30/note-types/?isSearch=' + isSearch);
    }

    getNoteFieldsByType(noteTypeId): any {
        return this.http.get('/v30/note-types/' + noteTypeId + '/fields');
    }

    getListOfNotes(clientId, searchDetails): any {
        return this.http.post('/v30/client/' + clientId + '/notes/_search', searchDetails);
    }

    getNoteDetailById(clientId, noteId): any {
        return this.http.get('/v30/client/' + clientId + '/notes/' + noteId);
    }

    addNote(clientId, payload): any {
        return this.http.post('/v30/client/' + clientId + '/notes', payload);
    }

    deleteNote(clientId, noteId): any {
        return this.http.delete('/v30/client/' + clientId + '/notes/' + noteId);
    }

}
