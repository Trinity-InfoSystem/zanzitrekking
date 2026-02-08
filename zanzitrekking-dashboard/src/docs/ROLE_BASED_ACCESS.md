
# Role-Based Access Control (RBAC) Implementation

This document explains how to implement and use the role-based access control system in the Zanzitrekking dashboard.

## Overview

The system supports three user roles:
- **Admin**: Full access to all features and can manage other admins
- **Editor**: Can perform write operations but cannot manage other admins
- **Viewer**: Read-only access to specific routes they have been granted

## Core Utilities

### `utils/roleVerification.js`
Basic role checking functions:
```javascript
import { isAdmin, isEditor, isViewer } from "../utils/roleVerification";

// Check specific roles
if (isAdmin(userRole)) { /* Admin only code */ }
if (isEditor(userRole)) { /* Editor or Admin code */ }
if (isViewer(userRole)) { /* Viewer only code */ }
```

### `utils/routeAccess.js`
Advanced access control functions:
```javascript
import { hasRouteAccess, canWrite, canAdmin, canOnlyView } from "../utils/routeAccess";

// Check route access
if (hasRouteAccess(userRole, userAccessRoutes, "/admin/dashboard/customers")) {
  // User can access this route
}

// Check operation permissions
if (canWrite(userRole)) { /* Can perform write operations */ }
if (canAdmin(userRole)) { /* Can perform admin operations */ }
if (canOnlyView(userRole)) { /* Read-only access */ }
```

## Implementation Examples

### 1. Sidebar Navigation Filtering

The sidebar automatically filters navigation items based on user role and access routes:

```javascript
// In Sidebar.jsx
const navs = allNavv.filter((nav) => {
  const routePath = Array.isArray(nav.path) ? nav.path[0] : nav.path;
  return hasRouteAccess(role, accessRoutes, routePath);
});
```

### 2. Conditional Button Rendering

Hide buttons based on user permissions:

```javascript
// Hide Add Admin button for non-admins
{canAdmin(role) && (
  <button onClick={handleAddAdmin}>Add Admin</button>
)}

// Hide edit buttons for viewers
{canWrite(role) && (
  <button onClick={handleEdit}>Edit</button>
)}
```

### 3. Using RoleBasedButton Component

Use the reusable button component for consistent access control:

```javascript
import RoleBasedButton from "../components/RoleBasedButton";

// Admin-only button
<RoleBasedButton 
  userRole={role} 
  actionType="admin"
  onClick={handleAdminAction}
>
  Admin Action
</RoleBasedButton>

// Write operation button
<RoleBasedButton 
  userRole={role} 
  actionType="write"
  onClick={handleWriteAction}
>
  Edit Item
</RoleBasedButton>
```

### 4. Table Action Columns

Hide action columns for viewers:

```javascript
// In table header
{canWrite(role) && (
  <th>Actions</th>
)}

// In table rows
{canWrite(role) && (
  <td>
    <button onClick={handleEdit}>Edit</button>
    {canAdmin(role) && (
      <button onClick={handleDelete}>Delete</button>
    )}
  </td>
)}
```

## Access Control Rules

### Admin Role
- ✅ Full access to all routes
- ✅ Can create, edit, delete any content
- ✅ Can manage other admins
- ✅ Can assign access routes to other users
- ✅ Can access admin-only features

### Editor Role
- ✅ Access to all non-admin routes
- ✅ Can create, edit, delete content
- ❌ Cannot manage other admins
- ❌ Cannot access admin-only features
- ❌ Cannot assign access routes

### Viewer Role
- ✅ Access only to granted routes
- ✅ Can view content (read-only)
- ❌ Cannot create, edit, or delete
- ❌ Cannot manage other admins
- ❌ Cannot access admin-only features

## Route Access Configuration

Routes are controlled through the `accessRoutes` array in the admin model:

```javascript
// Example admin with limited access
{
  role: "viewer",
  accessRoutes: ["customers", "trips", "blogPosts"]
}
```

This viewer can only access:
- Dashboard (`/admin/dashboard`)
- Customers (`/admin/dashboard/customers`)
- Trips (`/admin/dashboard/trips`)
- Blog Posts (`/admin/dashboard/blogPosts`)

## Best Practices

1. **Always check permissions before rendering UI elements**
2. **Use the utility functions instead of hardcoded role checks**
3. **Test with different user roles to ensure proper access control**
4. **Document which features require which permissions**
5. **Use the RoleBasedButton component for consistent behavior**

## Testing Access Control

To test the access control system:

1. **Create test users with different roles**
2. **Assign different access routes to viewers**
3. **Verify that UI elements are hidden/shown correctly**
4. **Test that API calls are properly protected**
5. **Ensure navigation only shows accessible routes**

## Security Considerations

- **Frontend access control is for UX only** - always validate permissions on the backend
- **Use JWT tokens with role information** for API authentication
- **Implement proper middleware** for route protection
- **Regularly audit user permissions** and access routes
- **Log access attempts** for security monitoring

## Common Patterns

### Conditional Rendering
```javascript
{canWrite(role) ? (
  <EditButton onClick={handleEdit} />
) : (
  <ViewOnlyMessage />
)}
```

### Permission-based Styling
```javascript
<div className={`content ${canWrite(role) ? 'editable' : 'read-only'}`}>
  {/* Content */}
</div>
```

### Route Protection
```javascript
// In route components
if (!hasRouteAccess(role, accessRoutes, currentPath)) {
  return <AccessDenied />;
}
```

This system provides a robust foundation for role-based access control while maintaining clean, maintainable code.
