import { hashPassword } from "../src/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword("admin123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@alfaventura.com" },
    update: {},
    create: {
      email: "admin@alfaventura.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
