import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaDownload,
  FaTrash,
  FaEdit
} from "react-icons/fa";

const UserManagement = () => {
  // Mock data matching your Laravel migration schema
  const [users, setUsers] = useState([
    {
      user_id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      status: "Active",
      role: "Manager",
    },
    {
      user_id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      status: "Inactive",
      role: "Receptionist",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search input (name, email, or role)
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <h2>User Management</h2>
          <div style={styles.actionButtons}>
            <button style={{ ...styles.btn, ...styles.btnSecondary }}>
              <FaFileImport /> Import
            </button>
            <button style={{ ...styles.btn, ...styles.btnSecondary }}>
              <FaFileExport /> Export
            </button>
            <button style={{ ...styles.btn, ...styles.btnPrimary }}>
              <FaPlus /> Add User
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} style={styles.tr}>
                    <td style={styles.td}>{user.user_id}</td>
                    <td style={styles.td, styles.boldText}>{user.name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.phone}</td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>{user.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            user.status === "Active" ? "#e6fffa" : "#fff5f5",
                          color: user.status === "Active" ? "#047481" : "#e53e3e",
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.tableActions}>
                        <button style={styles.iconBtn} title="Edit User">
                          <FaEdit color="#4a5568" />
                        </button>
                        <button style={styles.iconBtn} title="Delete User">
                          <FaTrash color="#e53e3e" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={styles.noData}>
                    No users found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

// Clean inline styles. If you use Tailwind CSS, these map easily to utilities.
const styles = {
  container: {
    padding: "24px",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "between",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    fontWeight: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  btnPrimary: {
    backgroundColor: "#2b6cb0",
    color: "#fff",
  },
  btnSecondary: {
    backgroundColor: "#edf2f7",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
  },
  filterBar: {
    marginBottom: "20px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    maxWidth: "400px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#a0aec0",
  },
  searchInput: {
    width: "100%",
    padding: "10px 10px 10px 36px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflowX: "auto",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    backgroundColor: "#f7fafc",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#718096",
    borderBottom: "2px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #edf2f7",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#2d3748",
  },
  boldText: {
    fontWeight: "500",
  },
  roleBadge: {
    backgroundColor: "#edf2f7",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#4a5568",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  tableActions: {
    display: "flex",
    gap: "10px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  noData: {
    textAlign: "center",
    padding: "32px",
    color: "#718096",
  },
};

export default UserManagement;