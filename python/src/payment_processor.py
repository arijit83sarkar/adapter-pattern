from abc import ABC, abstractmethod
from decimal import Decimal

from payment_results import PaymentResult

# ---------------------------------------------------------------------------
# 1. TARGET: the interface our own code wants to use.
#    CheckoutService only ever knows about this.
# ---------------------------------------------------------------------------


class PaymentProcessor(ABC):
    @abstractmethod
    def pay(self, order_id: str, amount_in_rupees: Decimal) -> PaymentResult: ...
