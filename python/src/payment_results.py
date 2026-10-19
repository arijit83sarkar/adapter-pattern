from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class PaymentResult:
    success: bool
    transaction_id: Optional[str]
    message: str
