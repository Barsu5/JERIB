import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { requireUser } from "@/lib/server/auth";
import { dbUnavailable, badRequest, forbidden, unauthorized } from "@/lib/server/db-error";
import {
  adminMarkPayoutPaid,
  adminReassignOrder,
  loadOrder,
  partnerAcceptOrder,
  partnerAdvanceOrder,
  partnerRejectOrder,
  runDispatchTick,
  saveOrder,
} from "@/lib/server/orders";
import {
  confirmPaymentAndDispatch,
  rejectPayment,
  selectPaymentBank,
  submitPaymentReceipt,
} from "@/lib/server/payment";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const order = await loadOrder(id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (user.role === "admin") return NextResponse.json({ order });
  if (user.role === "partner" && order.partnerId === user.partnerId) {
    return NextResponse.json({ order });
  }
  if (user.role === "client" && order.userId === user.id) {
    return NextResponse.json({ order });
  }

  return forbidden();
}

export async function PATCH(req: Request, ctx: Ctx) {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    action?: string;
    partnerId?: string;
    method?: string;
    receiptDataUrl?: string;
    reason?: string;
  };

  switch (body.action) {
    case "accept": {
      if (user.role !== "partner" || !user.partnerId) return forbidden();
      const order = await partnerAcceptOrder(id, user.partnerId);
      if (!order) return badRequest("invalid_state");
      return NextResponse.json({ order });
    }
    case "reject": {
      if (user.role !== "partner" || !user.partnerId) return forbidden();
      const order = await partnerRejectOrder(id, user.partnerId);
      if (!order) return badRequest("invalid_state");
      return NextResponse.json({ order });
    }
    case "advance": {
      if (user.role !== "partner" || !user.partnerId) return forbidden();
      const order = await partnerAdvanceOrder(id, user.partnerId);
      if (!order) return badRequest("invalid_state");
      return NextResponse.json({ order });
    }
    case "reassign": {
      if (user.role !== "admin" || !body.partnerId) return forbidden();
      const order = await adminReassignOrder(id, body.partnerId);
      if (!order) return badRequest("invalid_state");
      return NextResponse.json({ order });
    }
    case "markPaid": {
      if (user.role !== "admin") return forbidden();
      const order = await adminMarkPayoutPaid(id);
      if (!order) return badRequest("invalid_state");
      return NextResponse.json({ order });
    }
    case "selectBank": {
      if (user.role !== "client") return forbidden();
      const order = await loadOrder(id);
      if (!order || order.userId !== user.id) return forbidden();
      const method = body.method as "alif" | "dushanbe_city" | undefined;
      if (method !== "alif" && method !== "dushanbe_city") return badRequest("invalid_bank");
      const next = selectPaymentBank(order, method);
      if (!next) return badRequest("invalid_state");
      await saveOrder(next);
      return NextResponse.json({ order: next });
    }
    case "submitReceipt": {
      if (user.role !== "client") return forbidden();
      const order = await loadOrder(id);
      if (!order || order.userId !== user.id) return forbidden();
      const receiptDataUrl = typeof body.receiptDataUrl === "string" ? body.receiptDataUrl : "";
      const next = submitPaymentReceipt(order, receiptDataUrl);
      if (!next) return badRequest("invalid_state");
      await saveOrder(next);
      return NextResponse.json({ order: next });
    }
    case "confirmPayment": {
      if (user.role !== "admin") return forbidden();
      const order = await confirmPaymentAndDispatch(id);
      if (!order) return badRequest("invalid_state");
      return NextResponse.json({ order });
    }
    case "rejectPayment": {
      if (user.role !== "admin") return forbidden();
      const order = await loadOrder(id);
      if (!order) return badRequest("not_found");
      const next = rejectPayment(order, typeof body.reason === "string" ? body.reason : undefined);
      if (!next) return badRequest("invalid_state");
      await saveOrder(next);
      return NextResponse.json({ order: next });
    }
    case "tick": {
      if (user.role !== "admin") return forbidden();
      const orders = await runDispatchTick();
      return NextResponse.json({ orders });
    }
    default:
      return badRequest("unknown_action");
  }
}
