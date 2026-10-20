// ---------------------------------------------------------------------------
// 3. ADAPTERS: each one implements Target and wraps one Adaptee.
//    All the translation lives here, in one place.
// ---------------------------------------------------------------------------

import { IPaymentProcessor } from "./payment-processor";
import { IPaymentResult } from "./payment-result";
import { QuickPaySdk } from "./quick-pay-sdk";

export class QuickPayAdapter implements IPaymentProcessor {
  constructor(private readonly sdk: QuickPaySdk) {}
  async pay(orderId: string, amountInRupees: number): Promise<IPaymentResult> {
    // Translate the INPUT: number -> text, and add the currency code
    const amountText = amountInRupees.toFixed(2);
    console.log(
      `    [adapter] sending amount "${amountText}" with currency INR`,
    );

    const response = await this.sdk.submitPayment(orderId, amountText, "INR");

    // Translate the OUTPUT: "OK|QP-77" or "ERROR|reason" -> PaymentResult
    const separator = response.indexOf("|");
    const status = response.slice(0, separator);
    const detail = response.slice(separator + 1);
    if (status == "OK") {
      return { success: true, transactionId: detail, message: "PAID" };
    }
    return {
      success: true,
      transactionId: null,
      message: `QuickPay error: ${detail}`,
    };
  }
}
