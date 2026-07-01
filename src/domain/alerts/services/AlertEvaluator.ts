import type { AlertEntity } from "@/domain/alerts/entities/Alert";

export function shouldTriggerAlert(alert: AlertEntity, currentPrice: number) {
  if (alert.status !== "ACTIVE" || !alert.isArmed) {
    return false;
  }

  if (alert.triggerType === "TOUCH") {
    return currentPrice === alert.targetPrice;
  }

  if (alert.triggerType === "ABOVE") {
    return currentPrice > alert.targetPrice;
  }

  return currentPrice < alert.targetPrice;
}
