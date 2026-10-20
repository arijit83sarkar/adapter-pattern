# ---------------------------------------------------------------------------
# 4. CLIENT: our business code. It depends on the Target interface only,
#    so it never changes when we add or swap a payment provider.
# ---------------------------------------------------------------------------
from decimal import Decimal

from payment_processor import PaymentProcessor


class CheckoutService:
    def __init__(self, processor: PaymentProcessor):
        self._processor = processor

    def place_order(self, order_id: str, amount: Decimal) -> str:
        print(f"  Placing order {order_id} for Rs {amount}")
        result = self._processor.pay(order_id, amount)
        if result.success:
            print(f"  -> Order confirmed. Transaction: {result.transaction_id}")
        else:
            print(f"  -> Order failed. Reason: {result.message}")
