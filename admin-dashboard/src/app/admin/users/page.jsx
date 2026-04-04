"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { authApi, userApi, logApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconTrash, IconActivity, IconUsers } from "@/components/Icons";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [logPage, setLogPage] = useState(1);
  const { show: showToast, Toast } = useToast();
  const logPerPage = 10;

  useEffect(() => {
    userApi.list().then(setUsers).catch(() => {});
    logApi.list(500).then(setLogs).catch(() => {});
  }, []);

  async function createUser(e) {
    e.preventDefault();
    setError("");
    try {
      await authApi.register(username, password);
      setUsername(""); setPassword(""); setShowForm(false);
      showToast("Akun dibuat!");
      userApi.list().then(setUsers);
    } catch (err) { setError(err.message); }
  }

  async function deleteUser(id) {
    if (!confirm("Hapus akun ini?")) return;
    try { await userApi.delete(id); showToast("Dihapus"); userApi.list().then(setUsers); }
    catch (err) { showToast(err.message); }
  }

  const logTotalPages = Math.ceil(logs.length / logPerPage);
  const inputCls = "w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors";

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-white">Kelola Akun</h1>
          <p className="text-sm text-text-muted mt-1">Manajemen akun & log aktivitas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer border-none transition-colors">
          <IconPlus className="w-4 h-4" /> {showForm ? "Batal" : "Buat Akun"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
          <form onSubmit={createUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Username</label>
                <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Password</label>
                <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button type="submit" className="bg-green-brand hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer border-none transition-colors">Buat Akun</button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-card-border flex items-center gap-2">
          <IconUsers className="w-5 h-5 text-brand" />
          <h2 className="text-text-white font-semibold m-0">Daftar Akun</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-table-header">
                {["Username", "Email", "Dibuat", "Aksi"].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-text-muted text-xs uppercase font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-card-border hover:bg-table-hover transition-colors">
                  <td className="py-3.5 px-5 font-medium text-text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-muted flex items-center justify-center overflow-hidden shrink-0">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-brand font-bold">{u.username?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      {u.username}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-text-muted text-xs">{u.email || "-"}</td>
                  <td className="py-3.5 px-5 text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="py-3.5 px-5">
                    <button onClick={() => deleteUser(u.id)}
                      className="p-1.5 text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 rounded-lg transition-colors">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border flex items-center gap-2">
          <IconActivity className="w-5 h-5 text-brand" />
          <h2 className="text-text-white font-semibold m-0">Log Aktivitas</h2>
        </div>
        {logs.length === 0 ? (
          <p className="text-text-muted text-sm p-8 text-center">Belum ada log.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-table-header">
                    {["Waktu", "User", "Aktivitas"].map((h) => (
                      <th key={h} className="text-left py-3 px-5 text-text-muted text-xs uppercase font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice((logPage - 1) * logPerPage, logPage * logPerPage).map((l) => (
                    <tr key={l.id} className="border-b border-card-border hover:bg-table-hover transition-colors">
                      <td className="py-3 px-5 text-xs text-text-muted whitespace-nowrap">{new Date(l.createdAt).toLocaleString("id-ID")}</td>
                      <td className="py-3 px-5 text-xs font-medium text-text-white">{l.username}</td>
                      <td className="py-3 px-5 text-xs text-text-primary">{l.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={logPage} totalPages={logTotalPages} onPageChange={setLogPage} />
          </>
        )}
      </div>
      <Toast />
    </div>
  );
}
