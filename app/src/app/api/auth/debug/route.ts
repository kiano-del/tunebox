import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export async function GET(req: Request) {
  const token = await getToken({ req: req as any, raw: false });
  return NextResponse.json({ token });
}
