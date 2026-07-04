import { db } from '@/lib/db';
import { alertSchema, type AlertFormInput } from '@/schemas/alertSchema';

export async function createAlert(userId: string, input: AlertFormInput) {
  /**
   *
   */
  const parsed = alertSchema.parse(input);

  return db.alert.create({
    data: {
      userId,
      symbol: parsed.symbol,
      triggerType: parsed.triggerType,
      targetPrice: parsed.targetPrice,
      label: parsed.label,
      note: parsed.note || null,
      cooldownMinutes: parsed.cooldownMinutes,
      repeatMode: parsed.repeatMode,
    },
  });
}
