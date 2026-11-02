import { NextRequest } from "next/server";
import { GET as applicationsGet, POST as applicationsPost } from "@/app/api/applications/route";

export async function GET(request: NextRequest) {
  return applicationsGet(request);
}

export async function POST(request: NextRequest) {
  return applicationsPost(request);
}
