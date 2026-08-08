import { BagTicket } from "@/components/BagTicket";

export const dynamic = "force-dynamic";

export default async function BagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BagTicket reservationId={id} />;
}
