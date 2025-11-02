# RBAC (Role-Based Access Control) System Documentation

Complete guide to the authentication and authorization system with JWT tokens and ownership-based access control.

## Overview

The RBAC system provides:
- **JWT-based authentication** - Secure token-based auth
- **Role-based permissions** - Different access levels per role
- **Ownership validation** - Users can only modify their own records
- **Dynamic model support** - RBAC rules defined per model
- **Admin bypass** - Admins have full access

## Architecture

```
Request → Authenticate → Check Permission → Check Ownership → Route Handler
            (JWT)         (RBAC rules)       (ownerField)      (CRUD)
```

## Default Roles

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| **Admin** | System administrator | All (bypasses all restrictions) |
| **Manager** | Department manager | Create, Read, Update |
| **Viewer** | Read-only user | Read only |

*Note: Roles and permissions are customizable per model*

## Permissions

| Permission | HTTP Method | Description |
|------------|-------------|-------------|
| `create` | POST | Create new records |
| `read` | GET | View/list records |
| `update` | PUT, PATCH | Modify existing records |
| `delete` | DELETE | Remove records |
| `all` | * | All permissions (Admin only) |

## Components

### 1. JWT Utilities (`/backend/src/utils/jwt.ts`)

**Generate Token:**
```typescript
import { generateToken } from '../utils/jwt';

const token = generateToken({
  userId: 1,
  email: 'user@example.com',
  role: 'Manager'
});
```

**Verify Token:**
```typescript
import { verifyToken } from '../utils/jwt';

try {
  const payload = verifyToken(token);
  console.log(payload.userId, payload.role);
} catch (error) {
  console.error('Invalid token');
}
```

### 2. RBAC Middleware (`/backend/src/middleware/rbac.ts`)

**authenticate** - Extracts and verifies JWT token
```typescript
app.get('/protected', authenticate, (req, res) => {
  console.log(req.user); // { userId, email, role }
});
```

**checkPermission()** - Validates role has required permission
```typescript
router.get('/:modelName', authenticate, checkPermission(), handler);
```

**checkOwnership()** - Validates user owns the record
```typescript
router.put('/:modelName/:id', 
  authenticate, 
  checkPermission(),
  checkOwnership('ModelName', getOwnerId),
  handler
);
```

**requireRole(...roles)** - Requires specific role(s)
```typescript
router.post('/admin-only', authenticate, requireRole('Admin'), handler);
```

**requireAdmin** - Admin-only endpoint
```typescript
router.delete('/dangerous', authenticate, requireAdmin, handler);
```

## Usage Examples

### Define Model with RBAC Rules

```json
{
  "name": "Employee",
  "fields": [
    {"name": "id", "type": "number", "required": true, "unique": true},
    {"name": "name", "type": "string", "required": true},
    {"name": "email", "type": "string", "required": true},
    {"name": "salary", "type": "number"},
    {"name": "ownerId", "type": "number", "required": true}
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Employee": ["read"],
    "Viewer": ["read"]
  }
}
```

### Authentication Flow

**1. Login / Get Token:**
```bash
curl -X POST http://localhost:4000/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "email": "admin@example.com",
    "role": "Admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

**2. Use Token in Requests:**
```bash
curl http://localhost:4000/api/crud/Employee \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### CRUD Operations with RBAC

**Create Record (requires 'create' permission):**
```bash
curl -X POST http://localhost:4000/api/crud/Employee \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "salary": 80000
  }'
```

- ✅ Admin: Success
- ✅ Manager: Success (ownerField auto-assigned)
- ❌ Viewer: Denied (no create permission)

**List Records (requires 'read' permission):**
```bash
curl http://localhost:4000/api/crud/Employee \
  -H "Authorization: Bearer $TOKEN"
```

- ✅ Admin: See all records
- ✅ Manager: See only their own records (if ownerField defined)
- ✅ Viewer: See only their own records (if ownerField defined)

**Update Record (requires 'update' permission + ownership):**
```bash
curl -X PUT http://localhost:4000/api/crud/Employee/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary": 90000}'
```

- ✅ Admin: Can update any record
- ✅ Manager: Can update their own records only
- ❌ Viewer: Denied (no update permission)

**Delete Record (requires 'delete' permission + ownership):**
```bash
curl -X DELETE http://localhost:4000/api/crud/Employee/1 \
  -H "Authorization: Bearer $TOKEN"
```

- ✅ Admin: Can delete any record
- ❌ Manager: Denied (no delete permission in this example)
- ❌ Viewer: Denied (no delete permission)

## Ownership Rules

When a model defines an `ownerField`:

1. **Auto-assignment on Create:**
   - The `ownerField` is automatically set to the authenticated user's ID
   
