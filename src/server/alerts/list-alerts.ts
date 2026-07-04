import { db } from '@/lib/db';

export async function listAlerts(userId: string) {
  return db.alert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
