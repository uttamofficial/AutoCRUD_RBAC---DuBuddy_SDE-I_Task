# 🚀 DuBuddy - Dynamic CRUD with RBAC

> **A modern, futuristic full-stack application with dynamic model definitions, role-based access control, and real-time audit logging.**

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## ✨ Features

### 🎯 **Dynamic Model Management**
- 📝 Create custom data models on the fly
- 🔄 Automatic versioning with complete history tracking
- 📤 Export/Import models with validation
- 🔥 Hot reload functionality for instant updates

### 🔐 **Advanced RBAC System**
- 👥 Role-based permissions (Admin, Manager, Viewer)
- 🛡️ Fine-grained access control (Create, Read, Update, Delete)
- 👤 Ownership-based record filtering
- 🔒 JWT authentication with secure middleware

### 📊 **Powerful Data Management**
- ⚡ Full CRUD operations with type safety
- 🗂️ Multi-field support (String, Number, Boolean, Date)
- ✅ Field validation (Required, Unique, Default values)
- 🔍 Advanced filtering and search

### 📜 **Comprehensive Audit Logging**
- 🕐 Timestamp-based activity tracking
- 👁️ Monitor all model and record operations
- 🎯 Filter by date, action, and resource type
- 📈 Detailed change tracking with before/after states

### 🎨 **Modern UI/UX**
- 🌌 Futuristic dark purple theme with glassmorphism
- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- 🎭 Custom confirmation dialogs and modals
- 🌈 Beautiful gradient effects and shadows

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Language:** TypeScript 5.5
- **ORM:** Prisma 5.22
- **Database:** SQLite (Development)
- **Authentication:** JWT + bcryptjs

### **Frontend**
- **Framework:** React 18.2
- **Build Tool:** Vite 5.0
- **Router:** React Router 7.9
- **Language:** TypeScript 4.9
- **Styling:** Custom CSS with modern features

---

## 🚀 Quick Start

### **Prerequisites**
```bash
node >= 18.0.0
npm >= 9.0.0
```

### **1️⃣ Installation**

```bash
# Clone the repository
git clone <repository-url>
cd DuBuddy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **2️⃣ Database Setup**

```bash
# Navigate to backend
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### **3️⃣ Environment Configuration**

Create `.env` file in the `backend` directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
```

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:4000/api
```

### **4️⃣ Launch Application**

```bash
# Terminal 1 - Start Backend (from backend directory)
cd backend
npm start

# Terminal 2 - Start Frontend (from frontend directory)
cd frontend
npm run dev
```

🎉 **Application is now running!**
- 🌐 Frontend: `http://localhost:5173`
- 🔧 Backend API: `http://localhost:4000`

---

## 📁 Project Structure

```
DuBuddy/
│
├── 📂 backend/                    # Backend application
│   ├── 📂 src/
│   │   ├── 📂 middleware/        # Authentication & RBAC middleware
│   │   ├── 📂 routes/            # API routes (models, CRUD, auth, audit)
│   │   ├── 📂 utils/             # Helper utilities
│   │   ├── 📄 index.ts           # Express server entry point
│   │   └── 📄 prisma.ts          # Prisma client instance
│   ├── 📂 prisma/
│   │   ├── 📄 schema.prisma      # Database schema
│   │   └── 📄 dev.db             # SQLite database file
│   ├── 📂 models/                # Dynamic model definitions (JSON)
│   │   └── 📂 versions/          # Model version history
│   ├── 📂 audit-logs/            # Timestamped audit logs (JSON)
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📂 frontend/                   # Frontend application
│   ├── 📂 src/
│   │   ├── 📂 components/        # Reusable components (ConfirmDialog, etc.)
│   │   ├── 📂 pages/             # Page components (ModelsList, CreateModel, etc.)
│   │   ├── 📂 utils/             # API client & utilities
│   │   ├── 📄 App.tsx            # Main app component
│   │   ├── 📄 App.css            # Global styles (2100+ lines)
│   │   └── 📄 main.tsx           # React entry point
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   └── 📄 tsconfig.json
│
├── 📄 .gitignore
└── 📄 README.md                   # You are here! 👋

```

---

## 🚀 How to Run the Application

### **Step-by-Step Guide**

#### **1. Start the Backend Server** 🖥️

