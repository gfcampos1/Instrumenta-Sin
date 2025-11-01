/**
 * Script para promover um usuário a ADMIN
 *
 * Uso: node scripts/promote-admin.js <email>
 * Exemplo: node scripts/promote-admin.js usuario@example.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Erro: Email não fornecido');
    console.log('Uso: node scripts/promote-admin.js <email>');
    console.log('Exemplo: node scripts/promote-admin.js usuario@example.com');
    process.exit(1);
  }

  console.log(`🔍 Procurando usuário: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
  console.log(`   Role atual: ${user.role}`);

  if (user.role === 'ADMIN') {
    console.log('⚠️  Usuário já é ADMIN!');
    process.exit(0);
  }

  console.log(`🔄 Promovendo para ADMIN...`);

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ Usuário promovido com sucesso!`);
  console.log(`   Nome: ${updated.name}`);
  console.log(`   Email: ${updated.email}`);
  console.log(`   Role: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
