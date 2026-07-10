import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApicallService } from '../../services/apicall.service';
import { FormsModule } from '@angular/forms';

type RecordItem = {
  id?: number;
  title: string;
  description?: string;
  status: string;
  owner_username?: string;
  updated_at?: string;
};

@Component({
  selector: 'app-dataview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dataview.component.html',
  styleUrl: './dataview.component.css'
})
export class DataviewComponent implements OnInit {
  dataList: RecordItem[] = [];
  displayedData: any[] = [];
  page = 1;
  pageSize = 3;
  totalRecords = 0;
  currentPage = 1;
  isLoading = false;
  errorMessage = '';
  loginError = '';
  isLoggedIn = false;
  loginForm = {
    username: '',
    password: ''
  };

  newRecord: RecordItem = {
    title: '',
    description: '',
    status: 'new'
  };

  constructor(private apiCallService: ApicallService) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('access');

    if (this.isLoggedIn) {
      this.loadRecords();
    }
  }

  login() {
    this.loginError = '';
    this.errorMessage = '';

    if (!this.loginForm.username.trim() || !this.loginForm.password) {
      this.loginError = 'Username and password are required.';
      return;
    }

    this.apiCallService.login({
      username: this.loginForm.username.trim(),
      password: this.loginForm.password
    }).subscribe({
      next: (response) => {
        if (response?.access) {
          localStorage.setItem('access', response.access);
        }

        if (response?.refresh) {
          localStorage.setItem('refresh', response.refresh);
        }

        this.isLoggedIn = true;

        this.loadRecords();
      },
      error: (error) => {
        console.error('Failed to get token', error);
        this.loginError = 'Failed to log in. Check your credentials.';
      }
    });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.isLoggedIn = false;
    this.dataList = [];
    this.displayedData = [];
    this.totalRecords = 0;
    this.currentPage = 1;
    this.newRecord = {
      title: '',
      description: '',
      status: 'new'
    };
  }

  loadRecords() {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiCallService.getRecords().subscribe({
      next: (response) => {
        this.dataList = Array.isArray(response)
          ? response
          : Array.isArray((response as { results?: RecordItem[] })?.results)
            ? (response as { results: RecordItem[] }).results
            : [];

        this.totalRecords = Array.isArray(response)
          ? response.length
          : typeof (response as { count?: number })?.count === 'number'
            ? (response as { count: number }).count
            : this.dataList.length;

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }

        this.updatePage();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load records', error);
        this.errorMessage = 'Failed to load records from the API.';
        this.dataList = [];
        this.displayedData = [];
        this.totalRecords = 0;
        this.currentPage = 1;
        this.isLoading = false;
      }
    });
  }

updatePage() {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.displayedData = this.dataList.slice(start, end);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePage();
  }
}

previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePage();
  }
}

get totalPages(): number {
  return Math.ceil(this.dataList.length / this.pageSize);
}
  submitForm() {
    if (!this.newRecord.title.trim()) {
      this.errorMessage = 'Title is required.';
      return;
    }

    this.apiCallService.putRecords(this.newRecord).subscribe({
      next: (response) => {
        console.log('Record created successfully', response);
        this.newRecord = {
          title: '',
          description: '',
          status: 'new'
        };
        this.loadRecords();
      },
      error: (error) => {
        console.error('Failed to create record', error);
        this.errorMessage = 'Failed to create record.';
      }
    });
  }
}
