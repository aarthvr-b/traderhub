'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { tradeSchema } from '@/schemas/tradeSchema';
import {
  PositionCalculator,
  type PositionCalculationResult,
} from '@/domain/trades/services/PositionCalculator';
import { Direction } from '@/domain/trades/value-objects/Direction';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateTradeForm() {
  type TradeFormValues = z.infer<typeof tradeSchema>;

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      pair: '',
      direction: undefined,
      accountSize: 0,
      riskPct: 1,
      entryPrice: 0,
      stopLoss: 0,
      notes: '',
    },
  });

  const watchedAccountSize = useWatch({
    control: form.control,
    name: 'accountSize',
  });
  const watchedRiskPct = useWatch({
    control: form.control,
    name: 'riskPct',
  });
  const watchedEntryPrice = useWatch({
    control: form.control,
    name: 'entryPrice',
  });
  const watchedStopLoss = useWatch({
    control: form.control,
    name: 'stopLoss',
  });

  const calculator = new PositionCalculator();

  let results: PositionCalculationResult | null = null;
  let calculationError: string | null = null;

  if (watchedAccountSize > 0 && watchedEntryPrice > 0 && watchedStopLoss > 0) {
    try {
      results = calculator.calculate(
        watchedAccountSize,
        watchedRiskPct,
        watchedEntryPrice,
        watchedStopLoss
      );
    } catch (error) {
      calculationError =
        error instanceof Error ? error.message : 'Unable to calculate position.';
    }
  }

  return (
    <div className="grid gap-6 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
      <Form {...form}>
        <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pair"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="BTCUSDT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direction</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a direction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Direction.Long}>Long</SelectItem>
                      <SelectItem value={Direction.Short}>Short</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="riskPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="entryPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stopLoss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Loss</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Optional context for this setup" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
            <span>Validation and calculation are live.</span>
            <Button type="submit" variant="outline">
              Save Later
            </Button>
          </div>
        </form>
      </Form>

      <div className="grid gap-3 rounded-2xl bg-muted/50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Position Snapshot
        </h2>
        {calculationError ? (
          <p className="text-sm text-destructive">{calculationError}</p>
        ) : results ? (
          <dl className="grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Risk Amount</dt>
              <dd className="text-lg font-semibold">${results.riskAmount.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Quantity</dt>
              <dd className="text-lg font-semibold">{results.quantity.toFixed(4)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Order Value</dt>
              <dd className="text-lg font-semibold">${results.orderValue.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Required Leverage</dt>
              <dd className="text-lg font-semibold">{results.requiredLeverage.toFixed(2)}x</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Maker Fee</dt>
              <dd className="text-lg font-semibold">${results.makerFee.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Taker Fee</dt>
              <dd className="text-lg font-semibold">${results.takerFee.toFixed(2)}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter account size, entry, risk, and stop loss to preview the position.
          </p>
        )}
      </div>
    </div>
  );
}
