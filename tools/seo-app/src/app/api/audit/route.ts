import { NextRequest, NextResponse } from "next/server";
import { analyzePage } from "@/lib/seoAnalyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUrl: string = body.url ?? "";

    if (!rawUrl) {
      return NextResponse.json({ error: "URL ist erforderlich." }, { status: 400 });
    }

    let url = rawUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Ungültige URL." }, { status: 400 });
    }

    const result = await analyzePage(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: `Analyse fehlgeschlagen: ${message}` },
      { status: 500 }
    );
  }
}
