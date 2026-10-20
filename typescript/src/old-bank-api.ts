// ---------------------------------------------------------------------------
// 2. ADAPTEES: two third-party libraries we cannot change.
//    Both do the same job, but their methods look nothing like our Target.
// ---------------------------------------------------------------------------

// Old bank library: synchronous, wants paise (a whole number) and returns a plain number.
//   > 0  -> transaction number (success)
//   < 0  -> negative error code (failure)

export class OldBankApi {
  private nextTransactionNumber: number = 1001;

  makeTransaction(amountInPaise: number): number {
    if (amountInPaise > 5_00_000) {
      return -51;
    }
    return this.nextTransactionNumber++;
  }
}
