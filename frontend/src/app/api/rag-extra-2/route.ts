import { NextResponse } from 'next/server';

/**
 * RAG extra 2 用のAPIルート
 */
export const GET = async () => {
  try {
    console.log('🚀RAG-extra-2用のAPIルート');
    // OpenAIによる自然言語処理
    return NextResponse.json({ result: 'rag-extra-2' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
