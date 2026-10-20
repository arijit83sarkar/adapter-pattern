// ---------------------------------------------------------------------------
// 3. ADAPTERS: each one implements Target and wraps one Adaptee.
//    All the translation lives here, in one place.
// ---------------------------------------------------------------------------

import { OldBankApi } from "./old-bank-api";
import { IPaymentProcessor } from "./payment-processor";
import { IPaymentResult } from "./payment-result";

export class OldBankAdapter implements IPaymentProcessor {
  // "private readonly bank" in the constructor declares AND assigns the field.
  // Composition: the adapter HAS an OldBankApi.
  constructor(private readonly bank: OldBankApi) {}

  async pay(orderId: string, amountInRupees: number): Promise<IPaymentResult> {
    // Translate the INPUT: rupees -> paise.
    // Math.round matters: 19.99 * 100 is 1998.9999999999998 in floating point.
    const paise = Math.round(amountInRupees * 100);
    console.log(
      `    [adapter] ${amountInRupees.toFixed(2)} rupees -> ${paise} paise`,
    );

    // The old library is synchronous, but our Target is async.
    // The adapter hides that difference too.
    const result = this.bank.makeTransaction(paise);

    // Translate the OUTPUT: number or negative code -> PaymentResult
    if (result > 0) {
      return {
        success: true,
        transactionId: `BANK-${result}`,
        message: "PAID",
      };
    }
    return {
      success: false,
      transactionId: null,
      message: `Bank declined (error code ${Math.abs(result)})`,
    };
  }
}
