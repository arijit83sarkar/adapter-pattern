/*
 * Adapter pattern: a payment example in core TypeScript (strict mode, no libraries).
 *
 * Run it with:
 *     npx tsc --strict --target ES2022 --module commonjs adapter-pattern-demo.ts
 *     node adapter-pattern-demo.js
 */

import { CheckoutService } from "./checkout-service";
import { OldBankAdapter } from "./old-bank-adapter";
import { OldBankApi } from "./old-bank-api";
import { QuickPayAdapter } from "./quick-pay-adapter";
import { QuickPaySdk } from "./quick-pay-sdk";

// ---------------------------------------------------------------------------
// 5. MAIN: wire everything together.
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const normalOrder = 499.0;
  const hugeOrder = 60000.0;

  console.log("=== Using the old bank ===");
  const withOldBank = new CheckoutService(new OldBankAdapter(new OldBankApi()));
  await withOldBank.placeOrder("ORD-1", normalOrder);
  await withOldBank.placeOrder("ORD-2", hugeOrder);

  console.log();
  console.log("=== Using QuickPay (same CheckoutService code) ===");
  const withQuickPay = new CheckoutService(
    new QuickPayAdapter(new QuickPaySdk()),
  );
  await withQuickPay.placeOrder("ORD-3", normalOrder);
  await withQuickPay.placeOrder("ORD-4", hugeOrder);
}

void main();
