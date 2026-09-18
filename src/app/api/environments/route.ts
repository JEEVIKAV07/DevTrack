import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getMockEnvironments,
  getMockEnvironmentSummary,
  refreshEnvironments,
} from "@/lib/services/mockEnvironments";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "true";

  try {
    if (refresh) {
      refreshEnvironments();
    }

    const [environments, summary] = await Promise.all([
      getMockEnvironments(),
      getMockEnvironmentSummary(),
    ]);

    return NextResponse.json({
      status: "success",
      data: { environments, summary },
    });
  } catch (error) {
    console.error("[API /environments]", error);
    return NextResponse.json(
      { status: "error", error: "Unable to fetch environment data. Please try again." },
      { status: 500 }
    );
  }
}
