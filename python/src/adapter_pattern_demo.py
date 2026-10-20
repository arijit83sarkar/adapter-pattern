"""
Adapter pattern: a payment example in core Python (works on Python 3.9+).

Run it with:
    python3 adapter_pattern_demo.py
"""

from decimal import Decimal

from checkout_service import CheckoutService
from old_bank_adapter import OldBankAdapter
from old_bank_api import OldBankApi
from quick_pay_adapter import QuickPayAdapter
from quick_pay_sdk import QuickPaySdk

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
