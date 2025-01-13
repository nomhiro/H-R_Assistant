import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getInferenceRAG } from "@/util/generate";

export const POST = async (req: NextRequest) => {
  try {
    const { message } = await req.json()
    const aiMessage = await getInferenceRAG(message)
    return NextResponse.json({ aiMessage }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ aiMessage: error.message }, { status: 500 })
  }
}