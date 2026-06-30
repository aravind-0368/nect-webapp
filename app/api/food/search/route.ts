import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";

  if (!query.trim()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query,
      )}&search_simple=1&action=process&json=1&page_size=24`,
      {
        headers: {
          "User-Agent": "NectApp - Server - Version 1.0 - https://github.com/aravind-0368/nect-app"
        }
      }
    );
    
    if (!res.ok) {
      return NextResponse.json({ error: `Open Food Facts responded with status ${res.status}` }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching food data server-side:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch from Open Food Facts" }, { status: 500 });
  }
}
