import type { TriggerType } from "@/domain/alerts/value-objects/AlertTypes";

export interface AlertEventEntity {
  id: string;
  alertId: string;
  userId: string;
  symbol: string;
  triggerType: TriggerType;
  targetPrice: number;
  actualPrice: number;
  delivered: boolean;
  deliveredAt?: Date | null;
  createdAt: Date;
}