```bash
# Navigate to backend directory
cd backend

# Start the Express server
npm start
```

The backend server will start on `http://localhost:4000`

**What happens during startup:**
- ✅ Loads environment variables from `.env`
- ✅ Connects to SQLite database via Prisma
- ✅ Reads all model definitions from `backend/models/` directory
- ✅ Registers dynamic CRUD routes for each model
- ✅ Starts Express server with CORS and middleware
- ✅ Creates audit-logs directory if not exists

#### **2. Start the Frontend Development Server** 🎨

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Start Vite dev server
npm run dev
```

The frontend will start on `http://localhost:5173`

**What happens during startup:**
- ✅ Vite compiles React + TypeScript
- ✅ Hot Module Replacement (HMR) enabled
- ✅ Proxy configured to backend API
- ✅ Opens browser automatically (optional)

#### **3. Access the Application** 🌐

Open your browser and visit:
```
http://localhost:5173
```

**Default Routes:**
- `/` - Home page (redirects to models)
- `/models` - View all models
- `/models/new` - Create new model
- `/admin` - Manage data records
- `/audit-logs` - View audit history

---

## 📝 How to Create & Publish a Model

### **Complete Workflow**

#### **Step 1: Navigate to Create Model Page**

1. Open the application in your browser
2. Click **"Create New Model"** button on the Models page
3. Or navigate directly to `http://localhost:5173/models/new`

#### **Step 2: Define Model Name** 🏷️

```
Model Name: Customer
```

**Naming Rules:**
- Must start with a capital letter
- Can contain letters, numbers, and underscores
- No spaces or special characters
- Example: `Customer`, `OrderItem`, `User_Profile`

#### **Step 3: Add Fields** ➕

Click **"Add Field"** and configure each field:

**Field Properties:**
- **Name:** Field identifier (e.g., `email`, `firstName`)
- **Type:** Data type
  - `String` - Text data
  - `Number` - Numeric values
  - `Boolean` - True/False
  - `Date` - Date/Time stamps
- **Required:** ✅ Mandatory field
- **Unique:** ✅ Must be unique across records
- **Default Value:** Optional default value

**Example Field Configuration:**
```javascript
{
  name: "email",
  type: "string",
  required: true,
  unique: true
}

{
  name: "age",
  type: "number",
  required: false,
  unique: false,
  default: 18
}
```

#### **Step 4: Configure RBAC** 🔐

Set permissions for each role:

**Available Roles:**
- **Admin** - Full control
- **Manager** - Business operations
- **Viewer** - Read-only access

**Available Permissions:**
- ✅ **Create** - Can create new records
- ✅ **Read** - Can view records
- ✅ **Update** - Can modify records
- ✅ **Delete** - Can remove records
- ✅ **All** - Grants all permissions

**Example RBAC Configuration:**
```javascript
{
  Admin: ["all"],
  Manager: ["create", "read", "update"],
  Viewer: ["read"]
}
```

#### **Step 5: Set Ownership Field (Optional)** 👤

- Select a field that stores the user ID of the record creator
- Used for record-level access control
- Example: `createdBy`, `ownerId`, `userId`

**How it works:**
- Non-admin users can only access records where `ownerField === currentUser.id`
- Admins can see all records regardless

#### **Step 6: Enable Timestamps (Optional)** ⏰

Check **"Add timestamps"** to automatically add:
- `createdAt` - Record creation date
- `updatedAt` - Last modification date

#### **Step 7: Publish Model** 🚀

Click **"Publish Model"** button

**What happens on publish:**
1. ✅ Validates model definition (name, fields, types)
2. ✅ Sends POST request to `/api/models`
3. ✅ Backend writes model to `backend/models/{ModelName}.json`
4. ✅ Creates version file in `backend/models/versions/{ModelName}_v1.json`
5. ✅ Logs audit entry in `backend/audit-logs/audit-{date}.json`
6. ✅ Dynamic CRUD routes are registered automatically
7. ✅ Returns success response
8. ✅ Redirects to Models list page

