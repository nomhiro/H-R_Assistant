import { NextResponse } from "next/server";

export async function GET() {
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];
  return NextResponse.json(allowedEmails);
}
