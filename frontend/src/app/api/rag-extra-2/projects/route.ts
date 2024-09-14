import { ProjectListResponse } from '@/types/types';
import { NextResponse } from 'next/server';

/**
 * RAG extra 2 用のAPIルート
 */
export const GET = async () => {
  try {
    console.log('🚀RAG-extra-2用のAPIルート');

    const results = await fetch('http://localhost:7071/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const res: ProjectListResponse = await results.json();
    return NextResponse.json(res, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
