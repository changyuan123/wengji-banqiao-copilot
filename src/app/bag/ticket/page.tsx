import { BagTicket } from "@/components/BagTicket";

export const dynamic = "force-dynamic";

export default async function BagTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;
  return <BagTicket ticketToken={sp.t || ""} />;
}
