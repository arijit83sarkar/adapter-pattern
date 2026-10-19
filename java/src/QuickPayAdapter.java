import java.math.BigDecimal;
import java.math.RoundingMode;

// ---------------------------------------------------------------------------
// 3. ADAPTERS: each one implements Target and wraps one Adaptee.
//    All the translation lives here, in one place.
// ---------------------------------------------------------------------------

public class QuickPayAdapter implements IPaymentProcessor {
    private final QuickPaySdk quickPaySdk;

    QuickPayAdapter(QuickPaySdk paySdk) {
        this.quickPaySdk = paySdk;
    }

    @Override
    public PaymentResult pay(String orderId, BigDecimal amountInRupees) {
        // Translate the INPUT: BigDecimal -> text, and add the currency code
        String amountText = amountInRupees.setScale(2, RoundingMode.HALF_UP).toPlainString();
        System.out.println("    [adapter] sending amount \"" + amountText + "\" with currency INR");

        String response = this.quickPaySdk.submitPayment(orderId, amountText, "INR");

        // Translate the OUTPUT: "OK|QP-77" or "ERROR|reason" -> PaymentResult
        String[] parts = response.split("\\|", 2);
        if (parts[0].equals("OK")) {
            return new PaymentResult(true, parts[1], "PAID");
        }
        return new PaymentResult(false, null, "QuickPay error: " + parts[1]);
    }

}
