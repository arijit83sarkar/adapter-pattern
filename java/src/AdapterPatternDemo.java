import java.math.BigDecimal;
import java.math.RoundingMode;

/*
 * Adapter pattern: a payment example in core Java (works on Java 17+).
 *
 * Run it with:
 *     javac AdapterPatternDemo.java
 *     java AdapterPatternDemo
 */

// ---------------------------------------------------------------------------
// 1. TARGET: the interface our own code wants to use.
//    CheckoutService only ever knows about this.
// ---------------------------------------------------------------------------
interface PaymentProcessor {
    PaymentResult pay(String orderId, BigDecimal amountInRupees);
}

record PaymentResult(boolean success, String transactionId, String message) {}

// ---------------------------------------------------------------------------
// 2. ADAPTEES: two third-party libraries we cannot change.
//    Both do the same job, but their methods look nothing like our Target.
// ---------------------------------------------------------------------------

// Old bank library: wants paise (a long) and returns a plain number.
//   > 0  -> transaction number (success)
//   < 0  -> negative error code (failure)
class OldBankApi {
    private long nextTransactionNumber = 1001;

    public long makeTransaction(long amountInPaise) {
        if (amountInPaise > 5_000_000) {   // over Rs 50,000
            return -51;
        }
        return nextTransactionNumber++;
    }
}

// Newer vendor SDK: wants the amount as text plus a currency code,
// and returns a single pipe-separated string such as "OK|QP-77" or "ERROR|LIMIT_EXCEEDED".
class QuickPaySdk {
    public String submitPayment(String reference, String amountText, String currencyCode) {
        BigDecimal amount = new BigDecimal(amountText);
        if (amount.compareTo(new BigDecimal("20000")) > 0) {   // over Rs 20,000
            return "ERROR|LIMIT_EXCEEDED";
        }
        return "OK|QP-" + reference;
    }
}

// ---------------------------------------------------------------------------
// 3. ADAPTERS: each one implements Target and wraps one Adaptee.
//    All the translation lives here, in one place.
// ---------------------------------------------------------------------------
class OldBankAdapter implements PaymentProcessor {
    private final OldBankApi bank;   // composition: the adapter HAS an OldBankApi

    OldBankAdapter(OldBankApi bank) {
        this.bank = bank;
    }

    @Override
    public PaymentResult pay(String orderId, BigDecimal amountInRupees) {
        // Translate the INPUT: rupees -> paise
        long paise = amountInRupees.setScale(2, RoundingMode.HALF_UP)
                                   .movePointRight(2)
                                   .longValueExact();
        System.out.println("    [adapter] " + amountInRupees + " rupees -> " + paise + " paise");

        long result = bank.makeTransaction(paise);

        // Translate the OUTPUT: number or negative code -> PaymentResult
        if (result > 0) {
            return new PaymentResult(true, "BANK-" + result, "Paid");
        }
        return new PaymentResult(false, null, "Bank declined (error code " + Math.abs(result) + ")");
    }
}

class QuickPayAdapter implements PaymentProcessor {
    private final QuickPaySdk sdk;

    QuickPayAdapter(QuickPaySdk sdk) {
        this.sdk = sdk;
    }

    @Override
    public PaymentResult pay(String orderId, BigDecimal amountInRupees) {
        // Translate the INPUT: BigDecimal -> text, and add the currency code
        String amountText = amountInRupees.setScale(2, RoundingMode.HALF_UP).toPlainString();
        System.out.println("    [adapter] sending amount \"" + amountText + "\" with currency INR");

        String response = sdk.submitPayment(orderId, amountText, "INR");

        // Translate the OUTPUT: "OK|QP-77" or "ERROR|reason" -> PaymentResult
        String[] parts = response.split("\\|", 2);
        if (parts[0].equals("OK")) {
            return new PaymentResult(true, parts[1], "Paid");
        }
        return new PaymentResult(false, null, "QuickPay error: " + parts[1]);
    }
}

// ---------------------------------------------------------------------------
// 4. CLIENT: our business code. It depends on the Target interface only,
//    so it never changes when we add or swap a payment provider.
// ---------------------------------------------------------------------------
class CheckoutService {
    private final PaymentProcessor processor;

    CheckoutService(PaymentProcessor processor) {
        this.processor = processor;
    }

    void placeOrder(String orderId, BigDecimal amount) {
        System.out.println("  Placing order " + orderId + " for Rs " + amount);
        PaymentResult result = processor.pay(orderId, amount);
        if (result.success()) {
            System.out.println("  -> Order confirmed. Transaction: " + result.transactionId());
        } else {
            System.out.println("  -> Order failed. Reason: " + result.message());
        }
    }
}

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
