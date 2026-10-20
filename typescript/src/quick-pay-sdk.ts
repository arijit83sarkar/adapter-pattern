// ---------------------------------------------------------------------------
// 2. ADAPTEES: two third-party libraries we cannot change.
//    Both do the same job, but their methods look nothing like our Target.
// ---------------------------------------------------------------------------

// Newer vendor SDK: async, wants the amount as text plus a currency code,
// and resolves to one pipe-separated string such as "OK|QP-77" or "ERROR|LIMIT_EXCEEDED".

export class QuickPaySdk {
  async submitPayment(
    reference: string,
    amountText: string,
    currencyCode: string,
  ): Promise<string> {
    if (Number(amountText) > 20000) {
      return "ERROR|LIMIT_EXCEEDED";
    }
    return "OK|QP-${reference}";
  }
}
