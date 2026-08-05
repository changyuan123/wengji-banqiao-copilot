export type WeatherPayload = {
  tempC: number;
  description: string;
  icon: string;
  precipProb: number | null;
  isFallback: boolean;
  district: string;
  fetchedAt: string;
};

const WMO: Record<number, { description: string; icon: string }> = {
  0: { description: "晴朗", icon: "☀️" },
  1: { description: "大致晴朗", icon: "🌤️" },
  2: { description: "多雲", icon: "⛅" },
  3: { description: "陰天", icon: "☁️" },
  45: { description: "有霧", icon: "🌫️" },
  48: { description: "霧凇", icon: "🌫️" },
  51: { description: "毛毛雨", icon: "🌦️" },
  53: { description: "細雨", icon: "🌦️" },
  55: { description: "濃毛毛雨", icon: "🌧️" },
  61: { description: "小雨", icon: "🌧️" },
  63: { description: "中雨", icon: "🌧️" },
  65: { description: "大雨", icon: "🌧️" },
  80: { description: "陣雨", icon: "🌦️" },
  81: { description: "強陣雨", icon: "🌧️" },
  82: { description: "豪雨", icon: "⛈️" },
  95: { description: "雷雨", icon: "⛈️" },
};

export function describeWmo(code: number) {
  return WMO[code] ?? { description: "多雲", icon: "⛅" };
}

/** 板橋氣候模擬：API 失敗時仍給店長可用的真實感數值 */
export function simulateBanqiaoWeather(): WeatherPayload {
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();

  let tempC = 26;
  if (month >= 12 || month <= 2) tempC = 16 + (hour > 14 ? 2 : 0);
  else if (month >= 3 && month <= 5) tempC = 22 + (hour > 12 ? 3 : 0);
  else if (month >= 6 && month <= 9) tempC = 29 + (hour > 12 ? 2 : 0);
  else tempC = 23 + (hour > 14 ? 1 : 0);

  const rainySeason = month >= 5 && month <= 9;
  const evening = hour >= 17 && hour <= 22;
  const precipProb = rainySeason ? (evening ? 55 : 35) : evening ? 25 : 10;
  const isRain = precipProb >= 45 || (month >= 11 && month <= 2 && evening && tempC <= 18);

  return {
    tempC,
    description: isRain ? "降雨" : tempC <= 18 ? "稍涼" : "多雲",
    icon: isRain ? "🌧️" : tempC <= 18 ? "🌥️" : "⛅",
    precipProb,
    isFallback: true,
    district: "板橋",
    fetchedAt: now.toISOString(),
  };
}

export async function fetchBanqiaoWeather(
  lat: number,
  lon: number,
): Promise<WeatherPayload> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,precipitation` +
    `&hourly=precipitation_probability` +
    `&timezone=Asia%2FTaipei&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

  const data = (await res.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
    };
    hourly?: {
      time?: string[];
      precipitation_probability?: number[];
    };
  };

  const temp = data.current?.temperature_2m;
  const code = data.current?.weather_code ?? 2;
  if (typeof temp !== "number") throw new Error("Missing temperature");

  const meta = describeWmo(code);
  let precipProb: number | null = null;
  const times = data.hourly?.time ?? [];
  const probs = data.hourly?.precipitation_probability ?? [];
  if (times.length && probs.length) {
    const nowIso = new Date().toISOString().slice(0, 13);
    const idx = times.findIndex((t) => t.startsWith(nowIso) || t.includes("T" + String(new Date().getHours()).padStart(2, "0")));
    const i = idx >= 0 ? idx : 0;
    precipProb = typeof probs[i] === "number" ? probs[i] : null;
  }

  return {
    tempC: Math.round(temp),
    description: meta.description,
    icon: meta.icon,
    precipProb,
    isFallback: false,
    district: "板橋",
    fetchedAt: new Date().toISOString(),
  };
}
