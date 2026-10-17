import java.math.BigDecimal;

// ---------------------------------------------------------------------------
// 1. TARGET: the interface our own code wants to use.
//    CheckoutService only ever knows about this.
// ---------------------------------------------------------------------------

public interface IPaymentProcessor {
    PaymentResult pay(String orderId, BigDecimal amountInRupees);
}
