import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const backendRes = await fetch(
    `http://localhost:8080/backend-universite/api/professeurs/search?q=${encodeURIComponent(q)}`,
    { headers: { "Content-Type": "application/json" } }
  );

  const data = await backendRes.json();
  return NextResponse.json(data);
}