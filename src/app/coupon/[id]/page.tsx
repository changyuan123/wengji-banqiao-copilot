import { CouponTicket } from "@/components/CouponTicket";

export const dynamic = "force-dynamic";

export default async function CouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CouponTicket couponId={id} />;
}
