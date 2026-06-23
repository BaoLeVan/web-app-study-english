import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { code: 'grammar_guru', title: 'Grammar Guru', description: 'Completed 50 grammar lessons with 90%+ accuracy.', icon: 'emoji_events' },
  { code: 'global_citizen', title: 'Global Citizen', description: "Mastered the 'Countries and Cities' vocabulary set.", icon: 'public' },
  { code: 'polyglot_path', title: 'Polyglot Path', description: 'Maintain a 30-day streak to unlock.', icon: 'lock' },
];

const TOPICS = [
  { name: 'Books and Library', icon: 'menu_book' },
  { name: 'Countries and Cities', icon: 'public' },
  { name: 'Time', icon: 'schedule' },
];

async function main() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { code: a.code }, create: a, update: a });
  }
  for (const t of TOPICS) {
    await prisma.topic.upsert({ where: { name: t.name }, create: t, update: t });
  }
  // eslint-disable-next-line no-console
  console.log('Seed complete: achievements + topics');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
