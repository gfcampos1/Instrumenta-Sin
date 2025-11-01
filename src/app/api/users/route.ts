import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { Prisma, UserRole } from '@prisma/client';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional().default('INSTRUMENTADOR'),
  active: z.boolean().optional().default(true),
});

const listUsersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Math.max(parseInt(value, 10), 1))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Math.min(Math.max(parseInt(value, 10), 1), 100))
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Nao autorizado' }, { status: 403 });
    }

    const url = new URL(request.url);
    const parseResult = listUsersSchema.safeParse(Object.fromEntries(url.searchParams.entries()));

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Parametros invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { search, role, active, page = 1, limit = 20 } = parseResult.data;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (typeof active === 'boolean') {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          active: true,
          points: true,
          level: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              surgeries: true,
              achievements: true,
              notifications: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Nao autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = createUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Dados invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const passwordHash = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role ?? 'INSTRUMENTADOR',
        active: data.active ?? true,
        points: 0,
        level: 1,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
        points: true,
        level: true,
        createdAt: true,
        _count: {
          select: {
            surgeries: true,
            achievements: true,
          },
        },
      },
    });

    await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Bem-vindo ao Instrumenta-Sin!',
          message: 'Complete seu primeiro registro e ganhe 100 pontos!',
          type: 'INFO',
          read: false,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE',
          entity: 'user',
          entityId: user.id,
          changes: {
            new: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              active: user.active,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario criado com sucesso',
        data: user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados invalidos', details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email ja cadastrado' }, { status: 409 });
    }

    console.error('Erro ao criar usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar usuario' },
      { status: 500 }
    );
  }
}
