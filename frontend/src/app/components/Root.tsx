import { Outlet, Link, useLocation } from "react-router";
import { Plane } from "lucide-react";

export function Root() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="size-6 text-white" />
            </div>
            <span className="text-2xl text-slate-900">World Plane, Inc.</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  );
}