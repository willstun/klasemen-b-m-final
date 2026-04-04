"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#1a1c23", fontFamily: "Outfit, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "32rem" }}>
            <h1 style={{ fontSize: "8rem", fontWeight: 700, lineHeight: 1, color: "#ef4444", letterSpacing: "-0.05em", margin: 0 }}>
              500
            </h1>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#f0f6fc", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
              Internal Server Error
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
              Terjadi kesalahan pada server. Silakan coba lagi atau hubungi administrator.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <button
                onClick={() => reset()}
                style={{ background: "#3b82f6", color: "white", fontSize: "0.875rem", fontWeight: 500, padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}>
                Coba Lagi
              </button>
              <a href="/admin"
                style={{ background: "#1f2937", border: "1px solid #2d3748", color: "#c9d1d9", fontSize: "0.875rem", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}>
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}