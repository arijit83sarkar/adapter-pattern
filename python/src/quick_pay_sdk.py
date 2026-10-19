# ---------------------------------------------------------------------------
# 2. ADAPTEES: two third-party libraries we cannot change.
#    Both do the same job, but their methods look nothing like our Target.
# ---------------------------------------------------------------------------
from decimal import Decimal


class QuickPaySdk:
    """Newer vendor SDK: wants the amount as text plus a currency code, and
    returns one pipe-separated string such as "OK|QP-77" or "ERROR|LIMIT_EXCEEDED".
    """

    def submit_payment(
        self, reference: str, amount_text: str, currency_code: str
    ) -> str:
        if Decimal(amount_text) > Decimal("2000"):
            return "ERROR|LIMIT_EXCEEDED"
        return f"OK|QP-{reference}"
