const API_BASE = "https://premunia.cmpremunia.workers.dev";

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ API returned non JSON:", text);
    throw new Error("API error");
  }
}

export const api = {
  health: () => request("/api/health"),
  contracts: () => request("/api/contracts"),
  performance: () => request("/api/commercial-performance"),
  rules: () => request("/api/commission-rules"),
};
