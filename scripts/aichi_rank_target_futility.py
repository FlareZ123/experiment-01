"""Exact fixed-horizon 99.5% target-futility mathematics for opponent cohorts.

This module performs arithmetic on hypotheses, not observed game outcomes.
A fixed, preregistered cohort's opponent rank and playing seat must be sampled
independently and uniformly for each genuine game to invoke the binomial test.
"""

from fractions import Fraction
from math import comb


TARGET_WIN_RATE = Fraction(199, 200)
ONE_SIDED_ALPHA = Fraction(1, 20)


def max_nonwin_rate(field_size: int, cohort_size: int,
                    required_win_rate: Fraction = TARGET_WIN_RATE) -> Fraction:
    """Conservative cohort nonwin ceiling if full-field win target is met."""
    if not (field_size >= cohort_size >= 1):
        raise ValueError("Require 1 <= cohort_size <= field_size")
    if not (0 <= required_win_rate <= 1):
        raise ValueError("required_win_rate must be a probability")
    return min(Fraction(1), field_size * (1 - required_win_rate) / cohort_size)


def binomial_upper_tail(n: int, nonwins: int, rate: Fraction) -> Fraction:
    """Exact P(Binomial(n, rate) >= nonwins), no floating approximation."""
    if n < 0 or not (0 <= nonwins <= n) or not (0 <= rate <= 1):
        raise ValueError("Invalid binomial arguments")
    return sum(
        (Fraction(comb(n, i)) * rate ** i * (1 - rate) ** (n - i)
         for i in range(nonwins, n + 1)),
        Fraction(0),
    )


def minimum_rejecting_nonwins(n: int, null_nonwin_rate: Fraction,
                              alpha: Fraction = ONE_SIDED_ALPHA) -> int | None:
    """Minimum nonwins needed to reject a fixed-horizon upper rate bound."""
    if n < 1 or not (0 <= null_nonwin_rate <= 1) or not (0 < alpha < 1):
        raise ValueError("Invalid test arguments")
    return next(
        (k for k in range(n + 1)
         if binomial_upper_tail(n, k, null_nonwin_rate) <= alpha),
        None,
    )
