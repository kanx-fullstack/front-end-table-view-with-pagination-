import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApicallService {

  constructor(private api: HttpClient) { }

  private getAuthOptions() {
    const token = localStorage.getItem('access');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return { headers };
  }

  login(data: { username: string; password: string }) {
    return this.api.post<any>(
      'http://127.0.0.1:8000/api/auth/token',
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }


  getRecords(){
    return this.api.get<any[]>('http://127.0.0.1:8000/api/records/', this.getAuthOptions());
  }
  putRecords(data: any) {
    return this.api.post<any>('http://127.0.0.1:8000/api/records/', data, this.getAuthOptions());
  }
}
