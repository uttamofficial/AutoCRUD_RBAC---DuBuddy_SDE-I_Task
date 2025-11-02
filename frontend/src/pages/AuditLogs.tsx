import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

interface AuditLog {
  timestamp: string;
  action: string;
  resourceType: string;
  resourceName: string;
  modelName?: string;
  recordId?: number;
  userId: number | null;
  userEmail: string;
  details: any;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    action: '',
    resourceType: '',
    limit: 100,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getAuditLogs(filters);
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'CREATE':
        return '#10b981';
      case 'READ':
        return '#3b82f6';
      case 'UPDATE':
        return '#f59e0b';
      case 'DELETE':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="audit-logs">
        <div className="loading">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="audit-logs">
      <div className="header">
        <h1>Audit Logs</h1>
        <p className="subtitle">Track all operations performed in the system</p>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="action">Action</label>
            <select
              id="action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="READ">READ</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="resourceType">Resource Type</label>
            <select
              id="resourceType"
              value={filters.resourceType}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="model">Model</option>
              <option value="record">Record</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="limit">Limit</label>
            <input
              id="limit"
              type="number"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              min="10"
              max="1000"
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleApplyFilters}>
          Apply Filters
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No audit logs found.</p>
        </div>
      ) : (
        <div className="logs-container">
          <div className="logs-header">
            <span>Showing {logs.length} log entries</span>
          </div>
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={index} className="log-item">
                <div className="log-header">
                  <span
                    className="log-action"
                    style={{ backgroundColor: getActionColor(log.action) }}
                  >
                    {log.action}
                  </span>
                  <span className="log-resource">{log.resourceType}</span>
                  <span className="log-timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="log-body">
                  <div className="log-row">
                    <strong>Resource:</strong> {log.resourceName}
                  </div>
                  {log.modelName && (
                    <div className="log-row">
                      <strong>Model:</strong> {log.modelName}
                    </div>
                  )}
                  {log.recordId && (
                    <div className="log-row">
                      <strong>Record ID:</strong> {log.recordId}
                    </div>
                  )}
                  <div className="log-row">
                    <strong>User:</strong> {log.userEmail}
                    {log.userId && ` (ID: ${log.userId})`}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="log-details">
                      <summary>View Details</summary>
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
