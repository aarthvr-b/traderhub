// PositionCalculator.ts
// Is an utility file that is going to be used to create a new position. User will input things like entry price, account size, risk % , and stop loss and this service will return how much to invest in the trade (the order value), what quantity (position size), the required leverage, and will display the risk of this trade in terms of USDT.
//

export interface PositionCalculationResult {
  riskAmount: number;
  quantity: number;
  orderValue: number;
  requiredLeverage: number;
  makerFee: number;
  takerFee: number;
}

export class PositionCalculator {
  calculate(
    accountSize: number,
    riskPct: number,
    entry: number,
    stopLoss: number
  ): PositionCalculationResult {
    if (accountSize <= 0 || riskPct <= 0 || entry <= 0 || stopLoss <= 0) {
      throw new Error("Input numbers can't be negative");
    }
    if (entry === stopLoss) {
      throw new Error('Please input a stop loss different than the entry.');
    }
    const riskAmount: number = accountSize * (riskPct / 100);
    const stopDistance: number = Math.abs(entry - stopLoss);
    const quantity: number = riskAmount / stopDistance;
    const orderValue: number = quantity * entry;
    const requiredLeverage: number = Math.max(1, orderValue / accountSize);
    const takerFee: number = orderValue * 0.00055;
    const makerFee: number = orderValue * 0.0002;

    const finalResult: PositionCalculationResult = {
      riskAmount: riskAmount,
      quantity: quantity,
      orderValue: orderValue,
      requiredLeverage: requiredLeverage,
      makerFee: makerFee,
      takerFee: takerFee,
    };
    return finalResult;
  }
}
