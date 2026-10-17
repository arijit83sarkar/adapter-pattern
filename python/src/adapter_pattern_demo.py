"""
Adapter pattern: a payment example in core Python (works on Python 3.9+).

Run it with:
    python3 adapter_pattern_demo.py
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional


# ---------------------------------------------------------------------------
# 1. TARGET: the interface our own code wants to use.
#    CheckoutService only ever knows about this.
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class PaymentResult:
    success: bool
    transaction_id: Optional[str]
    message: str


class PaymentProcessor(ABC):
    @abstractmethod
    def pay(self, order_id: str, amount_in_rupees: Decimal) -> PaymentResult:
        ...


# ---------------------------------------------------------------------------
# 2. ADAPTEES: two third-party libraries we cannot change.
#    Both do the same job, but their methods look nothing like our Target.
# ---------------------------------------------------------------------------

class OldBankApi:
    """Old bank library: wants paise (an int) and returns a plain number.

    > 0  -> transaction number (success)
    < 0  -> negative error code (failure)
    """

    def __init__(self):
        self._next_transaction_number = 1001

    def make_transaction(self, amount_in_paise: int) -> int:
        if amount_in_paise > 5_000_000:  # over Rs 50,000
            return -51
        number = self._next_transaction_number
        self._next_transaction_number += 1
        return number


class QuickPaySdk:
    """Newer vendor SDK: wants the amount as text plus a currency code, and
    returns one pipe-separated string such as "OK|QP-77" or "ERROR|LIMIT_EXCEEDED".
    """

    def submit_payment(self, reference: str, amount_text: str, currency_code: str) -> str:
        if Decimal(amount_text) > Decimal("20000"):  # over Rs 20,000
            return "ERROR|LIMIT_EXCEEDED"
        return f"OK|QP-{reference}"


# ---------------------------------------------------------------------------
# 3. ADAPTERS: each one implements Target and wraps one Adaptee.
#    All the translation lives here, in one place.
# ---------------------------------------------------------------------------

class OldBankAdapter(PaymentProcessor):
    def __init__(self, bank: OldBankApi):
        self._bank = bank  # composition: the adapter HAS an OldBankApi

    def pay(self, order_id: str, amount_in_rupees: Decimal) -> PaymentResult:
        # Translate the INPUT: rupees -> paise
        rupees = amount_in_rupees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        paise = int(rupees * 100)
        print(f"    [adapter] {amount_in_rupees} rupees -> {paise} paise")

        result = self._bank.make_transaction(paise)

        # Translate the OUTPUT: number or negative code -> PaymentResult
        if result > 0:
            return PaymentResult(True, f"BANK-{result}", "Paid")
        return PaymentResult(False, None, f"Bank declined (error code {abs(result)})")


class QuickPayAdapter(PaymentProcessor):
    def __init__(self, sdk: QuickPaySdk):
        self._sdk = sdk

    def pay(self, order_id: str, amount_in_rupees: Decimal) -> PaymentResult:
        # Translate the INPUT: Decimal -> text, and add the currency code
        amount_text = str(amount_in_rupees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        print(f'    [adapter] sending amount "{amount_text}" with currency INR')

        response = self._sdk.submit_payment(order_id, amount_text, "INR")

        # Translate the OUTPUT: "OK|QP-77" or "ERROR|reason" -> PaymentResult
        status, detail = response.split("|", 1)
        if status == "OK":
            return PaymentResult(True, detail, "Paid")
        return PaymentResult(False, None, f"QuickPay error: {detail}")


# ---------------------------------------------------------------------------
# 4. CLIENT: our business code. It depends on the Target interface only,
#    so it never changes when we add or swap a payment provider.
# ---------------------------------------------------------------------------

class CheckoutService:
    def __init__(self, processor: PaymentProcessor):
        self._processor = processor

    def place_order(self, order_id: str, amount: Decimal) -> None:
        print(f"  Placing order {order_id} for Rs {amount}")
        result = self._processor.pay(order_id, amount)
        if result.success:
            print(f"  -> Order confirmed. Transaction: {result.transaction_id}")
        else:
            print(f"  -> Order failed. Reason: {result.message}")


# ---------------------------------------------------------------------------
# 5. MAIN: wire everything together.
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    normal_order = Decimal("499.00")
    huge_order = Decimal("60000.00")

    print("=== Using the old bank ===")
    with_old_bank = CheckoutService(OldBankAdapter(OldBankApi()))
    with_old_bank.place_order("ORD-1", normal_order)
    with_old_bank.place_order("ORD-2", huge_order)

    print()
    print("=== Using QuickPay (same CheckoutService code) ===")
    with_quickpay = CheckoutService(QuickPayAdapter(QuickPaySdk()))
    with_quickpay.place_order("ORD-3", normal_order)
    with_quickpay.place_order("ORD-4", huge_order)
