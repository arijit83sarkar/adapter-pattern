export interface IPaymentResult {
  success: boolean;
  transactionId: string | null;
  message: string;
}
