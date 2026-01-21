"use client";

import { FolderOpen, Package } from "lucide-react";
import { FaPhoneAlt } from "react-icons/fa";
import { LuPackageSearch } from "react-icons/lu";
import { Category, Contact, Enquiry, Product } from "../../../types";
import { Badge } from "../ui/badge";

const AdminDashboard = ({
  products,
  categories,
  enquiries,
  contacts,
}: {
  products: Product[];
  categories: Category[];
  enquiries: Enquiry[];
  contacts: Contact[];
}) => {
  const statCards = [
    {
      title: "Total Products",
      value: products ? products.length : 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Categories",
      value: categories ? categories.length : 0,
      icon: FolderOpen,
      color: "bg-green-500",
    },
    {
      title: "Total Enquiries",
      value: enquiries ? enquiries.length : 0,
      icon: LuPackageSearch,
      color: "bg-yellow-500",
    },
    {
      title: "Total Contact Us Requests",
      value: contacts ? contacts.length : 0,
      icon: FaPhoneAlt,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg shadow-lg p-6 pr-2"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr />

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
          </div>
          <div className="p-6">
            {Array.isArray(products) && products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product: Product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.category?.name}</p>
                    </div>
                    <Badge variant={product.isPremium ? "default" : "secondary"}>
                      {product.isPremium ? "Premium" : "Normal"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No products found</p>
            )}
          </div>
        </div>

        {/* Recent Categories */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Categories</h3>
          </div>
          <div className="p-6">
            {Array.isArray(categories) && categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category: Category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories found</p>
            )}
          </div>
        </div>

        {/* Recent Product Enquiries */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Product Enquiries</h3>
          </div>
          <div className="p-6">
            {Array.isArray(enquiries) && enquiries.length > 0 ? (
              <div className="space-y-4">
                {enquiries.map((enquiry: Enquiry) => (
                  <div
                    key={enquiry.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{enquiry.product!.title}</p>
                      <p className="text-sm text-gray-500">{enquiry.product!.category?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories found</p>
            )}
          </div>
        </div>

        {/* Recent Contacct Us Requests */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Contact Us Requests</h3>
          </div>
          <div className="p-6">
            {Array.isArray(contacts) && contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact: Contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No contact requests found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
