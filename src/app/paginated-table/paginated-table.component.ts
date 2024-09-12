import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface UserData {
  id: number;
  firstName: string;
  age: number;
}

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './paginated-table.component.html',
  styleUrls: ['./paginated-table.component.css'],
})
export class PaginatedTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'firstName', 'age'];
  dataSource = new MatTableDataSource<UserData>();
  totalDataCount: number = 0;
  limit: number = 5; // Default page size
  isLoading: boolean = true;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  originalData: UserData[] = [];
  currentPageIndex: number = 0;
  currentPageSize: number = this.limit; // Track current page size

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getDataFromApi(
      this.currentPageIndex * this.currentPageSize,
      this.currentPageSize
    );
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPageIndex = event.pageIndex;
        this.currentPageSize = event.pageSize; // Update current page size
        this.getDataFromApi(
          this.currentPageIndex * this.currentPageSize,
          this.currentPageSize
        );
      });
    }
  }

  getDataFromApi(skip: number, limit: number) {
    this.isLoading = true;
    this.apiService.getData(skip, limit).subscribe((response) => {
      this.originalData = response.users;
      this.dataSource.data = this.sortData(response.users);
      this.totalDataCount = response.total;
      if (this.paginator) {
        this.paginator.pageIndex = this.currentPageIndex;
        this.paginator.pageSize = this.currentPageSize; // Preserve page size
        this.paginator.length = this.totalDataCount;
      }

      this.isLoading = false;
    });
  }

  sortData(data: UserData[]): UserData[] {
    if (this.sortOrder === 'none') {
      return this.originalData; // Return data as is (no sorting)
    }
    return data.sort((a, b) => {
      const modifier = this.sortOrder === 'asc' ? 1 : -1;
      return (a.age - b.age) * modifier;
    });
  }

  toggleSortOrder() {
    if (this.sortOrder === 'none') {
      this.sortOrder = 'asc';
    } else if (this.sortOrder === 'asc') {
      this.sortOrder = 'desc';
    } else {
      this.sortOrder = 'none';
    }
    // Fetch data while retaining the current page index and size
    this.getDataFromApi(
      this.currentPageIndex * this.currentPageSize,
      this.currentPageSize
    );
  }

  onPageChange(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize; // Track the new page size
    const skip = this.currentPageIndex * this.currentPageSize;
    const limit = this.currentPageSize;
    this.getDataFromApi(skip, limit);
  }

  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value;
    this.dataSource.filterPredicate = (data: UserData, filter: string) => {
      return data.firstName.toLowerCase().includes(filter.toLowerCase());
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
