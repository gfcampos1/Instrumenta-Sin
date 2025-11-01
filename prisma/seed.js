const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Verificar se já existe usuário admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('⚠️  Usuário admin já existe, pulando seed');
    return;
  }

  // Criar usuários
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sintegra.com',
      passwordHash: adminPassword,
      name: 'Administrador Sintegra',
      role: 'ADMIN',
      phone: '+55 11 99999-0000',
      active: true,
      points: 0,
      level: 1,
    },
  });

  const instrumentador1 = await prisma.user.create({
    data: {
      email: 'joao@sintegra.com',
      passwordHash: userPassword,
      name: 'João Silva',
      role: 'INSTRUMENTADOR',
      phone: '+55 11 98888-1111',
      active: true,
      points: 350,
      level: 2,
    },
  });

  const instrumentador2 = await prisma.user.create({
    data: {
      email: 'maria@sintegra.com',
      passwordHash: userPassword,
      name: 'Maria Santos',
      role: 'INSTRUMENTADOR',
      phone: '+55 11 97777-2222',
      active: true,
      points: 820,
      level: 3,
    },
  });

  console.log('✅ Usuários criados:', { admin, instrumentador1, instrumentador2 });

  // Criar devices
  const device1 = await prisma.device.create({
    data: {
      barcode: '7891234567890',
      name: 'Prótese de Quadril Premium',
      category: 'ORTOPEDIA',
      manufacturer: 'Sintegra Medical',
      model: 'SQ-2024',
      lotNumber: 'LOT2024001',
      description: 'Prótese de quadril de última geração',
      active: true,
    },
  });

  const device2 = await prisma.device.create({
    data: {
      barcode: '7891234567891',
      name: 'Stent Cardíaco',
      category: 'CARDIOLOGIA',
      manufacturer: 'Sintegra Cardio',
      model: 'SC-100',
      lotNumber: 'LOT2024002',
      description: 'Stent para angioplastia',
      active: true,
    },
  });

  console.log('✅ Dispositivos criados:', { device1, device2 });

  // Criar badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Primeira Cirurgia',
        description: 'Registre sua primeira cirurgia',
        iconUrl: '/badges/first-surgery.svg',
        pointsRequired: 0,
        category: 'Iniciante',
        rarity: 'COMUM',
        order: 1,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Veterano Bronze',
        description: 'Complete 10 cirurgias',
        iconUrl: '/badges/bronze.svg',
        pointsRequired: 1000,
        category: 'Progresso',
        rarity: 'COMUM',
        order: 2,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Veterano Prata',
        description: 'Complete 50 cirurgias',
        iconUrl: '/badges/silver.svg',
        pointsRequired: 5000,
        category: 'Progresso',
        rarity: 'RARO',
        order: 3,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Veterano Ouro',
        description: 'Complete 100 cirurgias',
        iconUrl: '/badges/gold.svg',
        pointsRequired: 10000,
        category: 'Progresso',
        rarity: 'EPICO',
        order: 4,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Lenda',
        description: 'Complete 500 cirurgias',
        iconUrl: '/badges/legend.svg',
        pointsRequired: 50000,
        category: 'Progresso',
        rarity: 'LENDARIO',
        order: 5,
      },
    }),
  ]);

  console.log('✅ Badges criados:', badges.length);

  // Criar missões
  const mission1 = await prisma.mission.create({
    data: {
      title: 'Bem-vindo!',
      description: 'Registre sua primeira cirurgia',
      pointsReward: 100,
      targetCount: 1,
      missionType: 'REGISTER_SURGERIES',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      active: true,
    },
  });

  const mission2 = await prisma.mission.create({
    data: {
      title: 'Semana Produtiva',
      description: 'Registre 5 cirurgias esta semana',
      pointsReward: 500,
      targetCount: 5,
      missionType: 'REGISTER_SURGERIES',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      active: true,
    },
  });

  console.log('✅ Missões criadas:', { mission1, mission2 });

  // Criar configurações do sistema
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'POINTS_SURGERY_REGISTERED',
        value: 100,
        description: 'Pontos por cirurgia registrada',
      },
      {
        key: 'POINTS_PHOTO_UPLOADED',
        value: 50,
        description: 'Pontos por foto enviada',
      },
      {
        key: 'POINTS_DETAILED_FEEDBACK',
        value: 30,
        description: 'Pontos por feedback detalhado',
      },
      {
        key: 'POINTS_FIRST_OF_DAY',
        value: 20,
        description: 'Bônus de primeiro registro do dia',
      },
    ],
  });

  console.log('✅ Configurações do sistema criadas');

  // Criar cirurgias de exemplo
  const surgery1 = await prisma.surgery.create({
    data: {
      userId: instrumentador1.id,
      deviceId: device1.id,
      surgeryDate: new Date(),
      surgeryType: 'Artroplastia de Quadril',
      hospitalName: 'Hospital Sírio-Libanês',
      hospitalCNPJ: '12.345.678/0001-90',
      latitude: -23.5505,
      longitude: -46.6333,
      city: 'São Paulo',
      state: 'SP',
      status: 'SUCESSO',
      doctorName: 'Dr. Carlos Eduardo',
      doctorConduct: 'Excelente condução, muito atencioso com a equipe',
      devicePerformance: 'Dispositivo funcionou perfeitamente, sem intercorrências',
      deviceRating: 5,
      doctorRating: 5,
      photos: [],
    },
  });

  console.log('✅ Cirurgias de exemplo criadas');

  // Criar transações de pontos
  await prisma.pointTransaction.create({
    data: {
      userId: instrumentador1.id,
      points: 100,
      reason: 'SURGERY_REGISTERED',
      referenceType: 'surgery',
      referenceId: surgery1.id,
      description: 'Cirurgia registrada com sucesso',
    },
  });

  console.log('✅ Transações de pontos criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📧 Credenciais de acesso:');
  console.log('Admin: admin@sintegra.com / admin123');
  console.log('User: joao@sintegra.com / user123');
  console.log('User: maria@sintegra.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
