import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Users, ClipboardList, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Assessments", href: "/assessments", icon: ClipboardList },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="fixed h-screen w-64 bg-[#1F2937] border-r border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-[#3B82F6]" />
            TalentFlow
          </h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/" && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#3B82F6] text-white shadow-md"
                    : "text-[#D1D5DB] hover:bg-[#374151] hover:text-white"
                )}
              >
                <motion.div whileHover={{ scale: 1.1, x: 5 }} whileTap={{ scale: 0.9 }}>
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            © 2025 TalentFlow
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pl-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
