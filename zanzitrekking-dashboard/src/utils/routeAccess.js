import { isAdmin, isEditor, isViewer } from "./roleVerification";

/**
 * Check if a user has access to a specific route
 * @param {string} userRole - The user's role (admin, editor, viewer)
 * @param {Array} userAccessRoutes - Array of routes the user has access to
 * @param {string} routePath - The route path to check access for
 * @returns {boolean} - Whether the user has access to the route
 */
export const hasRouteAccess = (userRole, userAccessRoutes = [], routePath) => {
  // Admin has access to all routes
  if (isAdmin(userRole)) {
    return true;
  }

  // Editor has access to all routes except admin-only routes
  if (isEditor(userRole)) {
    // Check if this is an admin-only route by looking at the navigation config
    // For now, we'll use a simple check - you can enhance this based on your nav config
    const adminOnlyRoutes = ["admin-management"];
    const routeKey = routePath.replace("/admin/dashboard/", "");
    
    // If it's an admin-only route, editor can't access it
    if (adminOnlyRoutes.includes(routeKey)) {
      return false;
    }
    
    return true;
  }

  // Viewer can only access routes they have been granted
  if (isViewer(userRole)) {
    // Always allow dashboard access
    if (routePath === "/admin/dashboard") {
      return true;
    }

    // Check if user has access to this specific route
    const routeKey = routePath.replace("/admin/dashboard/", "");
    return userAccessRoutes.includes(routeKey) || userAccessRoutes.includes(routePath);
  }

  return false;
};

/**
 * Check if a user can perform write operations (add, edit, delete)
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can perform write operations
 */
export const canWrite = (userRole) => {
  return isAdmin(userRole) || isEditor(userRole);
};

/**
 * Check if a user can perform admin operations (manage other admins, access admin-only features)
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can perform admin operations
 */
export const canAdmin = (userRole) => {
  return isAdmin(userRole);
};

/**
 * Check if a user can only view (read-only access)
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user has read-only access
 */
export const canOnlyView = (userRole) => {
  return isViewer(userRole);
};
