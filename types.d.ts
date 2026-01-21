export interface Category {
  _count: {
    products: number;
  };
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Product {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  isPremium: boolean;
  images: string[];
  videos: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Enquiry {
  name: string;
  id: string;
  email: string;
  createdAt: Date;
  message: string;
  productId: string;
  product?: {
    id: string;
    title: string;
    slug: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface Contact {
  name: string;
  id: string;
  email: string;
  createdAt: Date;
  message: string;
  organizationName: string;
  contactNumber: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
}

export interface PaginationResponse<T> {
  products?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
