import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1c23] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="flex flex-col md:flex-row items-center justify-center">
          <Image src={'/assets/not-found.png'} alt="not found" width={200} height={200} className="order-2 md:order-1" />
          <h1 className="text-6xl md:text-9xl font-bold leading-none text-[#3b82f6] tracking-tight order-1 md:order-2">
            404
          </h1>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-text-white mt-2 mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-text-primary mb-8 leading-relaxed">
          We can’t seem to find the page you are looking for!
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/admin"
            className="bg-[#3b82f6] hover:bg-brand-dark text-white text-sm font-medium px-6 py-3 rounded-lg no-underline transition-colors">
            Kembali ke Dashboard
          </Link>
          <Link href="/login"
            className="bg-[#1f2937] border border-[#2d3748] text-[#c9d1d9] text-sm px-6 py-3 rounded-lg no-underline hover:border-[#3b82f6]/30 hover:text-white transition-colors">
            Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}