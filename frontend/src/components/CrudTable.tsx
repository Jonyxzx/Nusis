import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Plus, PencilIcon, Trash2Icon } from 'lucide-react';
import { compareValues } from '@/lib/sortingUtils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface CrudTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  addButtonText?: string;
  itemsPerPage?: number;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

export function CrudTable<T extends { _id?: string }>({
  data,
  columns,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
  searchPlaceholder = 'Search...',
  addButtonText = 'Add New',
  itemsPerPage = 10,
  defaultSortColumn,
  defaultSortDirection = 'asc',
}: CrudTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    columns.some((column) => {
      const value = item[column.key as keyof T];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof T];
    const bValue = b[sortColumn as keyof T];

    const comparison = compareValues(aValue, bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-primary-foreground"
          />
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                {columns.map((column) => {
                  // Calculate column width based on number of columns
                  const dataColumnWidth = onEdit || onDelete ? `calc((100% - 6rem) / ${columns.length})` : `${100 / columns.length}%`;

                  return (
                    <TableHead
                      key={column.key as string}
                      className={`${column.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''} whitespace-nowrap`}
                      style={{ width: dataColumnWidth }}
                      onClick={() => column.sortable && handleSort(column.key as string)}
                    >
                      <div className="flex items-center gap-2 text-primary-foreground">
                        {column.header}
                        {column.sortable && sortColumn === column.key && (
                          <span className="text-xs text-primary-foreground">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
                {(onEdit || onDelete) && <TableHead className="w-24 text-primary-foreground whitespace-nowrap" style={{ width: '6rem' }}>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8 text-primary-foreground">
                    {searchTerm ? 'No items found matching your search.' : 'No items found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow
                    key={item._id || Math.random()}
                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => {
                      const dataColumnWidth = onEdit || onDelete ? `calc((100% - 6rem) / ${columns.length})` : `${100 / columns.length}%`;

                      return (
                        <TableCell
                          key={column.key as string}
                          className="text-primary-foreground overflow-hidden"
                          style={{ width: dataColumnWidth }}
                        >
                          <div className="truncate">
                            {column.render ? column.render(item) : (item[column.key as keyof T] as React.ReactNode)}
                          </div>
                        </TableCell>
                      );
                    })}
                    {(onEdit || onDelete) && (
                      <TableCell className="w-24" style={{ width: '6rem' }}>
                        <div className="flex items-center gap-1 text-blue-600">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <PencilIcon />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2Icon />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}