import { z } from 'zod';

export const alertSchema = z.object({
  symbol: z
    .string()
    .min(2)
    .max(30)
    .regex(
      /^[A-Z0-9]+$/,
      'Use exchange-native symbols (e.g., BTCUSDT, ETHUSDT)',
    ),
  targetPrice: z.coerce.number().positive(),
  triggerType: z.enum(['TOUCH', 'ABOVE', 'BELOW']),
  label: z.string().min(1).max(80),
  note: z.string().max(300).optional().or(z.literal('')),
  cooldownMinutes: z.coerce.number().int().min(0).max(1440),
  repeatMode: z.enum(['ONCE', 'REPEAT']),
});

export type AlertFormInput = z.infer<typeof alertSchema>;