**Generated Model File Example:**
```json
// backend/models/Customer.json
{
  "name": "Customer",
  "fields": [
    {
      "name": "id",
      "type": "number",
      "required": true,
      "unique": true
    },
    {
      "name": "email",
      "type": "string",
      "required": true,
      "unique": true
    },
    {
      "name": "firstName",
      "type": "string",
      "required": true,
      "unique": false
    }
  ],
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  },
  "ownerField": "createdBy",
  "timestamps": true
}
```

---

## 📂 How File-Write Works

### **Architecture Overview**

DuBuddy uses a **file-based model definition system** with automatic versioning and audit logging.

### **Directory Structure**

```
backend/
├── models/                       # Active model definitions
│   ├── Customer.json            # Customer model definition
│   ├── Product.json             # Product model definition
│   └── versions/                # Version history
│       ├── Customer_v1.json     # Customer version 1
│       ├── Customer_v2.json     # Customer version 2
│       └── Product_v1.json      # Product version 1
│
└── audit-logs/                   # Operation logs
    ├── audit-2025-11-01.json    # Nov 1 logs
    └── audit-2025-11-02.json    # Nov 2 logs
```

### **Model Creation Flow** 📝

#### **1. Client Request**
```typescript
// Frontend sends POST request
POST /api/models
Content-Type: application/json

{
  "name": "Customer",
  "fields": [...],
  "rbac": {...},
  "ownerField": "createdBy",
  "timestamps": true
}
```

#### **2. Backend Validation** ✅
```typescript
// backend/src/routes/modelRoutes.ts

// Check if model name is valid
if (!model.name || !/^[A-Z][a-zA-Z0-9_]*$/.test(model.name)) {
  return res.status(400).json({ error: "Invalid model name" });
}

// Validate fields
if (!Array.isArray(model.fields) || model.fields.length === 0) {
  return res.status(400).json({ error: "Model must have fields" });
}

// Check for required fields
const hasIdField = model.fields.some(f => f.name === 'id');
if (!hasIdField) {
  return res.status(400).json({ error: "Model must have an 'id' field" });
}
```

#### **3. Version Calculation** 🔢
```typescript
// Read existing versions from models/versions/
const versionFiles = await fs.readdir(VERSIONS_DIR);
const modelVersions = versionFiles.filter(f => 
  f.startsWith(`${model.name}_v`) && f.endsWith('.json')
);

let nextVersion = 1;
if (modelVersions.length > 0) {
  const versions = modelVersions.map(f => {
    const match = f.match(/_v(\d+)\.json$/);
    return match ? parseInt(match[1]) : 0;
  });
  nextVersion = Math.max(...versions) + 1;
}
```

#### **4. File Writing** 💾

**Write Main Model File:**
```typescript
import { promises as fs } from 'fs';
import path from 'path';

const MODELS_DIR = path.join(__dirname, '../../models');
const modelPath = path.join(MODELS_DIR, `${model.name}.json`);

// Ensure directory exists
await fs.mkdir(MODELS_DIR, { recursive: true });

// Write model definition
await fs.writeFile(
  modelPath,
  JSON.stringify(model, null, 2),
  'utf-8'
);
```

**Write Version File:**
```typescript
const VERSIONS_DIR = path.join(MODELS_DIR, 'versions');
const versionPath = path.join(
  VERSIONS_DIR,
  `${model.name}_v${nextVersion}.json`
);

// Ensure versions directory exists
await fs.mkdir(VERSIONS_DIR, { recursive: true });

// Write version with metadata
const versionData = {
  version: nextVersion,
  timestamp: new Date().toISOString(),
  model: model,
  fieldCount: model.fields.length,
  rbacRoles: Object.keys(model.rbac || {})
};

await fs.writeFile(
  versionPath,
  JSON.stringify(versionData, null, 2),
  'utf-8'
);
```

#### **5. Audit Logging** 📜
```typescript
const AUDIT_DIR = path.join(__dirname, '../../audit-logs');

async function writeAuditLog(action, modelName, details) {
  // Ensure audit directory exists
  await fs.mkdir(AUDIT_DIR, { recursive: true });
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: action,           // 'CREATE', 'UPDATE', 'DELETE'
    resourceType: 'model',
    resourceName: modelName,
    userId: req.user?.userId,
    userEmail: req.user?.email,
    details: details
  };
  
  // Group logs by date
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(AUDIT_DIR, `audit-${date}.json`);
  
  // Read existing logs
  let logs = [];
  try {
    const content = await fs.readFile(logFile, 'utf-8');
    logs = JSON.parse(content);
  } catch {
    // File doesn't exist yet
  }
  
  // Append new log
  logs.push(logEntry);
  
  // Write back to file
  await fs.writeFile(logFile, JSON.stringify(logs, null, 2), 'utf-8');
}

// Usage
await writeAuditLog('CREATE', model.name, {
  version: nextVersion,
  fieldCount: model.fields.length,
  hasRBAC: !!model.rbac,
  hasOwnership: !!model.ownerField
});
```

