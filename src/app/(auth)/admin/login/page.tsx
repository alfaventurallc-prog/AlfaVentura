import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 border rounded-2xl p-10 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access the admin panel</p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
