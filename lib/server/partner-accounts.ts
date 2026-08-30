import { Prisma } from "@prisma/client";
import { normalizeCityId, cityById } from "@/lib/dispatch/cities";
import type { PartnerApproval } from "@/lib/dispatch/types";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/server/auth";
import { partnerToDb } from "@/lib/server/dispatch";
import { toPartner, toPublicUser } from "@/lib/server/mappers";

export type CreatePartnerAccountInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  cityId: string;
  companyName: string;
  address: string;
  approval?: PartnerApproval;
};

export async function createPartnerAccount(input: CreatePartnerAccountInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "exists" as const };
  }

  const partnerId = `p-${Math.random().toString(36).slice(2, 10)}`;
  const cityId = normalizeCityId(input.cityId);
  const city = cityById(cityId);
  const approval = input.approval ?? "pending";

  try {
    await prisma.partner.create({
      data: partnerToDb({
        id: partnerId,
        name: input.companyName.trim(),
        cityId,
        address: input.address.trim(),
        lat: city.lat,
        lng: city.lng,
        serviceRadiusKm: 20,
        serviceCities: [cityId],
        acceptsRemoteDelivery: false,
        printMethods: ["dtg"],
        products: ["tshirt", "hoodie"],
        productionPrices: { tshirt: 90, hoodie: 170 },
        minOrderQty: 1,
        capacityUnits: 30,
        avgProductionHours: 24,
        workingHours: { open: 9, close: 18, days: [1, 2, 3, 4, 5] },
        currentLoad: 0,
        rating: 4,
        qualityScore: 80,
        completionRate: 1,
        cancelRate: 0,
        acceptingOrders: false,
        approval,
        commissionOverride: null,
        createdAt: Date.now(),
      }),
    });

    const user = await prisma.user.create({
      data: {
        role: "partner",
        name: input.name.trim(),
        email,
        phone: input.phone?.trim() ?? "",
        passwordHash: await hashPassword(input.password),
        cityId,
        address: input.address.trim(),
        partnerId,
        provider: "email",
      },
    });

    const partnerRow = await prisma.partner.findUniqueOrThrow({ where: { id: partnerId } });
    return {
      ok: true as const,
      partner: toPartner(partnerRow),
      user: toPublicUser(user),
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false as const, error: "exists" as const };
    }
    throw e;
  }
}
