import java.math.BigDecimal;
import java.math.RoundingMode;

// ---------------------------------------------------------------------------
// 3. ADAPTERS: each one implements Target and wraps one Adaptee.
//    All the translation lives here, in one place.
// ---------------------------------------------------------------------------

public class OldBankAdapter implements IPaymentProcessor {
    private final OldBankApi bankApi;

    OldBankAdapter(OldBankApi api) {
        this.bankApi = api;
    }

    @Override
    public PaymentResult pay(String orderId, BigDecimal amountInRupees) {
        // Translate int input: rupees -> paise
        long paise = amountInRupees.setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .longValueExact();
        System.out.print("  [adapter] " + amountInRupees + " rupees-> " + paise + " paise.");
        long result = this.bankApi.makeTransaction(paise);

        // Translate the OUTPUT: number or negative code -> PaymentResult
        if (result > 0) {
            return new PaymentResult(true, "BANK-" + result, "PAID");
        }
        return new PaymentResult(false, null, "Bank denied (error code " + Math.abs(result) + ")");
    }

}
