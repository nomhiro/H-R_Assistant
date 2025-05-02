import { NextResponse } from "next/server";

// hello worldのAPI
export const GET = async () => {
  try {
    return NextResponse.json({ message: "Hello, world!" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in HelloWorld API:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};