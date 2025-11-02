import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, auth, ModelDefinition } from '../utils/api';
import DataTable from '../components/DataTable';
import RecordModal from '../components/RecordModal';
import ToastContainer from '../components/ToastContainer';
import ConfirmDialog from '../components/ConfirmDialog';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelDefinition | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ 
    isOpen: boolean; 
    record: any; 
    showToast: ((msg: string, type: any) => void) | null;
  }>({
    isOpen: false,
    record: null,
    showToast: null
  });

  const currentUser = auth.getUser();
  const isAuthenticated = auth.isAuthenticated();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadRecords(selectedModel.name);
    }
  }, [selectedModel]);

  const loadModels = async () => {
    try {
      const response = await api.getModels();
      if (response.success && response.data) {
        setModels(response.data);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadRecords = async (modelName: string) => {
    setLoading(true);
    try {
      const response = await api.getRecords(modelName);
      if (response.success && response.data) {
        setRecords(response.data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to load records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (model: ModelDefinition) => {
    setSelectedModel(model);
    setRecords([]);
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setModalMode('edit');
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: any, showToast: (msg: string, type: any) => void) => {
    if (!selectedModel) return;
    
    setConfirmDelete({ 
      isOpen: true, 
      record, 
      showToast 
    });
  };

  const confirmDeleteRecord = async () => {
    const { record, showToast } = confirmDelete;
    setConfirmDelete({ isOpen: false, record: null, showToast: null });
    
    if (!selectedModel || !record || !showToast) return;

    try {
      const response = await api.deleteRecord(selectedModel.name, record.id);
      if (response.success) {
        showToast(`${selectedModel.name} deleted successfully`, 'success');
        await loadRecords(selectedModel.name);
      } else {
        showToast(response.message || 'Failed to delete record', 'error');
      }
    } catch (error) {
      showToast('Failed to delete record', 'error');
      console.error(error);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, record: null, showToast: null });
  };

  const handleSave = async (data: any, showToast: (msg: string, type: any) => void) => {
    if (!selectedModel) return;

    try {
      let response;
      if (modalMode === 'create') {
        response = await api.createRecord(selectedModel.name, data);
      } else {
        response = await api.updateRecord(selectedModel.name, editingRecord.id, data);
      }

      if (response.success) {
        showToast(
          `${selectedModel.name} ${modalMode === 'create' ? 'created' : 'updated'} successfully`,
          'success'
        );
        await loadRecords(selectedModel.name);
      } else {
        showToast(response.message || `Failed to ${modalMode} record`, 'error');
      }
    } catch (error) {
      showToast(`Failed to ${modalMode} record`, 'error');
      console.error(error);
    }
  };

  const handleGenerateToken = async (role: string, showToast: (msg: string, type: any) => void) => {
    try {
      const response: any = await api.getMockToken(
        Date.now(),
        `${role.toLowerCase()}@example.com`,
        role
      );

      if (response.success && response.token) {
        auth.setToken(response.token);
        auth.setUser({
          userId: Date.now(),
          email: `${role.toLowerCase()}@example.com`,
          role,
        });
        showToast(`Logged in as ${role}`, 'success');
        setShowTokenDialog(false);
        
        // Reload records to apply permissions
        if (selectedModel) {
          await loadRecords(selectedModel.name);
        }
      }
    } catch (error) {
      showToast('Failed to generate token', 'error');
      console.error(error);
    }
  };

  const handleLogout = () => {
    auth.clearToken();
    setRecords([]);
    navigate('/admin');
  };

  // Check permissions
  const canCreate = !selectedModel || !isAuthenticated || auth.hasPermission(selectedModel.rbac, 'create');
  const canRead = !selectedModel || !isAuthenticated || auth.hasPermission(selectedModel.rbac, 'read');
  const canUpdate = !selectedModel || !isAuthenticated || auth.hasPermission(selectedModel.rbac, 'update');
  const canDelete = !selectedModel || !isAuthenticated || auth.hasPermission(selectedModel.rbac, 'delete');

  return (
    <ToastContainer>
      {(showToast) => (
        <div className="admin-page">
          <ConfirmDialog
            isOpen={confirmDelete.isOpen}
            title="Delete Record"
            message={`Are you sure you want to delete this ${selectedModel?.name || 'record'}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={confirmDeleteRecord}
            onCancel={cancelDelete}
          />

          <div className="admin-header">
            <div>
              <h1>Data Management</h1>
              <p className="admin-subtitle">Manage your dynamic models and records</p>
            </div>
            <div className="admin-header-actions">
              {currentUser ? (
                <div className="user-info">
                  <span className="user-badge">{currentUser.role}</span>
                  <span className="user-email">{currentUser.email}</span>
                  <button className="btn-secondary btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setShowTokenDialog(true)}
                >
                  🔐 Login (Generate Token)
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={() => navigate('/models')}
              >
                ← Back to Models
              </button>
            </div>
          </div>

          {showTokenDialog && (
            <div className="modal-overlay" onClick={() => setShowTokenDialog(false)}>
              <div className="modal-content token-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Generate Test Token</h2>
                  <button className="modal-close" onClick={() => setShowTokenDialog(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>Select a role to generate a test authentication token:</p>
                  <div className="token-roles">
                    {['Admin', 'Manager', 'Viewer'].map((role) => (
                      <button
                        key={role}
                        className="btn-role"
                        onClick={() => handleGenerateToken(role, showToast)}
                      >
                        <span className="role-icon">
                          {role === 'Admin' ? '👑' : role === 'Manager' ? '👔' : '👁️'}
                        </span>
                        <span className="role-name">{role}</span>
                        <span className="role-desc">
                          {role === 'Admin' && 'Full access'}
                          {role === 'Manager' && 'Create, read, update'}
                          {role === 'Viewer' && 'Read only'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="admin-content">
            <div className="model-selector-section">
              <h2>Select Model</h2>
              {models.length === 0 ? (
                <div className="no-models">
                  <p>No models defined yet.</p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/models/new')}
                  >
                    Create Your First Model
                  </button>
                </div>
              ) : (
                <div className="model-selector-grid">
                  {models.map((model) => (
                    <button
                      key={model.name}
                      className={`model-selector-card ${
                        selectedModel?.name === model.name ? 'selected' : ''
                      }`}
                      onClick={() => handleModelSelect(model)}
                    >
                      <h3>{model.name}</h3>
                      <p>{model.fields.length} fields</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedModel && (
              <div className="records-section">
                <div className="records-header">
                  <h2>{selectedModel.name} Records</h2>
                  {canCreate && (
                    <button className="btn-primary" onClick={handleCreate}>
                      + Create New
                    </button>
                  )}
                  {!canCreate && isAuthenticated && (
                    <span className="permission-denied">
                      ⚠️ No create permission
                    </span>
                  )}
                </div>

                {!canRead && isAuthenticated ? (
                  <div className="permission-denied-box">
                    <p>⚠️ You don't have permission to view records</p>
                  </div>
                ) : loading ? (
                  <div className="loading-records">Loading records...</div>
                ) : (
                  <DataTable
                    model={selectedModel}
                    data={records}
                    onEdit={handleEdit}
                    onDelete={(record) => handleDelete(record, showToast)}
                    canEdit={canUpdate}
                    canDelete={canDelete}
                  />
                )}
              </div>
            )}
          </div>

          {selectedModel && (
            <RecordModal
              model={selectedModel}
              record={editingRecord}
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSave={(data) => handleSave(data, showToast)}
              mode={modalMode}
            />
          )}
        </div>
      )}
    </ToastContainer>
  );
};

export default Admin;
