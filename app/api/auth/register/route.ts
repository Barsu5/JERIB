import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeCityId } from "@/lib/dispatch/cities";
import { prisma, hasDatabase } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/server/auth";
import { dbUnavailable, badRequest } from "@/lib/server/db-error";
import { toPublicUser } from "@/lib/server/mappers";
import { partnerToDb } from "@/lib/server/dispatch";

const clientSchema = z.object({
  role: z.literal("client").optional(),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(6),
  cityId: z.string().min(1),
  address: z.string().trim().optional(),
});

const partnerSchema = z.object({
  role: z.literal("partner"),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(6),
  cityId: z.string().min(1),
  companyName: z.string().trim().min(1),
  address: z.string().trim().min(1),
});

export async function POST(req: Request) {
  if (!hasDatabase()) return dbUnavailable();

  try {
    const body = await req.json();
    const isPartner = body?.role === "partner";
    const parsed = isPartner ? partnerSchema.safeParse(body) : clientSchema.safeParse(body);
    if (!parsed.success) return badRequest("invalid", parsed.error.flatten());

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "exists" }, { status: 409 });

    const passwordHash = await hashPassword(parsed.data.password);

    if (isPartner) {
      const data = parsed.data as z.infer<typeof partnerSchema>;
      const partnerId = `p-${Math.random().toString(36).slice(2, 10)}`;
      const cityId = normalizeCityId(data.cityId);
      const { cityById } = await import("@/lib/dispatch/cities");
      const city = cityById(cityId);

      await prisma.partner.create({
        data: partnerToDb({
          id: partnerId,
          name: data.companyName.trim(),
          cityId,
          address: data.address.trim(),
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
          approval: "pending",
          commissionOverride: null,
          createdAt: Date.now(),
        }),
      });

      const user = await prisma.user.create({
        data: {
          role: "partner",
          name: data.name.trim(),
          email,
          phone: data.phone?.trim() ?? "",
          passwordHash,
          cityId,
          address: data.address.trim(),
          partnerId,
          provider: "email",
        },
      });

      await setSessionCookie(user.id);
      return NextResponse.json({ user: toPublicUser(user) });
    }

    const data = parsed.data;
    const user = await prisma.user.create({
      data: {
        role: "client",
        name: data.name.trim(),
        email,
        phone: data.phone?.trim() ?? "",
        passwordHash,
        cityId: normalizeCityId(data.cityId),
        address: data.address?.trim() ?? "",
        provider: "email",
      },
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "exists" }, { status: 409 });
    }
    console.error("register error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
