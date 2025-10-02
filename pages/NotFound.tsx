import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
        .float-slow { animation: floatY 6s ease-in-out infinite; }
        .float-slower { animation: floatY 8s ease-in-out infinite; }
        .float-slowest { animation: floatY 10s ease-in-out infinite; }
      `}</style>

      {/* Floating job-themed icons */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <svg className="float-slow absolute -left-10 top-24 h-28 w-28 text-indigo-300" viewBox="0 0 64 64" fill="currentColor" aria-hidden>
          <path d="M24 18h16a4 4 0 0 1 4 4v2h6a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V30a6 6 0 0 1 6-6h6v-2a4 4 0 0 1 4-4Zm0 6v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H24Z"/>
        </svg>
        <svg className="float-slowest absolute right-6 top-10 h-24 w-24 text-blue-300" viewBox="0 0 64 64" fill="currentColor" aria-hidden>
          <path d="M28 10h-8a6 6 0 0 0-6 6v32a6 6 0 0 0 6 6h24a6 6 0 0 0 6-6V24L40 10H28Zm14 16h-6a2 2 0 0 1-2-2v-6"/>
        </svg>
        <svg className="float-slower absolute bottom-10 right-20 h-28 w-28 text-sky-300" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="28" cy="28" r="14" />
          <line x1="41" y1="41" x2="56" y2="56" />
        </svg>
      </div>

      <div className="relative mx-4 w-full max-w-2xl">
        <div className="rounded-3xl border border-indigo-100 bg-white/80 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg sm:h-20 sm:w-20">
            <span className="text-2xl font-bold sm:text-3xl">TF</span>
          </div>

          <h1 className="bg-gradient-to-r from-indigo-600 via-sky-600 to-blue-600 bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            404: Page not found
          </h1>
          <p className="mt-3 text-center text-base text-slate-600 sm:text-lg">
            The page you’re looking for doesn’t exist or was moved.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2">
              Go home
              <span className="ml-2 inline-block">→</span>
            </Link>
            <button onClick={() => window.history.back()} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              Go back
            </button>
          </div>

          <div className="mt-8" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
