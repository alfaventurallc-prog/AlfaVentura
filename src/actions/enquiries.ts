"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notifyLead } from "@/lib/leadNotify";
import { productPath } from "@/lib/seo";

export async function getEnquiries(params?: { page?: number; limit?: number; search?: string }) {
  try {
    const { page = 1, limit = 10, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [enquiries, totalCount] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        // skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              categoryId: true,
              category: {
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
      prisma.enquiry.count({ where }),
    ]);

    return {
      success: true,
      data: {
        enquiries,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return {
      success: false,
      error: "Failed to fetch enquiries",
    };
  }
}

export async function createEnquiry(enquiryData: any) {
  try {
    const enquiry = await prisma.enquiry.create({
      data: enquiryData,
      include: { product: { select: { title: true, slug: true, id: true } } },
    });

    revalidatePath("/admin/enquiries");

    const message: string = enquiry.message ?? "";
    await notifyLead({
      kind: message.startsWith("I would like to request a sample")
        ? "Sample request"
        : message.startsWith("Quote request for this")
          ? "Visualizer quote request"
          : "Product enquiry",
      name: enquiry.name,
      email: enquiry.email,
      product: enquiry.product ? { title: enquiry.product.title, path: productPath(enquiry.product) } : undefined,
      message,
    });

    return {
      success: true,
      data: enquiry,
      message: "Enquiry submitted successfully",
    };
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return {
      success: false,
      error: "Failed to submit enquiry",
    };
  }
}

export async function deleteEnquiry(id: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return {
        success: false,
        error: "Enquiry not found",
      };
    }

    await prisma.enquiry.delete({
      where: { id },
    });

    revalidatePath("/admin/enquiries");

    return {
      success: true,
      message: "Enquiry deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return {
      success: false,
      error: "Failed to delete enquiry",
    };
  }
}
