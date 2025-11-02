import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ModelDefinition } from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';

const ModelsList: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; modelName: string }>({
    isOpen: false,
    modelName: ''
  });
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getModels();
      if (response.success && response.data) {
        setModels(response.data);
      } else {
        setError(response.message || 'Failed to load models');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelName: string) => {
    setConfirmDelete({ isOpen: true, modelName });
  };

  const confirmDeleteModel = async () => {
    const modelName = confirmDelete.modelName;
    setConfirmDelete({ isOpen: false, modelName: '' });

    try {
      const response = await api.deleteModel(modelName);
      if (response.success) {
        await loadModels();
      } else {
        alert(response.message || 'Failed to delete model');
      }
    } catch (err) {
      alert('Failed to delete model');
      console.error(err);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, modelName: '' });
  };

  const toggleExpandModel = (modelName: string) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  const handleExport = (model: ModelDefinition) => {
    api.exportModel(model);
  };

  const handleImport = async () => {
    try {
      const model = await api.importModel();
      const response = await api.saveModel(model);
      if (response.success) {
        alert('Model imported successfully!');
        await loadModels();
      } else {
        alert(response.message || 'Failed to import model');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to import model');
      console.error(err);
    }
  };

  const handleReload = async () => {
    try {
      const response = await api.reloadModels();
      if (response.success) {
        alert('Models reloaded successfully!');
        await loadModels();
      } else {
        alert(response.message || 'Failed to reload models');
      }
    } catch (err) {
      alert('Failed to reload models');
      console.error(err);
    }
  };

  const handleViewVersions = async (modelName: string) => {
    try {
      console.log('Fetching versions for model:', modelName);
      const response = await api.getModelVersions(modelName);
      console.log('Response:', response);
      if (response.success) {
        // Always show the modal, even if there are no versions
        setVersions(response.data || []);
        setShowVersions(modelName);
      } else {
        alert(response.message || 'Failed to load versions');
      }
    } catch (err) {
      alert('Failed to load versions: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error loading versions:', err);
    }
  };

  if (loading) {
    return (
      <div className="models-list">
        <div className="loading">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="models-list">
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Model"
        message={`Are you sure you want to delete the model "${confirmDelete.modelName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDeleteModel}
        onCancel={cancelDelete}
      />

      <div className="header">
        <h1>Model Definitions</h1>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={handleImport}>
            📥 Import Model
          </button>
          <button className="btn-secondary" onClick={handleReload}>
            🔄 Reload Models
          </button>
          <button className="btn-secondary" onClick={() => navigate('/admin')}>
            📊 Manage Data
          </button>
          <button className="btn-primary" onClick={() => navigate('/models/new')}>
            + Create New Model
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showVersions && (
        <div className="modal-overlay" onClick={() => setShowVersions(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Version History: {showVersions}</h2>
              <button className="btn-close" onClick={() => setShowVersions(null)}>×</button>
            </div>
            <div className="modal-body">
              {versions.length === 0 ? (
                <div className="empty-state">
                  <p style={{ textAlign: 'center', color: '#ffffff', fontSize: '1rem' }}>
                    📜 No version history available yet.
                  </p>
                  <p style={{ textAlign: 'center', color: '#e2e8f0', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Versions are created automatically when you update a model.
                  </p>
                </div>
              ) : (
                <div className="versions-list">
                  {versions.map((v) => (
                    <div key={v.version} className="version-item">
                      <div className="version-header">
                        <strong>Version {v.version}</strong>
                        <span className="version-date">{new Date(v.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="version-meta">
                        <span>Fields: {v.fieldCount}</span>
                        {v.rbacRoles && <span>Roles: {v.rbacRoles.join(', ')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {models.length === 0 ? (
        <div className="empty-state">
          <p>No models defined yet.</p>
          <button className="btn-primary" onClick={() => navigate('/models/new')}>
            Create Your First Model
          </button>
        </div>
      ) : (
        <div className="models-grid">
          {models.map((model) => (
            <div key={model.name} className="model-card">
              <div className="model-card-header">
                <h3>{model.name}</h3>
                <div className="model-actions">
                  <button
                    className="btn-icon"
                    onClick={() => {
                      console.log('View versions clicked for:', model.name);
                      handleViewVersions(model.name);
                    }}
                    title="View versions"
                  >
                    📜
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleExport(model)}
                    title="Export model"
                  >
                    📤
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(model.name)}
                    title="Delete model"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="model-card-body">
                <p className="field-count">
                  <strong>{model.fields.length}</strong> fields
                </p>
                <div className="field-list">
                  {(expandedModels.has(model.name) 
                    ? model.fields 
                    : model.fields.slice(0, 5)
                  ).map((field) => (
                    <span key={field.name} className="field-badge">
                      {field.name} ({field.type})
                    </span>
                  ))}
                  {model.fields.length > 5 && (
                    <button 
                      className="field-badge field-badge-more"
                      onClick={() => toggleExpandModel(model.name)}
                    >
                      {expandedModels.has(model.name) 
                        ? '− Show less' 
                        : `+${model.fields.length - 5} more`
                      }
                    </button>
                  )}
                </div>
                {model.ownerField && (
                  <p className="owner-field">
                    <strong>Owner Field:</strong> {model.ownerField}
                  </p>
                )}
                {model.rbac && (
                  <div className="rbac-info">
                    <strong>Roles:</strong>{' '}
                    {Object.keys(model.rbac).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelsList;
