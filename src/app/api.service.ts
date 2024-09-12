import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://dummyjson.com/users';

  constructor(private http: HttpClient) {}

  getData(skip: number, limit: number): Observable<any> {
    // Basic validation for skip and limit
    if (skip < 0 || limit <= 0) {
      console.error('Invalid skip or limit value');
      return of({ users: [], total: 0 }); // Return an empty result
    }

    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString())
      .set('select', 'firstName,age');

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        // Validate response structure
        if (!response || !response.users || !Array.isArray(response.users)) {
          throw new Error('Invalid response structure');
        }
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        // Return an empty result or a default value
        return of({ users: [], total: 0 });
      })
    );
  }
}
