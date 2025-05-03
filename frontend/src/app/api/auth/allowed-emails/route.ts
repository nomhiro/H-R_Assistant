import { NextResponse } from "next/server";
import { getAllAccounts } from "../../../../util/cosmos/account";

export async function GET() {
  try {
    const accounts = await getAllAccounts();
    const allowedEmails = accounts.map(account => account.email);
    console.log("🚀Allowed emails retrieved successfully:", allowedEmails);
    return NextResponse.json(allowedEmails);
  } catch (error) {
    console.error("Error retrieving allowed emails:", error);
    return NextResponse.json({ error: "Failed to retrieve allowed emails" }, { status: 500 });
  }
}