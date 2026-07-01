import type {
  AlertStatus,
  PriceSource,
  RepeatMode,
  TriggerType,
} from "@/domain/alerts/value-objects/AlertTypes";

export interface AlertEntity {
  id: string;
  userId: string;
  symbol: string;
  triggerType: TriggerType;
  targetPrice: number;
  label: string;
  note?: string | null;
  priceSource: PriceSource;
  cooldownMinutes: number;
  repeatMode: RepeatMode;
  status: AlertStatus;
  isArmed: boolean;
  lastPrice?: number | null;
  lastTriggeredAt?: Date | null;
}
