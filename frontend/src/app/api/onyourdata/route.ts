import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOnYourData } from "@/util/generate";

export const POST = async (req: NextRequest) => {
  try {
    const { message } = await req.json();
    console.log("Received message:", message);

    if (typeof message !== 'string' || message.trim() === '') {
      throw new TypeError('Invalid message type or empty message');
    }

    const aiMessage = await getOnYourData(message);
    return NextResponse.json({ aiMessage }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ aiMessage: error }, { status: 500 });
  }
};