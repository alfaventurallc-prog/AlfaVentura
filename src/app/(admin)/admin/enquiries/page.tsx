import { getCategories } from "@/actions/categories";
import { getEnquiries } from "@/actions/enquiries";
import EnquiriesSection from "@/components/admin/EnquiriesSection";

const EnquiriesPage = async () => {
  const [enqRes, catRes] = await Promise.all([getEnquiries(), getCategories()]);

  if (!enqRes.success || !catRes.success) {
    return <div className="mt-4 text-red-600">Failed to load enquiries or categories</div>;
  }

  const enquiries = enqRes.data?.enquiries ?? [];
  const categories = catRes.data?.categories ?? [];

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Enquiries</h1>
          <p className="text-gray-600">View all enquiries asked by people related to your products</p>
        </div>
      </div>
      {enquiries.length === 0 ? (
        <div className="mt-4 text-gray-600">No enquiries found</div>
      ) : (
        <EnquiriesSection
          enquiries={enquiries ?? []}
          categories={categories ?? []}
        />
      )}
    </div>
  );
};

export default EnquiriesPage;
