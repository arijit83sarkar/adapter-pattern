# ---------------------------------------------------------------------------
# 3. ADAPTERS: each one implements Target and wraps one Adaptee.
#    All the translation lives here, in one place.
# ---------------------------------------------------------------------------
from decimal import ROUND_HALF_UP, Decimal

from payment_processor import PaymentProcessor
from old_bank_api import OldBankApi
from payment_results import PaymentResult


class OldBankAdapter(PaymentProcessor):
    def __init__(self, bank: OldBankApi):
        # composition: the adapter HAS an OldBankApi
        self._bank = bank

    def pay(self, order_id: str, amount_in_rupees: Decimal) -> PaymentResult:
        # translate in input: rupees -> paise
        rupees = amount_in_rupees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        paise = int(rupees * 100)
        print(f"    [adapter] {amount_in_rupees} rupees -> {paise} paise")

        result = self._bank.make_transaction(paise)

        # translate the outout: number or negetive code -> PaymentResult
        if result > 0:
            return PaymentResult(True, f"BANK-{result}", "PAID")
        return PaymentResult(False, None, f"Bank declained (error code {abs(result)})")
