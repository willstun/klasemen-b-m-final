"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [needsSetup, setNeedsSetup] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Auth check
  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.me();
        if (data.authenticated && data.user) { router.replace("/admin"); return; }
      } catch {}
      try {
        const data = await authApi.checkSetup();
        setNeedsSetup(data.needsSetup);
      } catch { setNeedsSetup(false); }
      setChecking(false);
    })();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setBlocked(false); return; }
    countdownRef.current = setInterval(() => {
      setCountdown((p) => { if (p <= 1) { setBlocked(false); clearInterval(countdownRef.current); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [blocked]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (blocked) return;
    setError(""); setLoading(true);
    try {
      if (needsSetup) { await authApi.register(username, password); }
      else { await authApi.login(username, password); }
      router.replace("/admin");
    } catch (err) {
      const msg = err.message || "Terjadi kesalahan";
      setError(msg);
      if (msg.includes("Terlalu banyak") || msg.includes("Coba lagi dalam")) {
        setBlocked(true); setCountdown(15 * 60);
      }
    } finally { setLoading(false); }
  }

  function formatCountdown(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-main-bg">
        <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 bg-login-input-bg border border-login-input-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 disabled:opacity-50 transition-colors";

  return (
    <div className="min-h-screen flex bg-main-bg">
      {/* ─── Left Panel: Branding ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar-bg relative flex-col items-center justify-center p-12">
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg viewBox="0 0 1024 1024" className="icon w-18 h-18" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M469.572424 567.833954c-10.976147-6.337475-27.610249-7.026433-37.11882-1.53836L122.346765 745.339871c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.026433 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.463521z" fill="#4762AF"></path><path d="M453.301677 881.79141c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 903.677641c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 925.563871c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 627.905475s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198-109.303742-63.563502zM907.273438 699.986581v127.395981l-80.225917 46.660424-41.34695-98.26153 121.572867-75.794875z" fill="#4762AF"></path><path d="M469.572424 440.400221c-10.976147-6.337475-27.610249-7.026433-37.11882-1.538359L122.346765 617.901419c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217l-428.617143-247.463521z" fill="#6D8ACA"></path><path d="M511.443171 825.155244s48.736737 34.849032 78.069382 18.64435c29.332645-16.209401 288.022415-167.860498 288.022415-167.860497l-0.235945-44.277383-365.855852 140.637198v52.856332z" fill="#5D7BC1"></path><path d="M199.175078 592.008848v52.856332l312.423816 180.379723V772.388571l-312.423816-180.379723z" fill="#5D7BC1"></path><path d="M373.3353 846.55071c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 710.934415c-4.5207-2.614267-8.192 0.160442-8.192 6.191189s3.6713 13.047742 8.192 15.65729l207.782341 119.959005c4.5207 2.614267 8.192-0.160442 8.192-6.191189z" fill="#6D8ACA"></path><path d="M469.572424 567.833954c-10.976147-6.337475-27.610249-7.026433-37.11882-1.53836L122.346765 745.339871c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.026433 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.463521z" fill="#4762AF"></path><path d="M453.301677 881.79141c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 903.677641c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 925.563871c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 627.905475s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198-109.303742-63.563502zM907.273438 699.986581v127.395981l-80.225917 46.660424-41.34695-98.26153 121.572867-75.794875z" fill="#4762AF"></path><path d="M469.572424 440.400221c-10.976147-6.337475-27.610249-7.026433-37.11882-1.538359L122.346765 617.901419c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217l-428.617143-247.463521z" fill="#6D8ACA"></path><path d="M511.443171 825.155244s48.736737 34.849032 78.069382 18.64435c29.332645-16.209401 288.022415-167.860498 288.022415-167.860497l-0.235945-44.277383-365.855852 140.637198v52.856332z" fill="#5D7BC1"></path><path d="M199.175078 592.008848v52.856332l312.423816 180.379723V772.388571l-312.423816-180.379723z" fill="#5D7BC1"></path><path d="M373.3353 846.55071c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 710.934415c-4.5207-2.614267-8.192 0.160442-8.192 6.191189s3.6713 13.047742 8.192 15.65729l207.782341 119.959005c4.5207 2.614267 8.192-0.160442 8.192-6.191189z" fill="#6D8ACA"></path><path d="M469.572424 350.259908c-10.976147-6.342194-27.610249-7.031152-37.11882-1.543079L122.346765 527.761106c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.026433 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.458802z" fill="#4762AF"></path><path d="M453.301677 664.212645c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 686.098876c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 707.985106c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 410.32671s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198L116.004571 410.32671zM907.273438 482.412535v127.391262l-80.225917 46.660424-41.34695-98.26153 121.572867-75.790156z" fill="#4762AF"></path><path d="M469.572424 222.821456c-10.976147-6.337475-27.610249-7.026433-37.11882-1.538359L122.346765 400.322654c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217l-428.617143-247.463521zM373.3353 628.971945c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 493.35565c-4.5207-2.614267-8.192 0.160442-8.192 6.191189s3.6713 13.047742 8.192 15.65729L365.1433 635.163134c4.5207 2.614267 8.192-0.160442 8.192-6.191189z" fill="#6D8ACA"></path><path d="M511.443171 607.897364s48.736737 34.853751 78.069382 18.64435c29.332645-16.204682 288.022415-167.860498 288.022415-167.860497l-0.235945-44.277383-365.855852 140.641917v52.851613z" fill="#5D7BC1"></path><path d="M199.175078 374.755687v52.856331l312.423816 180.379724v-52.856332L199.175078 374.755687z" fill="#5D7BC1"></path><path d="M469.572424 132.681143c-10.976147-6.342194-27.610249-7.031152-37.11882-1.543078L122.346765 310.182341c-9.508571 5.488074-8.314691 15.091023 2.661456 21.428498l428.617143 247.46352c10.980866 6.337475 27.614968 7.031152 37.123539 1.53836l310.106839-179.039558c9.508571-5.488074 8.314691-15.091023-2.666175-21.433216l-428.617143-247.458802z" fill="#4762AF"></path><path d="M453.301677 446.63388c5.219097 3.015373 9.461382 10.357972 9.461383 16.388719s-4.242286 8.479853-9.461383 5.464479c-5.223816-3.015373-9.461382-10.357972-9.461382-16.388719s4.237567-8.479853 9.461382-5.464479zM491.208553 468.520111c5.219097 3.015373 9.461382 10.357972 9.461382 16.388718s-4.242286 8.475134-9.461382 5.459761c-5.223816-3.010654-9.461382-10.357972-9.461382-16.384 0-6.030747 4.237567-8.479853 9.461382-5.464479zM529.11071 490.406341c5.223816 3.015373 9.461382 10.357972 9.461382 16.388719 0 6.026028-4.237567 8.475134-9.461382 5.45976-5.219097-3.015373-9.461382-10.357972-9.461383-16.388719 0-6.026028 4.242286-8.475134 9.461383-5.45976z" fill="#448FFF"></path><path d="M116.004571 192.747945s-0.962654 128.495484 0.132129 128.320884c1.090065-0.16988 52.979023 26.741972 52.979024 26.741973l52.922396-53.262157 3.270193-38.237198L116.004571 192.747945zM907.273438 264.83377v127.391262l-80.225917 46.660424-41.34695-98.26153 121.572867-75.790156z" fill="#4762AF"></path><path d="M469.572424 5.242691C458.596276-1.094783 441.962175-1.783742 432.453604 3.704332L122.346765 182.743889c-9.508571 5.492793-8.314691 15.095742 2.661456 21.433217l428.617143 247.463521c10.980866 6.337475 27.614968 7.026433 37.123539 1.538359l310.106839-179.039557c9.508571-5.492793 8.314691-15.095742-2.666175-21.433217L469.572424 5.242691zM373.3353 411.39318c0-6.030747-3.6713-13.047742-8.192-15.657291L157.360959 275.776885c-4.5207-2.614267-8.192 0.165161-8.192 6.191189 0 6.030747 3.6713 13.047742 8.192 15.65729l207.782341 119.963724c4.5207 2.609548 8.192-0.165161 8.192-6.195908z" fill="#6D8ACA"></path></g></svg>
            <h2 className="text-5xl font-bold text-text-white mb-3">Klasemen Devs</h2>
          </div>
          <p className="text-text-primary text-sm leading-relaxed">
            Kelola klasemen lomba, peserta, hadiah, dan pengaturan tampilan website dari satu tempat.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Form ────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            {/* <img src={ADMIN_LOGO_URL} alt="Logo" className="h-12 mx-auto" /> */}
          </div>

          <h1 className="text-2xl font-bold text-text-white mb-2">
            {needsSetup ? "Buat Akun" : "Sign In"}
          </h1>
          <p className="text-text-primary text-sm mb-8">
            {needsSetup ? "Buat akun admin pertama untuk memulai." : "Masukkan username dan password untuk masuk."}
          </p>

          {/* Setup notice */}
          {needsSetup && (
            <div className="bg-brand-muted border border-brand/20 rounded-lg p-3.5 mb-6">
              <p className="text-xs text-brand-light m-0">Belum ada akun admin. Buat akun pertama di bawah ini.</p>
            </div>
          )}

          {/* Blocked notice */}
          {blocked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-red-400 font-semibold mb-1 m-0">Akses login diblokir sementara</p>
              <p className="text-2xl text-red-300 font-bold font-mono m-0 my-2 animate-bounce">{formatCountdown(countdown)}</p>
              <p className="text-xs text-red-400/70 m-0">Terlalu banyak percobaan gagal</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-primary font-medium mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className={inputCls} placeholder="Masukkan username anda" required autoFocus disabled={blocked} />
            </div>

            <div>
              <label className="block text-sm text-text-primary font-medium mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} className={inputCls}
                  placeholder="Masukkan kata sandi anda" required disabled={blocked} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted hover:text-text-primary p-1">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && !blocked && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-xs text-red-400 m-0">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || blocked}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm border-none transition-colors">
              {blocked ? "Login Diblokir" : loading ? "Memproses..." : needsSetup ? "Buat Akun & Masuk" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
