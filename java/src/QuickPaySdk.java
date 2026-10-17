// ---------------------------------------------------------------------------
// 2. ADAPTEES: two third-party libraries we cannot change.
//    Both do the same job, but their methods look nothing like our Target.
// ---------------------------------------------------------------------------

// Newer vendor SDK: wants the amount as text plus a currency code,
// and returns a single pipe-separated string such as "OK|QP-77" or "ERROR|LIMIT_EXCEEDED".

import java.math.BigDecimal;

public class QuickPaySdk {
    public String submitPayment(String reference, String amountText, String currencyCode) {
        BigDecimal amount = new BigDecimal(amountText);
        if (amount.compareTo(new BigDecimal("20000")) > 0) {
            return "ERROR|LIMIT_EXCEEDED";
        }
        return "OK|QP-" + reference;
    }
}
