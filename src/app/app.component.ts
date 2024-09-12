import { Component } from '@angular/core';
import { PaginatedTableComponent } from './paginated-table/paginated-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PaginatedTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'paginated-table-assignment';
}
