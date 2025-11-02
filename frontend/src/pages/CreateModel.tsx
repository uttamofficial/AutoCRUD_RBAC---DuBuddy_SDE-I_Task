import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, FieldDefinition, ModelDefinition } from '../utils/api';
import FieldRow from '../components/FieldRow';
import RBACConfig from '../components/RBACConfig';

const CreateModel: React.FC = () => {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState('');
  const [ownerField, setOwnerField] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([
    { name: 'id', type: 'number', required: true, unique: true },
  ]);
  const [rbacConfig, setRbacConfig] = useState<{ [role: string]: string[] }>({
    Admin: ['all'],
    Manager: ['create', 'read', 'update'],
    Viewer: ['read'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addField = () => {
    setFields([
      ...fields,
      { name: '', type: 'string', required: false, unique: false },
    ]);
  };

  const updateField = (index: number, updatedField: FieldDefinition) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateRbacRole = (role: string, permissions: string[]) => {
    setRbacConfig({
      ...rbacConfig,
      [role]: permissions,
    });
  };

  const validateForm = (): string | null => {
    if (!modelName.trim()) {
      return 'Model name is required';
    }

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(modelName)) {
      return 'Model name must start with an uppercase letter and contain only alphanumeric characters';
    }

    if (fields.length === 0) {
      return 'At least one field is required';
    }

    for (const field of fields) {
      if (!field.name.trim()) {
        return 'All fields must have a name';
      }
      if (!/^[a-z][a-zA-Z0-9]*$/.test(field.name)) {
        return `Field "${field.name}" must start with a lowercase letter and contain only alphanumeric characters`;
      }
      if (field.type === 'relation' && !field.relatedModel) {
        return `Field "${field.name}" is a relation and must specify a related model`;
      }
      if (field.type === 'relation' && !field.relationType) {
        return `Field "${field.name}" is a relation and must specify a relation type`;
      }
    }

    const fieldNames = fields.map((f) => f.name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      return `Duplicate field names: ${duplicates.join(', ')}`;
    }

    if (ownerField && !fieldNames.includes(ownerField)) {
      return `Owner field "${ownerField}" does not exist in the field list`;
    }

    return null;
  };

  const handlePublish = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const model: ModelDefinition = {
      name: modelName,
      fields,
      rbac: rbacConfig,
    };

    if (ownerField.trim()) {
      model.ownerField = ownerField;
    }

    setLoading(true);

    try {
      // First validate the model
      const validateResponse = await api.validateModel(model);
      if (!validateResponse.success) {
        setError(validateResponse.message || 'Model validation failed');
        setLoading(false);
        return;
      }

      // Then save it
      const saveResponse = await api.saveModel(model);
      if (saveResponse.success) {
        setSuccess(`Model "${modelName}" has been successfully created and published!`);
        setTimeout(() => {
          navigate('/models');
        }, 2000);
      } else {
        setError(saveResponse.message || 'Failed to save model');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-model">
      <div className="header">
        <h1>Create New Model</h1>
        <button className="btn-secondary" onClick={() => navigate('/models')}>
          ← Back to Models
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <strong>Success!</strong> {success}
        </div>
      )}

      <div className="form-section">
        <h2>Model Information</h2>
        <div className="form-group">
          <label htmlFor="modelName">
            Model Name <span className="required">*</span>
          </label>
          <input
            id="modelName"
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., Employee, Product, Order"
            className="form-input"
          />
          <small>Must start with an uppercase letter</small>
        </div>

        <div className="form-group">
          <label htmlFor="ownerField">
            Owner Field <span className="optional">(optional)</span>
          </label>
          <input
            id="ownerField"
            type="text"
            value={ownerField}
            onChange={(e) => setOwnerField(e.target.value)}
            placeholder="e.g., userId, ownerId"
            className="form-input"
          />
          <small>Field name that identifies the owner of a record</small>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h2>Fields</h2>
          <button className="btn-primary" onClick={addField}>
            + Add Field
          </button>
        </div>

        <div className="fields-container">
          {fields.map((field, index) => (
            <FieldRow
              key={index}
              field={field}
              onUpdate={(updatedField: FieldDefinition) => updateField(index, updatedField)}
              onRemove={() => removeField(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>RBAC Configuration</h2>
        <p className="section-description">
          Configure permissions for each role. Users with these roles will have
          the specified access to this model.
        </p>
        <RBACConfig config={rbacConfig} onUpdate={updateRbacRole} />
      </div>

      <div className="form-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate('/models')}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="btn-primary btn-large"
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? 'Publishing...' : '✓ Publish Model'}
        </button>
      </div>
    </div>
  );
};

export default CreateModel;
