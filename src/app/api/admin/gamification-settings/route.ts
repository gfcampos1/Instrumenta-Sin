import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const DEFAULT_SETTINGS = {
  baseSurgeryPoints: 10,
  photoBonusThreshold: 3,
  photoBonusPoints: 5,
  successBonusPoints: 5,
  goodRatingThreshold: 4,
  goodRatingBonus: 3,
  detailedFeedbackMinLength: 50,
  detailedFeedbackBonus: 5,
  deviceCooldownHours: 24,
  maxDailyUsageSameDevice: 2,
  sameLocationToleranceKm: 1,
  minMinutesBetweenScans: 10,
  pointsDecayEnabled: true,
  firstUsePoints: 100,
  secondUsePointsPercent: 50,
  thirdUsePointsPercent: 0,
};

// GET - Obter configurações
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      );
    }

    // Buscar configurações
    const settings = await prisma.gamificationSettings.findUnique({
      where: { key: 'gamification_rules' },
    });

    return NextResponse.json({
      success: true,
      data: settings?.value || DEFAULT_SETTINGS,
    });
  } catch (error: any) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

// POST - Atualizar configurações
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Atualizar ou criar configurações
    const settings = await prisma.gamificationSettings.upsert({
      where: { key: 'gamification_rules' },
      update: {
        value: body,
        updatedBy: session.user.id,
      },
      create: {
        key: 'gamification_rules',
        value: body,
        description: 'Regras de gamificação e pontuação',
        updatedBy: session.user.id,
      },
    });

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'GamificationSettings',
        entityId: settings.id,
        changes: body,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings.value,
    });
  } catch (error: any) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
}
