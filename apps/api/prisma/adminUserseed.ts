import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "keshabadmin@gmail.com";


  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }


  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
