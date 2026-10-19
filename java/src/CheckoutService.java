import java.math.BigDecimal;

// ---------------------------------------------------------------------------
// 4. CLIENT: our business code. It depends on the Target interface only,
//    so it never changes when we add or swap a payment provider.
// ---------------------------------------------------------------------------

public class CheckoutService {
    private IPaymentProcessor paymentProcessor;

    CheckoutService(IPaymentProcessor processor) {
        this.paymentProcessor = processor;
    }

    void placeOrder(String orderId, BigDecimal amount) {
        System.out.println("  Placing order " + orderId + " for Rs " + amount);
        PaymentResult result = this.paymentProcessor.pay(orderId, amount);
        if (result.success()) {
            System.out.println("  -> Order confirmed. Transaction: " + result.transactionId());
        } else {
            System.out.println("  -> Order failed. Reason: " + result.message());
        }
    }
}
