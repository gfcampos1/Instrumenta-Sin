import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Executar seed usando o arquivo seed.js
    const { stdout, stderr } = await execAsync('node prisma/seed.js', {
      cwd: process.cwd(),
      timeout: 60000, // 60 segundos
      env: { ...process.env }
    });

    return NextResponse.json({
      success: true,
      message: 'Seed executado com sucesso',
      output: stdout,
      details: 'Usuários, devices, badges e configurações criados'
    });
  } catch (error: any) {
    console.error('Seed error:', error);

    // Se o erro é porque já existe dados, considerar sucesso parcial
    if (error.stdout && error.stdout.includes('já existe')) {
      return NextResponse.json({
        success: true,
        message: 'Seed parcial: alguns dados já existem',
        output: error.stdout,
        warning: true
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao executar seed',
        output: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}
