import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;

    // Buscar informações do banco
    const tablesResult = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    const userCount = await prisma.user.count();
    const surgeryCount = await prisma.surgery.count();
    const deviceCount = await prisma.device.count();

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        tables: tablesResult.length,
        tableNames: tablesResult.map((t) => t.tablename)
      },
      stats: {
        users: userCount,
        surgeries: surgeryCount,
        devices: deviceCount
      }
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao verificar saúde do banco'
      },
      { status: 500 }
    );
  }
}
