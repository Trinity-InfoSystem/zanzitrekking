import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTimes, FaComments, FaUser } from "react-icons/fa";
import { get_all_admins } from "../../../store/Reducers/adminToAdminReducer";
import { resolveMediaUrl } from "../../../utils/constants";

const AllAdminsModal = ({ isOpen, onClose, onSelectAdmin }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const { allAdmins, loader } = useSelector((state) => state.adminToAdmin);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen && allAdmins.length === 0 && !loader) {
      dispatch(get_all_admins());
    }
  }, [isOpen, dispatch, allAdmins.length, loader]);

  const filteredAdmins = allAdmins.filter(
    (admin) =>
      admin._id !== userInfo?._id && // Exclude current admin
      (admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleAdminSelect = (admin) => {
    onSelectAdmin(admin);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[80vh] w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Admin to Chat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search other admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Admin List */}
        <div className="max-h-96 overflow-y-auto">
          {loader ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredAdmins.length > 0 ? (
            <div className="space-y-2 p-4">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {admin.image ? (
                      <img
                        src={resolveMediaUrl(admin.image)}
                        alt={admin.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <FaUser className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {admin.name}
                      </h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <p className="text-xs capitalize text-emerald-600">
                        {admin.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdminSelect(admin)}
                    className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
                  >
                    <FaComments className="h-4 w-4" />
                    <span>Chat</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <FaUser className="mb-4 h-12 w-12" />
              <p>No admins found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllAdminsModal;
