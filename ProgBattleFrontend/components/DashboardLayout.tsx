import Sidebar from "./sidebar";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-100 min-h-screen p-6">{children}</main>
      </div>
    );
  }