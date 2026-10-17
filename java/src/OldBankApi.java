// ---------------------------------------------------------------------------
// 2. ADAPTEES: two third-party libraries we cannot change.
//    Both do the same job, but their methods look nothing like our Target.
// ---------------------------------------------------------------------------

// Old bank library: wants paise (a long) and returns a plain number.
//   > 0  -> transaction number (success)
//   < 0  -> negative error code (failure)

public class OldBankApi {
    private long nextTransactionNumber = 1001;

    public long makeTransaction(long amountInPaise) {
        if (amountInPaise > 5_000_000) {
            return -51;
        }
        return nextTransactionNumber;
    }
}
