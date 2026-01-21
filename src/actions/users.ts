"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserPassword(id: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: "Failed to update password",
    };
  }
}
