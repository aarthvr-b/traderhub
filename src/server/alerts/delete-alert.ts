import { db } from '@/lib/db';

export async function deleteAlert(alertId: string, userId: string) {
  return db.alert.delete({
    where: { id: alertId, userId },
  });
}
