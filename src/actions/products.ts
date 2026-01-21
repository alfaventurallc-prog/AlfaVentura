"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts(params?: { page?: number; limit?: number; search?: string; categoryId?: string }) {
  try {
    const { page = 1, limit = 10, search, categoryId } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        // skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "Failed to fetch product",
    };
  }
}

export async function getProductsByCategorySlug(categorySlug: string, params?: { page?: number; limit?: number }) {
  try {
    const { page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        subcategories: {
          select: { id: true },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    const categoryIds = [category.id];
    if (category.subcategories.length > 0) {
      categoryIds.push(...category.subcategories.map((sub) => sub.id));
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
        },
        // skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              parentId: true,
              parent: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({
        where: {
          categoryId: { in: categoryIds },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        products,
        category,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}

export async function getCategoriesForProducts() {
  try {
    const mainCategories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const flatCategories: Array<{
      id: string;
      name: string;
      slug: string;
      isSubcategory: boolean;
      parentName?: string;
    }> = [];

    mainCategories.forEach((main) => {
      flatCategories.push({
        id: main.id,
        name: main.name,
        slug: main.slug,
        isSubcategory: false,
      });

      main.subcategories.forEach((sub) => {
        flatCategories.push({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          isSubcategory: true,
          parentName: main.name,
        });
      });
    });

    return {
      success: true,
      data: {
        hierarchical: mainCategories,
        flat: flatCategories,
      },
    };
  } catch (error) {
    console.error("Error fetching categories for products:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

export async function createProduct(productData: any) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingProduct) {
      return {
        success: false,
        error: "Product with this slug already exists",
      };
    }

    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return {
      success: true,
      data: product,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Failed to create product",
    };
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (productData.slug && productData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (slugExists) {
        return {
          success: false,
          error: "Product with this slug already exists",
        };
      }
    }

    if (productData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: productData.categoryId },
      });

      if (!category) {
        return {
          success: false,
          error: "Category not found",
        };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return {
      success: true,
      data: product,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Failed to update product",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product",
    };
  }
}
