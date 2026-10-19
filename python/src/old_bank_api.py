# ---------------------------------------------------------------------------
# 1. TARGET: the interface our own code wants to use.
#    CheckoutService only ever knows about this.
# ---------------------------------------------------------------------------
class OldBankApi:
    """Old bank library: wants paise (an int) and returns a plain number.

    > 0  -> transaction number (success)
    < 0  -> negative error code (failure)
    """

    def __init__(self):
        self.next_transaction_number = 1001

    def make_transaction(self, amount_in_paise: int) -> int:
        if amount_in_paise > 5_00_000:
            return -51
        number = self.next_transaction_number
        self.next_transaction_number += 1
        return number
