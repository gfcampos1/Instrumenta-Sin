import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Adicionar check do Prisma quando configurado
    // await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'instrumenta-sin'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
