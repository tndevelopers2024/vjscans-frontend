import { useEffect, useState } from "react";
import { UserAPI } from "../../utils/api";
import { FiPlus, FiTrash, FiEdit2 } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  useEffect(() => {
    setPageTitle("Manage Users");
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await UserAPI.getAll();
      setUsers(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setDeleting(true);
      await UserAPI.delete(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#0961A1]">Manage Users</h2>
        <button
          onClick={() => navigate("/admin/users/new")}
          className="flex items-center gap-2 bg-[#0961A1] hover:bg-[#0b507d] text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus className="text-sm" />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Role</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user._id}
                  className={`border-b border-[#ccc] last:border-none hover:bg-gray-50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-medium text-gray-800">{user.name}</td>
                  <td className="p-3 text-gray-700">{user.email}</td>
                  <td className="p-3 text-gray-700">{user.phone || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        user.role === "Admin"
                          ? "bg-blue-100 text-blue-700"
                          : user.role === "Technician"
                          ? "bg-green-100 text-green-700"
                          : user.role === "Receptionist"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() =>
                          navigate(`/admin/users/${user._id}/edit`)
                        }
                        className="flex items-center gap-1 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition px-3 py-1 rounded-lg text-sm"
                      >
                        <FiEdit2 className="text-xs" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deleting}
                        className="flex items-center gap-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition px-3 py-1 rounded-lg text-sm"
                      >
                        <FiTrash className="text-xs" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
