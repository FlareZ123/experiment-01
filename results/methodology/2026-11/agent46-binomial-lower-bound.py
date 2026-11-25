#!/usr/bin/env python3
"""Standard-library Clopper-Pearson lower bounds for the 99.5% evidence design."""

from math import exp, lgamma, log, log1p


def _beta_continued_fraction(a: float, b: float, x: float) -> float:
    max_iterations = 300
    epsilon = 3e-14
    floor = 1e-300
    qab, qap, qam = a + b, a + 1.0, a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < floor:
        d = floor
    d = 1.0 / d
    h = d
    for m in range(1, max_iterations + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < floor:
            d = floor
        c = 1.0 + aa / c
        if abs(c) < floor:
            c = floor
        d = 1.0 / d
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < floor:
            d = floor
        c = 1.0 + aa / c
        if abs(c) < floor:
            c = floor
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < epsilon:
            break
    return h


def regularized_incomplete_beta(x: float, a: float, b: float) -> float:
    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    log_bt = (
        lgamma(a + b) - lgamma(a) - lgamma(b)
        + a * log(x) + b * log1p(-x)
    )
    bt = exp(log_bt)
    if x < (a + 1.0) / (a + b + 2.0):
        return bt * _beta_continued_fraction(a, b, x) / a
    return 1.0 - bt * _beta_continued_fraction(b, a, 1.0 - x) / b


def beta_quantile(probability: float, a: float, b: float) -> float:
    low, high = 0.0, 1.0
    for _ in range(100):
        midpoint = (low + high) / 2.0
        if regularized_incomplete_beta(midpoint, a, b) < probability:
            low = midpoint
        else:
            high = midpoint
    return (low + high) / 2.0


def clopper_pearson_lower(n: int, non_wins: int, alpha: float) -> float:
    if n < 1 or not 0 <= non_wins <= n:
        raise ValueError("Require n >= 1 and 0 <= non_wins <= n.")
    if non_wins == n:
        return 0.0
    return beta_quantile(alpha, n - non_wins, non_wins + 1)


def minimum_games(non_wins: int, alpha: float, target: float = 0.995) -> int:
    if non_wins < 0:
        raise ValueError("non_wins must be nonnegative.")
    n = non_wins + 1
    while clopper_pearson_lower(n, non_wins, alpha) < target:
        n += 1
    return n


def main() -> None:
    print("losses,aggregate_n_95pct,per_matchup_n_95pct,per_matchup_n_familywise_95pct,total_32_familywise")
    for losses in range(4):
        aggregate = minimum_games(losses, 0.05)
        individual = minimum_games(losses, 0.05)
        familywise = minimum_games(losses, 0.05 / 32)
        print(f"{losses},{aggregate},{individual},{familywise},{32 * familywise}")
    print(f"19_games_zero_losses_per_matchup_lower_95pct={clopper_pearson_lower(19, 0, 0.05):.12f}")
    expected_aggregate = [598, 947, 1258, 1549]
    expected_familywise = [1290, 1744, 2135, 2494]
    for losses in range(4):
        assert minimum_games(losses, 0.05) == expected_aggregate[losses]
        assert minimum_games(losses, 0.05 / 32) == expected_familywise[losses]
        assert clopper_pearson_lower(expected_aggregate[losses], losses, 0.05) >= 0.995
        assert clopper_pearson_lower(expected_aggregate[losses] - 1, losses, 0.05) < 0.995


if __name__ == "__main__":
    main()