#### **6. Response to Client** ✅
```typescript
res.status(201).json({
  success: true,
  message: 'Model created successfully',
  data: {
    name: model.name,
    version: nextVersion,
    path: modelPath
  }
});
```

### **Model Update Flow** 🔄

When updating an existing model:

1. **Read Current Model** - Load from `models/{ModelName}.json`
2. **Increment Version** - Calculate next version number
3. **Backup Current** - Save current as new version file
4. **Write Updated** - Overwrite main model file
5. **Audit Log** - Record the change with before/after state
6. **Hot Reload** - Optionally reload without restart

---

## ⚙️ How Dynamic CRUD Endpoints are Registered

### **Dynamic Route Registration System**

DuBuddy doesn't require you to write CRUD routes for each model. The system **automatically generates and registers routes** based on model definitions.

### **Startup Process** 🚀

#### **1. Server Initialization**
```typescript
// backend/src/index.ts

import express from 'express';
import modelRoutes from './routes/modelRoutes';
import crudRoutes from './routes/crud';

const app = express();

// Register static routes
app.use('/api/models', modelRoutes);

// Register dynamic CRUD routes
app.use('/api/crud', crudRoutes);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
```

#### **2. CRUD Route Handler**
```typescript
// backend/src/routes/crud.ts

import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, checkPermission } from '../middleware/rbac';

const router = Router();

// Generic CRUD routes work for ANY model
// The model name comes from the URL parameter

// List all records for a model
router.get('/:modelName', authenticate, checkPermission(), async (req, res) => {
  const { modelName } = req.params;
  
  // Fetch records from database
  const dbRecords = await prisma.record.findMany({
    where: { modelName },
    orderBy: { createdAt: 'desc' }
  });
  
  // Apply RBAC filtering
  // If user is not admin and model has ownerField, filter records
  
  res.json({ success: true, data: records });
});

// Get single record
router.get('/:modelName/:id', authenticate, checkPermission(), async (req, res) => {
  // Implementation...
});

// Create record
router.post('/:modelName', authenticate, checkPermission(), async (req, res) => {
  // Implementation...
});

// Update record
router.put('/:modelName/:id', authenticate, checkPermission(), async (req, res) => {
  // Implementation...
});

// Delete record
router.delete('/:modelName/:id', authenticate, checkPermission(), async (req, res) => {
  // Implementation...
});

export default router;
```

### **How It Works** 🔍

#### **URL Pattern Matching**
```
/api/crud/:modelName         → Works for any model name
/api/crud/Customer           → Customer records
/api/crud/Product            → Product records
/api/crud/OrderItem          → OrderItem records
```

#### **RBAC Middleware**
```typescript
// backend/src/middleware/rbac.ts

export const checkPermission = () => {
  return async (req, res, next) => {
    const { modelName } = req.params;
    const method = req.method;
    
    // Map HTTP methods to permissions
    const permissionMap = {
      'GET': 'read',
      'POST': 'create',
      'PUT': 'update',
      'DELETE': 'delete'
    };
    
    const requiredPermission = permissionMap[method];
    
    // Load model definition from file
    const modelPath = path.join(MODELS_DIR, `${modelName}.json`);
    const modelContent = await fs.readFile(modelPath, 'utf-8');
    const model = JSON.parse(modelContent);
    
    // Attach model to request
    req.modelDefinition = model;
    
    // Check if user has permission
    const userRole = req.user.role;
    const permissions = model.rbac?.[userRole] || [];
    
    if (permissions.includes('all') || permissions.includes(requiredPermission)) {
      next(); // User has permission
    } else {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
  };
};
```

#### **Request Flow Example** 📊

**Creating a Customer Record:**

