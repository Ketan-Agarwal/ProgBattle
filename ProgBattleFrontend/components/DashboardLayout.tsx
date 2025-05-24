import Sidebar from "./sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:block hidden">
        <Sidebar />
      </div>
      <main className="flex-1 bg-gray-100 min-h-screen p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
