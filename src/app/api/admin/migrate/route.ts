import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Buscar status das migrations
    try {
      const { stdout } = await execAsync('npx prisma migrate status', {
        cwd: process.cwd()
      });

      return NextResponse.json({
        success: true,
        status: stdout,
        message: 'Status das migrations obtido com sucesso'
      });
    } catch (error: any) {
      // Pode dar erro se não houver migrations ainda
      return NextResponse.json({
        success: true,
        status: error.stdout || error.stderr || 'Nenhuma migration encontrada',
        message: 'Status verificado'
      });
    }
  } catch (error: any) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao verificar status das migrations'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Executar db push (usado no projeto)
    const { stdout, stderr } = await execAsync(
      'npx prisma db push --skip-generate --accept-data-loss',
      {
        cwd: process.cwd(),
        timeout: 60000 // 60 segundos
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Schema aplicado ao banco com sucesso',
      output: stdout,
      migrations: ['Schema sincronizado via db push']
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao aplicar migrations',
        output: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}
