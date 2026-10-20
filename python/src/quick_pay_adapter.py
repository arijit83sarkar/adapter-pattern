# ---------------------------------------------------------------------------
# 3. ADAPTERS: each one implements Target and wraps one Adaptee.
#    All the translation lives here, in one place.
# ---------------------------------------------------------------------------
from decimal import ROUND_HALF_UP, Decimal

from payment_processor import PaymentProcessor
from quick_pay_sdk import QuickPaySdk
from payment_results import PaymentResult


class QuickPayAdapter(PaymentProcessor):
    def __init__(self, sdk: QuickPaySdk):
        self._sdk = sdk

    def pay(self, order_id: str, amount_in_rupees: Decimal) -> PaymentResult:
        # Translate the INPUT: Decimal -> text, and add the currency code
        amount_text = str(
            amount_in_rupees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        )
        print(f'    [adapter] sending amount "{amount_text}" with currency INR')

        response = self._sdk.submit_payment(order_id, amount_text, "INR")

        # Translate the OUTPUT: "OK|QP-77" or "ERROR|reason" -> PaymentResult
        status, details = response.split("|", 1)
        if status == "OK":
            return PaymentResult(True, details, "PAID")
        return PaymentResult(False, None, f"QuickPay error: {details}")
