import { useEffect, useState } from "react";
import { UserAPI } from "../../utils/api";
import { FiPlus, FiTrash, FiEdit2, FiX } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { setPageTitle } = useOutletContext();
const [search, setSearch] = useState("");

  // ✅ Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    setPageTitle("Manage Users");
    fetchUsers();
  }, []);

  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await UserAPI.getAll();
      setUsers(res.data.data || res.data);
    } catch (err) {
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open Add User Popup
  const handleAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
    });
    setOpen(true);
  };

  // ✅ Open Edit Popup
  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      const res = await UserAPI.getById(id);
      const u = res.data.data;
      setForm({
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        password: "",
      });
      setOpen(true);
    } catch (e) {
      alert("Failed to load user");
    }
  };

  // ✅ Submit Form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await UserAPI.update(editingId, form);
        alert("✅ User updated");
      } else {
        await UserAPI.create(form);
        alert("✅ User created");
      }

      setOpen(false);
      fetchUsers();
    } catch (err) {
      alert("❌ Error saving user");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await UserAPI.delete(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Failed to delete user");
    }
  };

  // ✅ Update form fields
  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const filteredUsers = users.filter((u) => {
  const s = search.toLowerCase();
  return (
    u.name?.toLowerCase().includes(s) ||
    u.email?.toLowerCase().includes(s) ||
    u.phone?.toLowerCase().includes(s) ||
    u.role?.toLowerCase().includes(s)
  );
});


  return (
    <div className="py-6 space-y-6">

      {/* ✅ Header */}
      <div className="flex justify-between items-center">
       
  {/* ✅ Search Input */}
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex items-center gap-2 px-3 py-2">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-transparent outline-none text-gray-700 w-40 md:w-60"
      />
    </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#0961A1] hover:bg-[#0b507d] text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus /> Add User
        </button>
      </div>

      {/* ✅ User Table */}
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
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, i) => (

                <tr
                  key={user._id}
                  className={`
                    border-b border-gray-200
                    ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    hover:bg-gray-100 transition
                  `}
                >
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone || "-"}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "Admin"
                          ? "bg-blue-100 text-blue-700"
                          : user.role === "Technician"
                          ? "bg-green-100 text-green-700"
                          : user.role === "Receptionist"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(user._id)}
                        className="flex items-center gap-1 border border-blue-500 text-blue-500 px-3 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition"
                      >
                        <FiEdit2 /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-1 border border-red-500 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
                      >
                        <FiTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-[600px] max-w-full shadow-xl border p-6">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0961A1]">
                {editingId ? "Edit User" : "Add User"}
              </h3>

              <button onClick={() => setOpen(false)}>
                <FiX className="text-xl text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" name="name" value={form.name} onChange={change} required />
                <Field label="Email" name="email" type="email" value={form.email} onChange={change} required />

                <Field label="Phone" name="phone" value={form.phone} onChange={change} />

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={change}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Role</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Technician">Technician</option>
                    <option value="Pathologist">Pathologist</option>
                  </select>
                </div>

                {/* Password only for Create */}
                {!editingId && (
                  <Field
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={change}
                    required
                    className="col-span-2"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#0961A1] text-white hover:bg-[#0b507d]"
                >
                  {saving ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;

/* ✅ Reusable Input Component */
const Field = ({ label, name, type = "text", value, onChange, required }) => (
  <div>
    <label className="text-sm text-gray-600 mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0961A1]"
    />
  </div>
);
