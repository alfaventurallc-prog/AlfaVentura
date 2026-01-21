import Sidebar from "@/components/admin/Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="p-10 h-screen overflow-auto w-full">{children}</main>
    </div>
  );
}