2. **Filtered Reads:**
   - Non-admin users only see records where `ownerField` matches their `userId`
   
3. **Update/Delete Restrictions:**
   - Non-admin users can only modify records they own
   - Admin bypasses ownership checks

**Example:**
```json
{
  "ownerField": "ownerId",
  "fields": [
    {"name": "ownerId", "type": "number", "required": true}
  ]
}
```

## Error Responses

**401 Unauthorized - No Token:**
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid token"
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "required": "create",
  "role": "Viewer",
  "model": "Employee"
}
```

**403 Forbidden - Not Owner:**
```json
{
  "success": false,
  "message": "Access denied: You can only modify your own records",
  "ownerField": "ownerId"
}
```

## Security Best Practices

### JWT Secret

⚠️ **Change the JWT secret in production!**

Update in `/backend/.env`:
```env
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="24h"
```

### Token Transmission

Always use HTTPS in production to prevent token interception.

```bash
# ❌ Insecure
http://api.example.com

# ✅ Secure
https://api.example.com
```

### Token Storage (Frontend)

**Options:**
- `localStorage` - Persistent, vulnerable to XSS
- `sessionStorage` - Cleared on tab close
- `httpOnly cookie` - Most secure (requires backend setup)

### Password Hashing

For production login, always hash passwords with bcrypt:

```typescript
import bcrypt from 'bcrypt';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

## Testing

### Automated Test Script

Run the comprehensive RBAC test:

```bash
cd backend
./test-rbac.sh
```

Tests include:
- ✅ Authentication requirement
- ✅ Role-based permission enforcement
- ✅ Ownership validation
- ✅ Admin bypass rules
- ✅ All CRUD operations

### Manual Testing

**1. Get tokens for different roles:**
```bash
# Admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"role":"Admin"}' | jq -r '.token')

# Manager
MANAGER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"role":"Manager"}' | jq -r '.token')

# Viewer
VIEWER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{"role":"Viewer"}' | jq -r '.token')
```

**2. Test operations:**
```bash
# Create (Admin should succeed, Viewer should fail)
curl -X POST http://localhost:4000/api/crud/Employee \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}'
```

## Custom Roles

You can define custom roles in your model RBAC rules:

```json
{
  "rbac": {
    "Admin": ["all"],
    "HR": ["create", "read", "update"],
    "Finance": ["read"],
    "Employee": ["read"]
  }
}
```

Users with custom roles will have permissions as defined in the model.

## Integration with Routes

### Protected CRUD Routes

All routes in `/backend/src/routes/crud.ts` are automatically protected:

```typescript
router.get('/:modelName', authenticate, checkPermission(), handler);
router.post('/:modelName', authenticate, checkPermission(), handler);
router.put('/:modelName/:id', authenticate, checkPermission(), handler);
router.delete('/:modelName/:id', authenticate, checkPermission(), handler);
```

### Custom Protected Routes

Add RBAC to your own routes:

```typescript
import { authenticate, checkPermission, requireAdmin } from '../middleware/rbac';

// Require authentication
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Require specific role
router.post('/report', authenticate, requireRole('Admin', 'Manager'), handler);

// Admin only
router.delete('/system', authenticate, requireAdmin, handler);

// Model-specific permissions
router.get('/employees', authenticate, checkPermission('Employee'), handler);
```

## Troubleshooting

### "Authentication required" error

- Check token is included in Authorization header
- Verify token format: `Bearer <token>`
- Ensure token hasn't expired

### "Insufficient permissions" error

- Verify user role in JWT payload
- Check model's RBAC rules include the role
- Ensure role has required permission

### "Access denied: not owner" error

- Verify record's ownerField matches user's userId
- Check if user should be admin to bypass
- Ensure ownerField is correctly set on record

### Token verification fails

- Verify JWT_SECRET matches between generation and verification
- Check token hasn't been modified
- Ensure token hasn't expired

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login` | POST | No | Login and get token |
| `/auth/mock-token` | POST | No | Generate test token |
| `/api/crud/:model` | GET | Yes | List records (filtered by ownership) |
| `/api/crud/:model/:id` | GET | Yes | Get specific record |
| `/api/crud/:model` | POST | Yes | Create record (auto-assign owner) |
| `/api/crud/:model/:id` | PUT | Yes | Update record (ownership check) |
| `/api/crud/:model/:id` | DELETE | Yes | Delete record (ownership check) |

## Next Steps

- [ ] Implement real login with database
- [ ] Add refresh token mechanism
- [ ] Implement password reset flow
- [ ] Add rate limiting
- [ ] Set up CORS properly for production
- [ ] Add audit logging for admin actions
- [ ] Implement multi-tenancy support

## Resources

- [JWT.io](https://jwt.io) - Token debugger
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
