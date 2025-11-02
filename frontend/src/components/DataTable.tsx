import React, { useState } from 'react';
import { ModelDefinition, FieldDefinition } from '../utils/api';

interface DataTableProps {
  model: ModelDefinition;
  data: any[];
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  model,
  data,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(fieldName);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const formatValue = (value: any, field: FieldDefinition): string => {
    if (value === null || value === undefined) return '-';
    
    switch (field.type) {
      case 'boolean':
        return value ? '✓' : '✕';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'json':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  };

  const displayFields = model.fields.filter(f => f.type !== 'relation');

  if (data.length === 0) {
    return (
      <div className="empty-table">
        <p>No records found</p>
        <p className="empty-table-subtitle">Create your first record to get started</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {displayFields.map((field) => (
                <th key={field.name} onClick={() => handleSort(field.name)}>
                  <div className="th-content">
                    <span>{field.name}</span>
                    {sortField === field.name && (
                      <span className="sort-indicator">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(canEdit || canDelete) && <th className="actions-column">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record, index) => (
              <tr key={record.id || index}>
                {displayFields.map((field) => (
                  <td key={field.name}>
                    {formatValue(record[field.name], field)}
                  </td>
                ))}
                {(canEdit || canDelete) && (
                  <td className="actions-cell">
                    {canEdit && (
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => onEdit(record)}
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn-icon btn-delete-icon"
                        onClick={() => onDelete(record)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({data.length} records)
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
