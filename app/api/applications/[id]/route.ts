import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const application = dataStore.getApplicationById(id);

  if (!application) {
    return NextResponse.json(
      { error: "Application not found", id },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    application,
  });
}
