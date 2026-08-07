import { competitors, type Competitor } from "@/data/competitors";

export type FeedItem = {
  id: string;
  competitorId: string;
  storeName: string;
  shortName: string;
  tag: string;
  text: string;
  publishedAt: string;
  source: "news" | "intel";
  url?: string;
};

function stripHtml(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseRssItems(xml: string): { title: string; link: string; pubDate: string }[] {
  const items: { title: string; link: string; pubDate: string }[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks.slice(0, 5)) {
    const title = stripHtml((block.match(/<title>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "");
    const link = stripHtml((block.match(/<link>([\s\S]*?)<\/link>/i) ?? [])[1] ?? "");
    const pubDate = stripHtml((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) ?? [])[1] ?? "");
    if (title) items.push({ title, link, pubDate });
  }
  return items;
}

async function fetchGoogleNews(query: string): Promise<FeedItem[]> {
  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` +
    `&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
  const res = await fetch(url, {
    headers: { "User-Agent": "WengjiBanqiaoCopilot/1.0" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRssItems(xml).map((it, idx) => ({
    id: `news-${Buffer.from(`${query}|${it.link}|${idx}`).toString("base64url").slice(0, 24)}`,
    competitorId: "",
    storeName: "",
    shortName: "",
    tag: "公開新聞",
    text: it.title,
    publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
    source: "news" as const,
    url: it.link || undefined,
  }));
}

function intelToFeed(c: Competitor): FeedItem[] {
  return c.intelNotes.map((n, i) => ({
    id: `intel-${c.id}-${i}`,
    competitorId: c.id,
    storeName: c.name,
    shortName: c.shortName,
    tag: n.tag,
    text: `${n.text}（${c.price}｜${c.address}）`,
    publishedAt: new Date(`${n.at}T12:00:00+08:00`).toISOString(),
    source: "intel" as const,
  }));
}

export async function buildCompetitorFeed(): Promise<{
  items: FeedItem[];
  fetchedAt: string;
  sources: { news: number; intel: number };
}> {
  const intelItems = competitors.flatMap(intelToFeed);
  const newsItems: FeedItem[] = [];

  await Promise.all(
    competitors.map(async (c) => {
      for (const q of c.searchQueries.slice(0, 1)) {
        try {
          const rows = await fetchGoogleNews(q);
          for (const row of rows.slice(0, 3)) {
            newsItems.push({
              ...row,
              id: `${c.id}-${row.id}`,
              competitorId: c.id,
              storeName: c.name,
              shortName: c.shortName,
              tag: `${c.shortName}・公開動態`,
            });
          }
        } catch {
          /* ignore single query failure */
        }
      }
    }),
  );

  const merged = [...newsItems, ...intelItems].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

  // 去重：相同標題只留一筆
  const seen = new Set<string>();
  const items = merged.filter((it) => {
    const key = it.text.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    items,
    fetchedAt: new Date().toISOString(),
    sources: { news: newsItems.length, intel: intelItems.length },
  };
}

export function relativeTimeZh(iso: string): string {
  const t = +new Date(iso);
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "剛剛";
  if (m < 60) return `${m} 分鐘前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小時前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(iso).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
}
