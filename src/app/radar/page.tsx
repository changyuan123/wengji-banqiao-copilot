import type { Metadata } from "next";
import { CompetitorFeedApp } from "@/components/CompetitorFeed";

export const metadata: Metadata = {
  title: "競品動態｜翁記麻辣鍋板橋店",
  description: "篤行路商圈競品情報流，給門市老闆快速掃過",
};

export default function RadarPage() {
  return <CompetitorFeedApp />;
}
