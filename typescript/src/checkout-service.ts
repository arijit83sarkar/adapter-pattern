// ---------------------------------------------------------------------------
// 4. CLIENT: our business code. It depends on the Target interface only,
//    so it never changes when we add or swap a payment provider.
// ---------------------------------------------------------------------------

import { IPaymentProcessor } from "./payment-processor";

export class CheckoutService {
  constructor(private readonly processor: IPaymentProcessor) {}

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
