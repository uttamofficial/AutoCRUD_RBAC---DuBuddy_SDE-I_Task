# Admin Interface - Data Management

Complete CRUD interface for managing dynamic data with role-based access control.

## Features

✅ **Model Selection** - Browse and select models to manage
✅ **Data Table** - View all records with sorting and pagination
✅ **Create Records** - Dynamic form based on model fields
✅ **Edit Records** - Update existing records
✅ **Delete Records** - Remove records with confirmation
✅ **Role-Based UI** - Buttons hidden based on permissions
✅ **Authentication** - JWT token-based authentication
✅ **Toast Notifications** - Success/error messages
✅ **Field Validation** - Client-side validation
✅ **Ownership Filtering** - Records filtered by owner (if configured)

## Access the Admin Interface

Navigate to: [http://localhost:5173/admin](http://localhost:5173/admin)

## Authentication

### Generate Test Token

1. Click "🔐 Login (Generate Token)" button
2. Select a role:
   - **Admin** (👑) - Full access to all operations
   - **Manager** (👔) - Create, read, update
   - **Viewer** (👁️) - Read only

The token will be stored in localStorage and included in all API requests.

### Logout

Click the "Logout" button to clear your token and user session.

## Using the Admin Interface

### 1. Select a Model

- View all available models in the "Select Model" section
- Click on a model card to load its records
- Selected model is highlighted in purple

### 2. View Records

- All records are displayed in a sortable table
- Click column headers to sort (ascending/descending)
- Navigate pages if more than 10 records exist
- Empty state shown when no records exist

### 3. Create a Record

**Requirements:** Must have `create` permission

1. Click "+ Create New" button
2. Fill in the dynamic form
   - Required fields marked with *
   - Field types automatically rendered (text, number, date, boolean, json)
   - Validation applied on submit
3. Click "Save" to create
4. Success toast shown on completion

### 4. Edit a Record

**Requirements:** Must have `update` permission

1. Click the edit icon (✎) on a record row
2. Modal opens with pre-filled form
3. Modify fields as needed
4. Click "Save" to update
5. Success toast shown on completion

### 5. Delete a Record

**Requirements:** Must have `delete` permission

1. Click the delete icon (🗑️) on a record row
2. Confirm deletion in the dialog
3. Record removed from table
4. Success toast shown on completion

## Role-Based Permissions

### Permission Checks

The UI automatically checks permissions and:
- Hides create button if no `create` permission
- Hides edit icon if no `update` permission
- Hides delete icon if no `delete` permission
- Shows warning message for insufficient permissions

### Ownership Rules

If a model has an `ownerField` configured:
- **Non-Admin users** only see their own records
- **Admin users** see all records
- Ownership is auto-assigned on create

### Example Scenarios

#### Admin Role
```
Permissions: ["all"]
Can: View all records, create, edit, delete any record
```

#### Manager Role
```
Permissions: ["create", "read", "update"]
Can: View own records, create new, edit own records
Cannot: Delete records, see other users' records
```

#### Viewer Role
```
Permissions: ["read"]
Can: View own records
Cannot: Create, edit, or delete
```

## Components

### Admin Page (`/admin`)

Main interface for data management.

**State:**
- Models list
- Selected model
- Records data
- Modal state (open/close, create/edit)
- Authentication status

**Functions:**
- `loadModels()` - Fetch all models
- `loadRecords()` - Fetch records for selected model
- `handleCreate()` - Open create modal
- `handleEdit()` - Open edit modal
- `handleDelete()` - Delete record with confirmation
- `handleSave()` - Create or update record
- `handleGenerateToken()` - Generate test auth token
- `handleLogout()` - Clear authentication

### DataTable Component

Generic table for displaying records.

**Props:**
```typescript
{
  model: ModelDefinition;      // Model schema
  data: any[];                 // Records to display
  onEdit: (record) => void;    // Edit handler
  onDelete: (record) => void;  // Delete handler
  canEdit: boolean;            // Show edit button
  canDelete: boolean;          // Show delete button
}
```

**Features:**
- Column sorting (click headers)
- Pagination (10 records per page)
- Type-specific formatting (dates, booleans, json)
- Empty state
- Responsive design

### RecordModal Component

Dynamic form for creating/editing records.

**Props:**
```typescript
{
  model: ModelDefinition;           // Model schema
  record: any | null;               // Record to edit (null for create)
  isOpen: boolean;                  // Modal visibility
  onClose: () => void;              // Close handler
  onSave: (data) => Promise<void>; // Save handler
  mode: 'create' | 'edit';         // Operation mode
}
```

**Features:**
- Dynamic field rendering based on model
- Field type-specific inputs
- Client-side validation
- Error messages
- Loading states

### Toast Notification System

**Components:**
- `Toast` - Individual toast message
- `ToastContainer` - Container managing multiple toasts

**Types:**
- `success` - Green, checkmark icon
- `error` - Red, X icon
- `info` - Blue, info icon
- `warning` - Yellow, warning icon

**Usage:**
```typescript
showToast('Record created successfully', 'success');
showToast('Failed to delete record', 'error');
```

## API Integration

### Authentication Headers

All CRUD requests include JWT token:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### CRUD Endpoints

```typescript
// Get all records
GET /api/crud/:modelName

// Get single record
GET /api/crud/:modelName/:id

// Create record
POST /api/crud/:modelName
Body: { field1: value1, field2: value2, ... }

// Update record
PUT /api/crud/:modelName/:id
Body: { field1: value1, field2: value2, ... }

// Delete record
DELETE /api/crud/:modelName/:id
```

### Response Format

```typescript
{
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
```

## Field Type Handling

### String
- Rendered as: `<input type="text">`
- Validation: None
- Display: As-is

### Number
- Rendered as: `<input type="number">`
- Validation: Must be numeric
- Display: As-is

### Boolean
- Rendered as: `<input type="checkbox">`
- Validation: None
- Display: ✓ (true) or ✕ (false)

### Date
- Rendered as: `<input type="date">`
- Validation: Must be valid date
- Display: Localized date string

### JSON
- Rendered as: `<textarea>`
- Validation: Must be valid JSON
- Display: JSON string
- Input: Pretty-printed JSON

### Relation
- Not rendered in forms (future enhancement)
- Not displayed in tables

## Styling

All components use the global CSS from `App.css`.

### Key Classes

- `.admin-page` - Main container
- `.data-table` - Table styling
- `.modal-overlay` - Modal backdrop
- `.toast` - Notification styling
- `.user-badge` - Role indicator

## Testing the Admin Interface

### Step 1: Create Test Data

```bash
# Generate Admin token
curl -X POST http://localhost:4000/api/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "email": "admin@test.com", "role": "Admin"}'
```

### Step 2: Test CRUD Operations

1. Login as Admin
2. Select "Product" model
3. Create a new product
4. Edit the product
5. Delete the product

### Step 3: Test Permissions

1. Logout
2. Login as Viewer
3. Try to create (button hidden)
4. Try to edit (icon hidden)
5. Try to delete (icon hidden)

### Step 4: Test Ownership

1. Login as Manager (userId: 100)
2. Create a record (ownerId auto-assigned to 100)
3. Logout
4. Login as different Manager (userId: 200)
5. Verify you don't see the first manager's record

## Troubleshooting

### Records Not Loading

**Symptom:** Empty table or loading forever

**Causes:**
1. Backend not running
2. No authentication token
3. No read permission
4. Model has no records

**Solutions:**
- Check backend: `curl http://localhost:4000/health`
- Generate token via UI
- Login with appropriate role
- Create some test records

### Cannot Create/Edit Records

**Symptom:** Buttons hidden or grayed out

**Causes:**
1. Insufficient permissions
2. Not authenticated

**Solutions:**
- Check current role's permissions in model definition
- Login with Admin role for full access

### Form Validation Errors

**Symptom:** Cannot submit form

**Causes:**
1. Required fields empty
2. Invalid data type
3. Invalid JSON format

**Solutions:**
- Fill all required fields (marked with *)
- Enter correct type (number for number fields)
- Validate JSON format

### Modal Won't Close

**Symptom:** Modal stuck open

**Solution:**
- Click outside the modal
- Click the X button
- Press ESC key (if implemented)
- Refresh page

## Future Enhancements

- [ ] Bulk operations (select multiple, delete all)
- [ ] Advanced filtering (search, date range)
- [ ] Export data (CSV, JSON)
- [ ] Import data (CSV, JSON)
- [ ] Inline editing (click cell to edit)
- [ ] Column visibility toggle
- [ ] Custom column order
- [ ] Relation field support
- [ ] File upload fields
- [ ] Rich text editor for text fields
- [ ] Advanced validation rules
- [ ] Real-time updates (WebSocket)
- [ ] Audit log viewer
- [ ] Batch import wizard

## Performance Tips

### Large Datasets

- Pagination limits to 10 records per page
- Only visible data is rendered
- Sorting happens client-side (consider server-side for 1000+ records)

### Frequent Updates

- Use toast notifications instead of alerts
- Auto-refresh records after CRUD operations
- Optimistic UI updates (future)

## Security Considerations

### Client-Side

- Tokens stored in localStorage (use httpOnly cookies in production)
- Permissions checked in UI (but enforced in backend)
- Form validation (backend validation still required)

### Backend

- RBAC middleware enforces permissions
- Ownership validation on server
- JWT signature verification
- SQL injection protection (use Prisma)

## License

MIT
