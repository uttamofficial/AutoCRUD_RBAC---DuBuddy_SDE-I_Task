import React from 'react';
import { FieldDefinition } from '../utils/api';

interface FieldRowProps {
  field: FieldDefinition;
  onUpdate: (field: FieldDefinition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ field, onUpdate, onRemove, canRemove }) => {
  const handleChange = (key: keyof FieldDefinition, value: any) => {
    onUpdate({ ...field, [key]: value });
  };

  const fieldTypes = ['string', 'number', 'boolean', 'date', 'json', 'relation'];
  const relationTypes = ['one-to-one', 'one-to-many', 'many-to-many'];

  return (
    <div className="field-row">
      <div className="field-row-main">
        <div className="form-group compact">
          <label>Field Name</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., firstName, age"
            className="form-input"
          />
        </div>

        <div className="form-group compact">
          <label>Type</label>
          <select
            value={field.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="form-select"
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {field.type === 'relation' && (
          <>
            <div className="form-group compact">
              <label>Relation Type</label>
              <select
                value={field.relationType || ''}
                onChange={(e) => handleChange('relationType', e.target.value)}
                className="form-select"
              >
                <option value="">Select...</option>
                {relationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group compact">
              <label>Related Model</label>
              <input
                type="text"
                value={field.relatedModel || ''}
                onChange={(e) => handleChange('relatedModel', e.target.value)}
                placeholder="e.g., User, Department"
                className="form-input"
              />
            </div>
          </>
        )}

        <div className="field-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
            <span>Required</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={field.unique || false}
              onChange={(e) => handleChange('unique', e.target.checked)}
            />
            <span>Unique</span>
          </label>
        </div>

        <button
          className="btn-remove"
          onClick={onRemove}
          disabled={!canRemove}
          title={canRemove ? 'Remove field' : 'At least one field is required'}
        >
          🗑️
        </button>
      </div>

      {field.type !== 'relation' && (
        <div className="field-row-extra">
          <div className="form-group compact">
            <label>Default Value</label>
            <input
              type="text"
              value={field.default || ''}
              onChange={(e) => handleChange('default', e.target.value)}
              placeholder="Optional default value"
              className="form-input"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldRow;
