"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getContacts(params?: { page?: number; limit?: number; search?: string }) {
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

    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        // skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      success: true,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return {
      success: false,
      error: "Failed to fetch contacts",
    };
  }
}

export async function createContact(contactData: any) {
  try {
    const contact = await prisma.contact.create({
      data: contactData,
    });

    revalidatePath("/admin/contacts");

    return {
      success: true,
      data: contact,
      message: "Contact request submitted successfully",
    };
  } catch (error) {
    console.error("Error creating contact:", error);
    return {
      success: false,
      error: "Failed to submit contact request",
    };
  }
}

export async function deleteContact(id: string) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return {
        success: false,
        error: "Contact not found",
      };
    }

    await prisma.contact.delete({
      where: { id },
    });

    revalidatePath("/admin/contacts");

    return {
      success: true,
      message: "Contact deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return {
      success: false,
      error: "Failed to delete contact",
    };
  }
}
