/*
 * Adapter pattern: a payment example in core TypeScript (strict mode, no libraries).
 *
 * Run it with:
 *     npx tsc --strict --target ES2022 --module commonjs adapter-pattern-demo.ts
 *     node adapter-pattern-demo.js
 */

// ---------------------------------------------------------------------------
// 1. TARGET: the interface our own code wants to use.
//    CheckoutService only ever knows about this.
// ---------------------------------------------------------------------------
export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  message: string;
}

export interface PaymentProcessor {
  pay(orderId: string, amountInRupees: number): Promise<PaymentResult>;
}

// ---------------------------------------------------------------------------
// 2. ADAPTEES: two third-party libraries we cannot change.
//    Both do the same job, but their methods look nothing like our Target.
// ---------------------------------------------------------------------------

// Old bank library: synchronous, wants paise (a whole number) and returns a plain number.
//   > 0  -> transaction number (success)
//   < 0  -> negative error code (failure)
class OldBankApi {
  private nextTransactionNumber = 1001;

  makeTransaction(amountInPaise: number): number {
    if (amountInPaise > 5_000_000) {
      // over Rs 50,000
      return -51;
    }
    return this.nextTransactionNumber++;
  }
}

// Newer vendor SDK: async, wants the amount as text plus a currency code,
// and resolves to one pipe-separated string such as "OK|QP-77" or "ERROR|LIMIT_EXCEEDED".
class QuickPaySdk {
  async submitPayment(
    reference: string,
    amountText: string,
    currencyCode: string,
  ): Promise<string> {
    if (Number(amountText) > 20000) {
      // over Rs 20,000
      return "ERROR|LIMIT_EXCEEDED";
    }
    return `OK|QP-${reference}`;
  }
}

// ---------------------------------------------------------------------------
// 3. ADAPTERS: each one implements Target and wraps one Adaptee.
//    All the translation lives here, in one place.
// ---------------------------------------------------------------------------
class OldBankAdapter implements PaymentProcessor {
  // "private readonly bank" in the constructor declares AND assigns the field.
  // Composition: the adapter HAS an OldBankApi.
  constructor(private readonly bank: OldBankApi) {}

  async pay(orderId: string, amountInRupees: number): Promise<PaymentResult> {
    // Translate the INPUT: rupees -> paise.
    // Math.round matters: 19.99 * 100 is 1998.9999999999998 in floating point.
    const paise = Math.round(amountInRupees * 100);
    console.log(`    [adapter] ${amountInRupees.toFixed(2)} rupees -> ${paise} paise`);

    // The old library is synchronous, but our Target is async.
    // The adapter hides that difference too.
    const result = this.bank.makeTransaction(paise);

    // Translate the OUTPUT: number or negative code -> PaymentResult
    if (result > 0) {
      return { success: true, transactionId: `BANK-${result}`, message: "Paid" };
    }
    return {
      success: false,
      transactionId: null,
      message: `Bank declined (error code ${Math.abs(result)})`,
    };
  }
}

class QuickPayAdapter implements PaymentProcessor {
  constructor(private readonly sdk: QuickPaySdk) {}

  async pay(orderId: string, amountInRupees: number): Promise<PaymentResult> {
    // Translate the INPUT: number -> text, and add the currency code
    const amountText = amountInRupees.toFixed(2);
    console.log(`    [adapter] sending amount "${amountText}" with currency INR`);

    const response = await this.sdk.submitPayment(orderId, amountText, "INR");

    // Translate the OUTPUT: "OK|QP-77" or "ERROR|reason" -> PaymentResult
    const separator = response.indexOf("|");
    const status = response.slice(0, separator);
    const detail = response.slice(separator + 1);

    if (status === "OK") {
      return { success: true, transactionId: detail, message: "Paid" };
    }
    return { success: false, transactionId: null, message: `QuickPay error: ${detail}` };
  }
}

// ---------------------------------------------------------------------------
// 4. CLIENT: our business code. It depends on the Target interface only,
//    so it never changes when we add or swap a payment provider.
// ---------------------------------------------------------------------------
class CheckoutService {
  constructor(private readonly processor: PaymentProcessor) {}

  async placeOrder(orderId: string, amount: number): Promise<void> {
    console.log(`  Placing order ${orderId} for Rs ${amount.toFixed(2)}`);
    const result = await this.processor.pay(orderId, amount);
    if (result.success) {
      console.log(`  -> Order confirmed. Transaction: ${result.transactionId}`);
    } else {
      console.log(`  -> Order failed. Reason: ${result.message}`);
    }
  }
}

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
  const withQuickPay = new CheckoutService(new QuickPayAdapter(new QuickPaySdk()));
  await withQuickPay.placeOrder("ORD-3", normalOrder);
  await withQuickPay.placeOrder("ORD-4", hugeOrder);
}

void main();
