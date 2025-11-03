# Home API Endpoint Documentation

## Overview

The Home API endpoint provides a welcoming entry point to the AutoCRUD-RBAC backend API, offering information about available endpoints, features, and capabilities.

## Endpoints

### 1. Home - API Overview

**Endpoint:** `GET /api/home`

**Description:** Returns welcome information and a comprehensive overview of all available API endpoints.

**Response:**
```json
{
  "message": "Welcome to AutoCRUD-RBAC API",
  "description": "A powerful dynamic model builder with automatic CRUD operations and role-based access control",
  "version": "1.0.0",
  "timestamp": "2025-11-03T...",
  "features": [
    "Dynamic model creation",
    "Automatic CRUD operations",
    "Role-based access control",
    "Model versioning",
    "Hot reload support",
    "Comprehensive audit logs"
  ],
  "endpoints": {
    "health": {
      "path": "/health",
      "method": "GET",
      "description": "Health check endpoint"
    },
    "home": {
      "path": "/api/home",
      "method": "GET",
      "description": "Home page information"
    },
    "auth": {
      "path": "/auth/*",
      "description": "Authentication endpoints"
    },
    "models": {
      "path": "/api/models/*",
      "description": "Model management endpoints"
    },
    "crud": {
      "path": "/api/crud/:modelName/*",
      "description": "CRUD operations for dynamic models"
    }
  },
  "documentation": {
    "api": "See API_DOCUMENTATION.md for detailed API documentation",
    "rbac": "See RBAC_DOCUMENTATION.md for role-based access control documentation"
  },
  "links": {
    "models": "/api/models",
    "health": "/health"
  }
}
```

### 2. Info - Detailed API Information

**Endpoint:** `GET /api/home/info`

**Description:** Returns detailed information about the API's capabilities and feature set.

**Response:**
```json
{
  "name": "AutoCRUD-RBAC API",
  "version": "1.0.0",
  "description": "Dynamic model builder with automatic CRUD operations and role-based access control",
  "author": "DuBuddy",
  "timestamp": "2025-11-03T...",
  "environment": "development",
  "features": {
    "dynamicModels": {
      "description": "Create and manage data models dynamically",
      "capabilities": [
        "Define fields with types and validation",
        "Establish relationships between models",
        "Version control for model schemas",
        "Hot reload model changes"
      ]
    },
    "crud": {
      "description": "Automatic CRUD operations for all models",
      "operations": ["Create", "Read", "Update", "Delete", "List with pagination"]
    },
    "rbac": {
      "description": "Role-based access control",
      "capabilities": [
        "Define custom roles",
        "Granular permissions per model",
        "Field-level access control",
        "Operation-level permissions"
      ]
    },
    "auditing": {
      "description": "Comprehensive audit logging",
      "tracked": ["All CRUD operations", "Model schema changes", "RBAC configuration changes"]
    }
  }
}
```

## Usage Examples

### Using cURL

```bash
# Get home/welcome information
curl http://localhost:4000/api/home

# Get detailed API information
curl http://localhost:4000/api/home/info

# Pretty print with jq
curl -s http://localhost:4000/api/home | jq '.'
```

### Using JavaScript/TypeScript (fetch)

```typescript
// Get home information
const homeResponse = await fetch('http://localhost:4000/api/home');
const homeData = await homeResponse.json();
console.log(homeData.message);
console.log(homeData.endpoints);

// Get detailed info
const infoResponse = await fetch('http://localhost:4000/api/home/info');
const infoData = await infoResponse.json();
console.log(infoData.features);
```

### Using Axios

```typescript
import axios from 'axios';

// Get home information
const { data: home } = await axios.get('http://localhost:4000/api/home');
console.log(home.features);

// Get detailed info
const { data: info } = await axios.get('http://localhost:4000/api/home/info');
console.log(info.features.dynamicModels);
```

## Testing

A test script is provided to verify all home endpoints:

```bash
# Run the test script
./test-home-api.sh
```

The script will test:
1. Health check endpoint (`/health`)
2. Home endpoint (`/api/home`)
3. Info endpoint (`/api/home/info`)

## Integration with Frontend

The backend home endpoint complements the frontend home page (`/home/tuflinuxbeast/Documents/GitHub/AutoCRUD_RBAC---DuBuddy_SDE-I_Task/frontend/src/pages/Home.tsx`), providing:

- API discovery for frontend developers
- Dynamic feature listing
- Real-time API status and version information
- Documentation links

## Benefits

1. **API Discovery**: New users can quickly understand available endpoints
2. **Self-Documentation**: The API describes its own capabilities
3. **Monitoring**: Timestamp and version information for tracking
4. **Navigation**: Quick links to key endpoints
5. **Development**: Easier integration and debugging for frontend developers

## Related Documentation

- [Full API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [RBAC Documentation](./RBAC_DOCUMENTATION.md) - Role-based access control details
- [Frontend Home Page](../frontend/src/pages/Home.tsx) - User-facing home page

## Server Integration

The home routes are registered in `src/server.ts`:

```typescript
import homeRouter from './routes/home';

// ...

app.use('/api/home', homeRouter);
```

The home endpoint is accessible before authentication, making it a perfect entry point for API exploration.
