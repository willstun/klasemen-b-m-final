"use client";
import { useEffect, useState } from "react";
import { authApi, userApi, uploadApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const { show: showToast, Toast } = useToast();

  useEffect(() => {
    authApi.me().then((d) => {
      if (d.user) { setUser(d.user); setUsername(d.user.username || ""); setEmail(d.user.email || ""); }
    }).catch(() => {});
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      const body = { username, email };
      if (password) body.password = password;
      await userApi.update(body);
      setPassword("");
      showToast("Profil diperbarui!");
      const { user: updated } = await authApi.me();
      if (updated) setUser(updated);
    } catch (err) { showToast(err.message); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadApi.file(fd, "avatars");
      await userApi.update({ avatarUrl: url });
      setUser((prev) => ({ ...prev, avatarUrl: url }));
      showToast("Foto profil diperbarui!");
    } catch (err) { showToast(err.message); }
    finally { setUploading(false); }
  }

  if (!user) return <div className="p-8 text-text-muted">Memuat...</div>;

  const inputCls = "w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors";

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-white">Profil Saya</h1>
        <p className="text-sm text-text-muted mt-1">Edit informasi akun</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-8 text-center">
          <div className="w-28 h-28 rounded-full mx-auto mb-5 overflow-hidden bg-brand-muted flex items-center justify-center ring-4 ring-brand/10">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand font-bold text-3xl">{user.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <p className="font-semibold text-lg text-text-white mb-1">{user.username}</p>
          <p className="text-xs text-text-muted mb-6">{user.email || "Belum ada email"}</p>

          <label className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer transition-colors">
            {uploading ? "Mengupload..." : "Upload Foto"}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2 bg-card-bg border border-card-border rounded-2xl p-8">
          <h2 className="text-text-white font-semibold text-lg mb-6">Edit Profil</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm text-text-primary font-medium mb-2">Username</label>
              <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-text-primary font-medium mb-2">Email</label>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm text-text-primary font-medium mb-2">Password Baru</label>
              <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kosongkan jika tidak ingin ganti" />
            </div>
            <button type="submit" className="bg-brand hover:bg-brand-dark text-white text-sm font-medium px-6 py-3 rounded-lg cursor-pointer border-none transition-colors">
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
      <Toast />
    </div>
  );
}
