import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_PARTNERS } from "../lib/dispatch/partners";
import { DEFAULT_SETTINGS } from "../lib/dispatch/types";
import { partnerToDb } from "../lib/server/dispatch";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  await prisma.platformSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...DEFAULT_SETTINGS },
    update: DEFAULT_SETTINGS,
  });

  for (const partner of SEED_PARTNERS) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      create: partnerToDb(partner),
      update: partnerToDb(partner),
    });
  }

  const demoPass = await bcrypt.hash("demo123", 12);

  const users = [
    {
      id: "u-admin",
      role: "admin" as const,
      name: "JIRIB Admin",
      email: "admin@jerib.tj",
      phone: "+10000000001",
      passwordHash: demoPass,
      cityId: "tj_dushanbe",
      address: "JIRIB HQ, Душанбе",
      partnerId: null,
      provider: "email" as const,
      providerId: null,
    },
    {
      id: "u-client-demo",
      role: "client" as const,
      name: "Demo Client",
      email: "client@jerib.tj",
      phone: "+10000000010",
      passwordHash: demoPass,
      cityId: "tj_dushanbe",
      address: "ул. Рудаки 10, Душанбе",
      partnerId: null,
      provider: "email" as const,
      providerId: null,
    },
    {
      id: "u-partner-demo",
      role: "partner" as const,
      name: "Atlas Manager",
      email: "partner@jerib.tj",
      phone: "+10000000020",
      passwordHash: demoPass,
      cityId: "tj_dushanbe",
      address: "ул. Рудаки 45, Душанбе",
      partnerId: "p-us-atlas",
      provider: "email" as const,
      providerId: null,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: user,
      update: user,
    });
  }

  console.log("Seed complete.");
  console.log("Demo accounts: client@jerib.tj / partner@jerib.tj / admin@jerib.tj — password: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
