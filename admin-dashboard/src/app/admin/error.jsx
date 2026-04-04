"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-white mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {error?.message || "Sesuatu tidak berjalan dengan benar. Silakan coba lagi."}
        </p>
        <button onClick={() => reset()}
          className="bg-brand hover:bg-brand-dark text-white text-sm font-medium px-6 py-3 rounded-lg border-none cursor-pointer transition-colors">
          Coba Lagi
        </button>
      </div>
    </div>
  );
}