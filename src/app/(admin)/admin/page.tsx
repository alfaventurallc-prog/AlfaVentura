import { getCategories } from "@/actions/categories";
import { getContacts } from "@/actions/contact";
import { getEnquiries } from "@/actions/enquiries";
import { getProducts } from "@/actions/products";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminDashboardPage() {
  const [prodRes, catRes, enqRes, conRes] = await Promise.all([
    getProducts(),
    getCategories(),
    getEnquiries(),
    getContacts(),
  ]);

  if (!prodRes.success || !catRes.success || !enqRes.success || !conRes.success) {
    return <div className="mt-4 text-red-600">Failed to load data</div>;
  }

  const products = prodRes.data?.products ?? [];
  const categories = catRes.data?.categories ?? [];
  const enquiries = enqRes.data?.enquiries ?? [];
  const contacts = conRes.data?.contacts ?? [];

  if (!products || !categories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin panel</p>
      </div>

      <AdminDashboard
        products={products}
        categories={categories}
        enquiries={enquiries}
        contacts={contacts}
      />
    </div>
  );
}