```
1. Client Request:
   POST /api/crud/Customer
   Authorization: Bearer <jwt-token>
   Body: { email: "john@example.com", firstName: "John" }

2. Middleware Chain:
   ├─ authenticate()          → Validates JWT, extracts user
   ├─ checkPermission()       → Loads Customer.json, checks RBAC
   └─ Route Handler          → Creates record in database

3. RBAC Check:
   User Role: Manager
   Model: Customer
   Required Permission: create
   Allowed Permissions: ["create", "read", "update"]
   Result: ✅ Allowed

4. Database Operation:
   prisma.record.create({
     data: {
       modelName: "Customer",
       data: JSON.stringify({ 
         email: "john@example.com", 
         firstName: "John",
         createdBy: req.user.userId  // Auto-added if ownerField set
       })
     }
   })

5. Audit Log:
   Written to: audit-logs/audit-2025-11-03.json
   Entry: {
     timestamp: "2025-11-03T10:30:00Z",
     action: "CREATE",
     resourceType: "record",
     resourceName: "Customer#123",
     userId: 5,
     userEmail: "manager@example.com"
   }

6. Response:
   Status: 201 Created
   Body: {
     success: true,
     message: "Record created successfully",
     data: { id: 123, email: "john@example.com", ... }
   }
```

### **Key Benefits** ✨

1. **No Code Generation** - Routes work dynamically
2. **Automatic RBAC** - Permissions enforced automatically
3. **Type Safety** - TypeScript ensures consistency
4. **Audit Trail** - All operations logged automatically
5. **Ownership** - Record-level access control built-in
6. **Scalability** - Add models without touching route code

---

## 🎮 Usage Guide

### **Creating a Model**
1. Navigate to **Models** page
2. Click **Create New Model** button
3. Define fields with types and constraints
4. Configure RBAC permissions per role
5. Set ownership field (optional)
6. Click **Publish Model** 🎯

### **Managing Data**
1. Select a model from the **Models** page
2. Click **Manage Data** to view records
3. Use **Add Record** for new entries
4. Edit/Delete records with inline actions ✏️🗑️

### **Viewing Audit Logs**
1. Navigate to **Audit Logs** page
2. Filter by date, action type, or resource
3. View detailed operation history 📊

### **User Authentication**
- Default admin credentials can be created via Prisma Studio
- JWT tokens are stored in localStorage
- Auto-logout on token expiration 🔐

---

## 🔑 API Endpoints

### **Authentication**
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
GET    /api/auth/me             # Current user info
```

### **Models**
```
GET    /api/models              # List all models
GET    /api/models/:name        # Get specific model
POST   /api/models              # Create new model
PUT    /api/models/:name        # Update model
DELETE /api/models/:name        # Delete model
GET    /api/models/:name/versions  # Get model version history
POST   /api/models/reload       # Hot reload models
```

### **CRUD Operations**
```
GET    /api/crud/:modelName     # List records
GET    /api/crud/:modelName/:id # Get record
POST   /api/crud/:modelName     # Create record
PUT    /api/crud/:modelName/:id # Update record
DELETE /api/crud/:modelName/:id # Delete record
```

### **Audit Logs**
```
GET    /api/audit-logs          # Get audit logs with filters
```

---

## 🎨 UI Features

- **🌈 Dark Purple Theme** - Futuristic glassmorphism design
- **✨ Smooth Animations** - Cubic-bezier transitions
- **📱 Responsive Layout** - Works on all screen sizes
- **🎭 Custom Modals** - Beautiful confirmation dialogs
- **🔔 Toast Notifications** - Real-time feedback
- **📊 Data Tables** - Sortable and filterable
- **🎯 Interactive Cards** - Hover effects and transforms

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Ownership validation
- ✅ Input validation & sanitization
- ✅ CORS protection
- ✅ Environment-based secrets

---

## 🧪 Development

### **Available Scripts**

**Backend:**
```bash
npm start              # Start development server
npm run build          # Build for production
npx prisma studio      # Open Prisma Studio
npx prisma generate    # Regenerate Prisma Client
```

**Frontend:**
```bash
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

### **Database Management**

```bash
# View/Edit database with Prisma Studio
cd backend
npx prisma studio

# Reset database
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 👨‍💻 Author

**Me:- Uttam Kumar**

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

