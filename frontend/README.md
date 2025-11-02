# AutoCRUD-RBAC Frontend

React-based UI for creating and managing dynamic model definitions with RBAC configuration.

## Features

✅ **Model List View** - Browse all existing models with their details
✅ **Model Creation Form** - Interactive form to define new models
✅ **Dynamic Field Management** - Add/remove fields with different types
✅ **RBAC Configuration** - Configure role-based permissions visually
✅ **Form Validation** - Client-side validation before submission
✅ **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend server running on `http://localhost:4000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── FieldRow.tsx    # Field row component
│   │   └── RBACConfig.tsx  # RBAC configuration component
│   ├── pages/              # Page components
│   │   ├── ModelsList.tsx  # Models list page
│   │   └── CreateModel.tsx # Model creation page
│   ├── utils/              # Utility functions
│   │   └── api.ts          # API client and types
│   ├── App.tsx             # Main app component with routing
│   ├── App.css             # Global styles
│   └── main.tsx            # Entry point
├── test-ui.sh              # API integration test script
└── package.json            # Dependencies
```

## Pages

### Models List (`/models`)

Displays all existing models with:
- Model name
- Number of fields
- Field preview (first 5 fields)
- Owner field (if configured)
- RBAC roles
- Delete button

### Create Model (`/models/new`)

Form to create a new model with:

#### 1. Model Information
- **Model Name** (required) - Must start with uppercase letter (PascalCase)
- **Owner Field** (optional) - Field name for ownership tracking

#### 2. Fields
- **Add/Remove** fields dynamically
- Configure for each field:
  - **Name** - Must start with lowercase letter (camelCase)
  - **Type** - string, number, boolean, date, json, relation
  - **Required** - Mark as required field
  - **Unique** - Mark as unique constraint
  - **Default Value** - Optional default value
  - **Relation Config** (if type is relation):
    - Relation Type: one-to-one, one-to-many, many-to-many
    - Related Model name

#### 3. RBAC Configuration
Configure permissions for predefined roles:
- **Admin** - Full access by default
- **Manager** - Create, read, update by default
- **Viewer** - Read-only by default

Each role can have:
- **All permissions** - Complete access
- **Individual permissions** - create, read, update, delete

## Components

### FieldRow Component

Handles individual field configuration:
```tsx
<FieldRow
  field={fieldDefinition}
  onUpdate={(field) => handleUpdate(field)}
  onRemove={() => handleRemove()}
  canRemove={true}
/>
```

### RBACConfig Component

Manages role-based permissions:
```tsx
<RBACConfig
  config={rbacConfig}
  onUpdate={(role, permissions) => updateRole(role, permissions)}
/>
```

## API Integration

The frontend communicates with the backend API:

### Endpoints Used

- `GET /api/models` - List all models
- `GET /api/models/:name` - Get specific model
- `POST /api/models/save` - Save/update model
- `POST /api/models/validate` - Validate model definition
- `DELETE /api/models/:name` - Delete model

### API Client

The `src/utils/api.ts` file provides a typed API client:

```typescript
import { api, ModelDefinition } from './utils/api';

// Get all models
const response = await api.getModels();

// Save a model
await api.saveModel(modelDefinition);

// Delete a model
await api.deleteModel('Product');
```

## Form Validation

### Client-side Validation

Before submission, the form validates:
- Model name format (PascalCase)
- Field name format (camelCase)
- Required fields are filled
- No duplicate field names
- Owner field exists in field list
- Relation fields have proper configuration

### Server-side Validation

The backend performs additional validation using Zod schemas.

## Styling

The app uses a modern, clean design with:
- Purple gradient header
- Card-based layouts
- Hover effects and transitions
- Responsive grid system
- Form styling with focus states
- Success/error message styling

### Color Palette

- Primary: `#667eea` (purple-blue)
- Secondary: `#764ba2` (dark purple)
- Success: `#10b981` (green)
- Error: `#dc2626` (red)
- Background: `#f5f7fa` (light gray)
- Text: `#2c3e50` (dark gray)

## Testing

### Automated Testing

Run the test script to verify API integration:

```bash
./test-ui.sh
```

This script:
1. Checks backend health
2. Lists existing models
3. Creates test models (Product, Customer)
4. Validates model persistence
5. Verifies RBAC configuration

### Manual Testing

1. Start the backend server
2. Start the frontend dev server
3. Open http://localhost:5173
4. Test the following flows:

#### Create a Model
- Click "Create New Model"
- Enter model name: "Order"
- Add fields: orderId (number), customerEmail (string), total (number)
- Set owner field: "ownerId"
- Configure RBAC permissions
- Click "Publish Model"
- Verify success message
- Check model appears in list

#### View Models
- Navigate to /models
- Verify all models are displayed
- Check field previews
- Verify RBAC roles shown

#### Delete a Model
- Click delete button (🗑️) on a model card
- Confirm deletion
- Verify model is removed from list

## Troubleshooting

### Backend Not Reachable

**Symptom:** "Failed to connect to server" error

**Solution:**
1. Check backend is running: `curl http://localhost:4000/health`
2. Ensure CORS is enabled in backend
3. Verify API_BASE_URL in `src/utils/api.ts`

### TypeScript Errors

**Symptom:** Type errors in VS Code

**Solution:**
1. Restart TypeScript server: Cmd+Shift+P → "Restart TS Server"
2. Reinstall dependencies: `rm -rf node_modules && npm install`

### Validation Errors

**Symptom:** Form submission fails with validation errors

**Solution:**
1. Check model name is PascalCase (e.g., "Product", not "product")
2. Check field names are camelCase (e.g., "firstName", not "FirstName")
3. Ensure relation fields have relationType and relatedModel
4. Verify owner field exists in the fields list

### Frontend Not Starting

**Symptom:** `npm run dev` fails

**Solution:**
1. Delete node_modules and package-lock.json
2. Run `npm install`
3. Check port 5173 is not in use: `lsof -ti:5173`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements

- [ ] Model editing (update existing models)
- [ ] Field reordering (drag and drop)
- [ ] Import/export models (JSON)
- [ ] Model templates
- [ ] Field type validation rules
- [ ] Custom role creation
- [ ] Model versioning
- [ ] Dark mode
- [ ] Advanced search/filter
- [ ] Model relationships visualization

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
