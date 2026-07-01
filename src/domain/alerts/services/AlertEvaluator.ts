import type { AlertEntity } from '@/domain/alerts/entities/Alert';

/**
 * An interface representing the input for evaluating an alert entity.
 */
export interface AlertEvaluationInput {
  alert: AlertEntity;
  currentPrice: number;
  now: Date;
}

/**
 * An interface representing the result of evaluating an alert entity.
 */
export interface AlertEvaluationResult {
  shouldTrigger: boolean;
  shouldArm: boolean;
  nextStatus: AlertEntity['status'];
  reason: string;
}

/**
 * Calculates the number of minutes that have passed since a given date.
 * @param date the date to calculate the elapsed time from.
 * @param now the current time.
 * @returns the number of minutes that have passed since the given date.
 */
function minutesSince(date: Date, now: Date): number {
  return (now.getTime() - date.getTime()) / (1000 * 60);
}

/**
 * Checks if a value has crossed above a target value between two points in time.
 * @param previous the previous value.
 * @param current the current value.
 * @param target the target value.
 * @returns true if the value has crossed above the target, false otherwise.
 */
function crossedAbove(
  previous: number,
  current: number,
  target: number,
): boolean {
  return previous < target && current >= target;
}

/**
 * Checks if a value has crossed below a target value between two points in time.
 * @param previous the previous value.
 * @param current the current value.
 * @param target the target value.
 * @returns true if the value has crossed below the target, false otherwise.
 */
function crossedBelow(
  previous: number,
  current: number,
  target: number,
): boolean {
  return previous > target && current <= target;
}

/**
 * A service class responsible for evaluating alert entities based on their current state,
 * the current price, and the time of evaluation.
 * Given an alert entity, it determines the evaluation result.
 */
export class AlertEvaluator {
  /**
   * Evaluates an alert entity based on its current state, the current price, and the time of evaluation.
   * @param input The data required for evaluating the alert.
   * @returns the evaluation result.
   */
  evaluate({
    alert,
    currentPrice,
    now,
  }: AlertEvaluationInput): AlertEvaluationResult {
    // If alert is not active, we don't trigger it, but we keep its armed state and status.
    // No telegram notification, no status change.
    if (alert.status !== 'ACTIVE') {
      return {
        shouldTrigger: false,
        shouldArm: alert.isArmed,
        nextStatus: alert.status,
        reason: 'Alert_not_active',
      };
    }

    // If alert was triggered recently, we don't trigger it again,
    // waiting for the cooldown period to pass. We keep its armed state and status.
    if (alert.lastTriggeredAt) {
      const elapsed = minutesSince(alert.lastTriggeredAt, now);
      if (elapsed < alert.cooldownMinutes) {
        return {
          shouldTrigger: false,
          shouldArm: alert.isArmed,
          nextStatus: alert.status,
          reason: 'cooldown_active',
        };
      }
    }

    const previousPrice = alert.lastPrice ?? currentPrice;
    const target = alert.targetPrice;

    if (alert.isArmed === false) {
      if (alert.triggerType === 'ABOVE' && currentPrice < target) {
        return {
          shouldTrigger: false,
          shouldArm: true,
          nextStatus: 'ACTIVE',
          reason: 'rearmed_above',
        };
      }

      if (alert.triggerType === 'BELOW' && currentPrice > target) {
        return {
          shouldTrigger: false,
          shouldArm: true,
          nextStatus: 'ACTIVE',
          reason: 'rearmed_below',
        };
      }

      return {
        shouldTrigger: false,
        shouldArm: false,
        nextStatus: 'ACTIVE',
        reason: 'waiting_for_rearm',
      };
    }

    if (alert.triggerType === 'TOUCH') {
      const touched =
        (previousPrice < target && currentPrice >= target) ||
        (previousPrice > target && currentPrice <= target);

      if (touched) {
        return {
          shouldTrigger: true,
          shouldArm: alert.repeatMode === 'REPEAT',
          nextStatus: alert.repeatMode === 'ONCE' ? 'TRIGGERED' : 'ACTIVE',
          reason: 'touch_triggered',
        };
      }
    }

    if (
      alert.triggerType === 'ABOVE' &&
      crossedAbove(previousPrice, currentPrice, target)
    ) {
      return {
        shouldTrigger: true,
        shouldArm: false,
        nextStatus: alert.repeatMode === 'ONCE' ? 'TRIGGERED' : 'ACTIVE',
        reason: 'crossed_above_triggered',
      };
    }

    if (
      alert.triggerType === 'BELOW' &&
      crossedBelow(previousPrice, currentPrice, target)
    ) {
      return {
        shouldTrigger: true,
        shouldArm: false,
        nextStatus: alert.repeatMode === 'ONCE' ? 'TRIGGERED' : 'ACTIVE',
        reason: 'crossed_below_triggered',
      };
    }

    return {
      shouldTrigger: false,
      shouldArm: alert.isArmed,
      nextStatus: 'ACTIVE',
      reason: 'no_trigger',
    };
  }
}
