import React, { useState, useEffect } from 'react';
import { ModelDefinition, FieldDefinition } from '../utils/api';

interface RecordModalProps {
  model: ModelDefinition;
  record: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  mode: 'create' | 'edit';
}

const RecordModal: React.FC<RecordModalProps> = ({
  model,
  record,
  isOpen,
  onClose,
  onSave,
  mode,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && record) {
        setFormData({ ...record });
      } else {
        // Initialize with default values
        const initialData: any = {};
        model.fields.forEach((field) => {
          if (field.default !== undefined) {
            initialData[field.name] = field.default;
          } else if (field.type === 'boolean') {
            initialData[field.name] = false;
          } else {
            initialData[field.name] = '';
          }
        });
        setFormData(initialData);
      }
      setErrors({});
    }
  }, [isOpen, mode, record, model]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    model.fields.forEach((field) => {
      // Skip relation fields
      if (field.type === 'relation') return;

      const value = formData[field.name];

      // Check required fields
      if (field.required && (value === '' || value === null || value === undefined)) {
        newErrors[field.name] = `${field.name} is required`;
      }

      // Type-specific validation
      if (value !== '' && value !== null && value !== undefined) {
        switch (field.type) {
          case 'number':
            if (isNaN(Number(value))) {
              newErrors[field.name] = `${field.name} must be a number`;
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              newErrors[field.name] = `${field.name} must be a valid date`;
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert types before submitting
      const processedData: any = {};
      model.fields.forEach((field) => {
        if (field.type === 'relation') return;

        const value = formData[field.name];
        
        if (value === '' || value === null || value === undefined) {
          if (!field.required) {
            processedData[field.name] = null;
          }
          return;
        }

        switch (field.type) {
          case 'number':
            processedData[field.name] = Number(value);
            break;
          case 'boolean':
            processedData[field.name] = Boolean(value);
            break;
          case 'json':
            try {
              processedData[field.name] = typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
              processedData[field.name] = value;
            }
            break;
          default:
            processedData[field.name] = value;
        }
      });

      await onSave(processedData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldDefinition) => {
    // Skip relation fields
    if (field.type === 'relation') return null;

    const value = formData[field.name] ?? '';
    const error = errors[field.name];

    return (
      <div key={field.name} className="form-group">
        <label htmlFor={field.name}>
          {field.name}
          {field.required && <span className="required">*</span>}
        </label>
        
        {field.type === 'boolean' ? (
          <label className="checkbox-label">
            <input
              type="checkbox"
              id={field.name}
              checked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            />
            <span>Yes</span>
          </label>
        ) : field.type === 'json' ? (
          <textarea
            id={field.name}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`form-input ${error ? 'input-error' : ''}`}
            rows={4}
            placeholder='{"key": "value"}'
          />
        ) : field.type === 'date' ? (
          <input
            type="date"
            id={field.name}
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`form-input ${error ? 'input-error' : ''}`}
          />
        ) : field.type === 'number' ? (
          <input
            type="number"
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`form-input ${error ? 'input-error' : ''}`}
            placeholder={`Enter ${field.name}`}
          />
        ) : (
          <input
            type="text"
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`form-input ${error ? 'input-error' : ''}`}
            placeholder={`Enter ${field.name}`}
          />
        )}
        
        {error && <span className="field-error">{error}</span>}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Create New' : 'Edit'} {model.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {model.fields
              .filter(f => f.type !== 'relation')
              .map((field) => renderField(field))}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;
