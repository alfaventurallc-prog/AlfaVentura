"use client";

import { useAuth } from "@/hooks/useAuth";
import { authUtils } from "@/lib/auth";
import { FolderOpen, KeyRound, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { LuPackageSearch } from "react-icons/lu";
import { FaPhone, FaPhoneAlt } from "react-icons/fa";
import { logoutUser } from "@/actions/auth";
import { useRouter } from "nextjs-toploader/app";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useAuth();

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      const response = await logoutUser();
      if (response.success) {
        authUtils.clearAuth();
        router.push("/admin/login");
        toast.success("Logout successful");
      } else {
        toast.error(response.error || "Failed to logout");
      }
    } catch (error: any) {
      console.error("Failed to logout:", error);
      toast.error(error.response?.data?.error || "Failed to logout");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: FolderOpen, label: "Categories", href: "/admin/categories" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: LuPackageSearch, label: "Enquiries", href: "/admin/enquiries" },
    { icon: FaPhoneAlt, label: "Contact Us", href: "/admin/contacts" },
    // { icon: Users, label: "Users", href: "/admin/users" },
    { icon: KeyRound, label: "Change password", href: "/admin/change-password" },
  ];

  return (
    <div className="flex flex-col justify-between w-[20%] border-r h-full">
      <h1 className="text-center whitespace-nowrap text-lg lg:text-xl py-5 border-b">Admin Panel</h1>
      <div className="shadow-[inset_-12px_-8px_40px_#46464620] h-full py-10 px-3">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md py-3 px-2 pl-5 transition-all ${
                    isActive ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                >
                  <item.icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User />
          <h1>{user?.name}</h1>
        </div>
        <Button
          onClick={handleLogout}
          className="bg-transparent text-black rounded-full hover:bg-red-500 hover:text-white border border-gray-300 w-fit h-fit p-3"
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
