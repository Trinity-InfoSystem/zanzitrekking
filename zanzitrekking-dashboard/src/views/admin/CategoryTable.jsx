import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IMAGES_URL } from "../../utils/constants";
import { isAdmin, isEditor } from "../../utils/roleVerification";

const CategoryTable = ({
  categories,
  selectedIds,
  isAllSelected,
  handleSelectAll,
  handleSelectRow,
  setToDeleteId,
  setConfirmOpen,
  currentPage,
  parPage,
  loader,
  setBulkConfirmOpen,
  role,
}) => (
  <div className="overflow-x-auto rounded-xl bg-white shadow-nature-soft ring-1 ring-primary-100">
    {categories.length > 0 ? (
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 text-left text-xs font-semibold uppercase tracking-wider text-primary-700">
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-2 focus:ring-secondary-200"
              />
            </th>
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Name</th>
            {(isAdmin(role) || isEditor(role)) && (
              <th className="px-4 py-3">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-100">
          {categories.map((d, i) => {
            let imageName = d.image
              ? IMAGES_URL + d.image.split("/").pop()
              : "/placeholder.svg";
            return (
              <tr
                key={i}
                className="group transition-colors hover:bg-primary-50/50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(d._id)}
                    onChange={() => handleSelectRow(d._id)}
                    className="h-4 w-4 rounded border-primary-300 text-secondary accent-secondary focus:ring-2 focus:ring-secondary-200"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-text">
                  {i + 1 + (currentPage - 1) * parPage}
                </td>
                <td className="px-4 py-3">
                  <div className="group-hover:shadow-coral-soft h-14 w-14 overflow-hidden rounded-xl border-2 border-primary-200 bg-neutral-50 shadow-sm transition-all group-hover:border-secondary-300">
                    <img
                      src={imageName}
                      alt={d.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-text-dark">
                  {d.name}
                </td>
                {(isAdmin(role) || isEditor(role)) && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/dashboard/edit-category/${d._id}`}
                        className="shadow-sunshine-soft hover:shadow-sunshine-medium flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sunshine-400 to-sunshine-500 text-white transition-all hover:scale-110"
                      >
                        <FaEdit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setToDeleteId(d._id);
                          setConfirmOpen(true);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-600 text-white shadow-sm transition-all hover:scale-110 hover:shadow-medium"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary-200 bg-primary-50/30 p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-primary-100">
          <FaEdit className="h-5 w-5 text-text-light" />
        </div>
        <h3 className="mb-1 text-sm font-medium text-primary-800">
          No destinations found
        </h3>
        <p className="text-xs text-text-light">
          Try adjusting your search or add a new destinations
        </p>
      </div>
    )}
    {/* Bulk Delete Button */}
    {selectedIds.length > 0 && (
      <div className="mt-4 flex justify-end">
        <button
          className="rounded-xl bg-gradient-to-r from-accent to-accent-600 px-6 py-2.5 font-semibold text-white shadow-medium transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
          onClick={() => setBulkConfirmOpen(true)}
          disabled={loader}
        >
          {loader ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
        </button>
      </div>
    )}
  </div>
);

export default CategoryTable;
