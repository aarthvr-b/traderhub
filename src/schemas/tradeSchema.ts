import { z } from 'zod';
import { Direction } from '@/domain/trades/value-objects/Direction';

export const tradeSchema = z.object({
  pair: z.string().min(1).max(8),
  direction: z.nativeEnum(Direction),
  accountSize: z.number().gt(0),
  riskPct: z.number().gt(0).lte(100),
  entryPrice: z.number().gt(0),
  stopLoss: z.number().gt(0),
  notes: z.string().optional(), // (optional)
});
