import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { code: 'first_word', title: 'First Word', description: 'Learn your very first word.', icon: 'auto_awesome' },
  { code: 'vocab_50', title: 'Vocabulary Builder', description: 'Learn 50 words.', icon: 'library_books' },
  { code: 'vocab_200', title: 'Vocabulary Master', description: 'Learn 200 words.', icon: 'auto_stories' },
  { code: 'streak_7', title: 'Weekly Warrior', description: 'Maintain a 7-day streak.', icon: 'local_fire_department' },
  { code: 'streak_30', title: 'Polyglot Path', description: 'Maintain a 30-day streak.', icon: 'workspace_premium' },
  { code: 'first_speak', title: 'First Words Out Loud', description: 'Complete your first speaking attempt.', icon: 'mic' },
  { code: 'dictation_50', title: 'Sharp Ears', description: 'Get 50 dictation answers right.', icon: 'hearing' },
  { code: 'points_1000', title: 'Point Collector', description: 'Earn 1000 total points.', icon: 'star' },
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
