import { IPaymentResult } from "./payment-result";

// ---------------------------------------------------------------------------
// 1. TARGET: the interface our own code wants to use.
//    CheckoutService only ever knows about this.
// ---------------------------------------------------------------------------

export interface IPaymentProcessor {
  pay(orderId: string, amountInRupees: number): Promise<IPaymentResult>;
}
