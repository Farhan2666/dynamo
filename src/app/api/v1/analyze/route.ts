import { NextRequest, NextResponse } from "next/server";
import { analyzeContext } from "@/lib/agents/agent1-context";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Prompt must be at least 3 characters" },
        { status: 400 }
      );
    }

    const context = analyzeContext(prompt);

    return NextResponse.json({
      context,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Context analysis failed" },
      { status: 500 }
    );
  }
}
