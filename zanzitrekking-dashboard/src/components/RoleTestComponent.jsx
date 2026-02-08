import { useSelector } from "react-redux";
import { isAdmin, isEditor, isViewer } from "../utils/roleVerification";
import { canWrite, canAdmin, canOnlyView } from "../utils/routeAccess";

const RoleTestComponent = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const role = userInfo?.role;
  const accessRoutes = userInfo?.accessRoutes || [];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Role Access Test</h3>
      
      <div className="space-y-2">
        <p><strong>Current Role:</strong> {role}</p>
        <p><strong>Access Routes:</strong> {accessRoutes.join(", ") || "None"}</p>
        
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">Permission Checks:</h4>
          <p>Is Admin: {isAdmin(role) ? "✅ Yes" : "❌ No"}</p>
          <p>Is Editor: {isEditor(role) ? "✅ Yes" : "❌ No"}</p>
          <p>Is Viewer: {isViewer(role) ? "✅ Yes" : "❌ No"}</p>
          
          <h4 className="font-semibold mt-4">Operation Permissions:</h4>
          <p>Can Write: {canWrite(role) ? "✅ Yes" : "❌ No"}</p>
          <p>Can Admin: {canAdmin(role) ? "✅ Yes" : "❌ No"}</p>
          <p>Can Only View: {canOnlyView(role) ? "✅ Yes" : "❌ No"}</p>
        </div>
        
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">UI Elements Visibility:</h4>
          <p>Add Admin Button: {canAdmin(role) ? "✅ Visible" : "❌ Hidden"}</p>
          <p>Edit Buttons: {canWrite(role) ? "✅ Visible" : "❌ Hidden"}</p>
          <p>Delete Buttons: {canAdmin(role) ? "✅ Visible" : "❌ Hidden"}</p>
        </div>
      </div>
    </div>
  );
};

export default RoleTestComponent;
