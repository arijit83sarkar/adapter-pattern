import java.math.BigDecimal;

/*
 * Adapter pattern: a payment example in core Java (works on Java 17+).
 *
 * Run it with:
 *     javac AdapterPatternDemo.java
 *     java AdapterPatternDemo
 */

// ---------------------------------------------------------------------------
// 5. MAIN: wire everything together.
// ---------------------------------------------------------------------------
public class AdapterPatternDemo {
    public static void main(String[] args) {
        BigDecimal normalOrder = new BigDecimal("499.00");
        BigDecimal hugeOrder = new BigDecimal("60000.00");

        System.out.println("=== Using the old bank ===");
        CheckoutService withOldBank = new CheckoutService(new OldBankAdapter(new OldBankApi()));
        withOldBank.placeOrder("ORD-1", normalOrder);
        withOldBank.placeOrder("ORD-2", hugeOrder);

        System.out.println();
        System.out.println("=== Using QuickPay (same CheckoutService code) ===");
        CheckoutService withQuickPay = new CheckoutService(new QuickPayAdapter(new QuickPaySdk()));
        withQuickPay.placeOrder("ORD-3", normalOrder);
        withQuickPay.placeOrder("ORD-4", hugeOrder);
    }
}
