"""Exact alpha spending across arbitrarily many future candidate tests.

A level-alpha_i per-candidate test controls the family of future false
certifications if each test's null p-value is valid conditional on history.
"""
from __future__ import annotations

from fractions import Fraction

from scripts.aichi_balanced_global_gate import balanced_global_test


def familywise_alpha(attempt_index: int, *, total_alpha: str = "0.05") -> Fraction:
    """Spend alpha / (i*(i+1)) for predeclared candidate attempt i >= 1."""
    if type(attempt_index) is not int or attempt_index < 1:
        raise ValueError("Attempt index must be a positive integer")
    budget = Fraction(total_alpha)
    if not 0 < budget < 1:
        raise ValueError("Familywise alpha must lie strictly between zero and one")
    return budget / (attempt_index * (attempt_index + 1))


def balanced_familywise_test(
    records, *, attempt_index: int, total_alpha: str = "0.05",
    target: str = "0.995",
) -> dict:
    """Apply fixed-horizon global field test at a preallocated familywise level."""
    allocated = familywise_alpha(attempt_index, total_alpha=total_alpha)
    result = balanced_global_test(
        records, target=target, confidence=str(1 - allocated)
    )
    return {
        **result,
        "confirmatory_attempt_index": attempt_index,
        "allocated_one_sided_alpha": str(allocated),
        "familywise_alpha_budget": str(Fraction(total_alpha)),
        "multiple_testing_warning": (
            "This union-bound protection assumes prospectively committed attempt "
            "indices and conditionally valid p-values from genuinely new independent "
            "confirmatory games; recycled or cherry-picked data invalidate it"
        ),
    }
