import { canWrite, canAdmin, canOnlyView } from "../utils/routeAccess";

/**
 * A reusable button component that respects role-based access control
 * @param {Object} props - Component props
 * @param {string} props.userRole - The user's role
 * @param {string} props.actionType - Type of action (write, admin, view)
 * @param {React.ReactNode} props.children - Button content
 * @param {Object} props.buttonProps - Additional button props
 * @returns {React.ReactNode|null} - Button component or null if no access
 */
const RoleBasedButton = ({ 
  userRole, 
  actionType = "write", 
  children, 
  buttonProps = {},
  ...props 
}) => {
  // Check if user has permission for the action type
  const hasPermission = () => {
    switch (actionType) {
      case "admin":
        return canAdmin(userRole);
      case "write":
        return canWrite(userRole);
      case "view":
        return !canOnlyView(userRole); // Viewers can't perform write operations
      default:
        return true;
    }
  };

  // Don't render if user doesn't have permission
  if (!hasPermission()) {
    return null;
  }

  return (
    <button {...buttonProps} {...props}>
      {children}
    </button>
  );
};

export default RoleBasedButton;
