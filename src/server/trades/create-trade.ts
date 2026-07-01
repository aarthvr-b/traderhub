import { PositionCalculator } from "@/domain/trades/services/PositionCalculator";

interface CreateTradeInput {
  accountSize: number;
  riskPct: number;
  entryPrice: number;
  stopLoss: number;
}

export function previewTradePosition(input: CreateTradeInput) {
  const calculator = new PositionCalculator();

  return calculator.calculate(
    input.accountSize,
    input.riskPct,
    input.entryPrice,
    input.stopLoss
  );
}
