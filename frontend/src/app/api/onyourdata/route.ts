import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getOnYourData } from '../../../util/openai';

export const POST = async (
  req: NextRequest,
) => {
  try {
    const {message} = await req.json();
    
    // OpenAI へのリクエスト
    const result = await getOnYourData(message);
    const aiMessage = result[0].message.content;
    return NextResponse.json({ aiMessage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ aiMessage: error.message }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';