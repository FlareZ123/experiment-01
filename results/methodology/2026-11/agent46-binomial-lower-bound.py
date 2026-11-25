#!/usr/bin/env python3
"""Standard-library confidence and power planning for a 99.5% win-rate claim."""

from math import exp, lgamma, log, log1p


TARGET = 0.995
ALPHA = 0.05


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


def clopper_pearson_lower(n: int, non_wins: int, alpha: float = ALPHA) -> float:
    if n < 1 or not 0 <= non_wins <= n:
        raise ValueError("Require n >= 1 and 0 <= non_wins <= n.")
    if non_wins == n:
        return 0.0
    return beta_quantile(alpha, n - non_wins, non_wins + 1)


def minimum_games(non_wins: int, alpha: float = ALPHA, target: float = TARGET) -> int:
    """Smallest n whose exact lower bound reaches target for given losses."""
    if non_wins < 0:
        raise ValueError("non_wins must be nonnegative.")
    low = non_wins + 1
    high = max(100, 2 * low)
    while clopper_pearson_lower(high, non_wins, alpha) < target:
        high *= 2
    while low < high:
        midpoint = (low + high) // 2
        if clopper_pearson_lower(midpoint, non_wins, alpha) >= target:
            high = midpoint
        else:
            low = midpoint + 1
    return low


def binomial_cdf(non_wins: int, n: int, loss_probability: float) -> float:
    """P(K <= non_wins) for K~Binomial(n, loss_probability)."""
    if non_wins < 0:
        return 0.0
    if non_wins >= n:
        return 1.0
    if loss_probability <= 0.0:
        return 1.0
    if loss_probability >= 1.0:
        return 0.0
    return regularized_incomplete_beta(
        1.0 - loss_probability, n - non_wins, non_wins + 1
    )


def power_plan(
    true_win_rate: float,
    desired_power: float,
    alpha: float = ALPHA,
    target: float = TARGET,
    max_non_wins: int = 1000,
) -> tuple[int, int, float]:
    """Find the first acceptance threshold with the requested power.

    For each possible accepted non-win count k, the smallest sample size that
    accepts k is a threshold. Between thresholds the acceptance count is fixed
    and power decreases as n grows, so it is sufficient to inspect thresholds.
    """
    if not 0.0 < true_win_rate < 1.0:
        raise ValueError("true_win_rate must be between 0 and 1.")
    if not 0.0 < desired_power < 1.0:
        raise ValueError("desired_power must be between 0 and 1.")
    for non_wins in range(max_non_wins + 1):
        n = minimum_games(non_wins, alpha, target)
        power = binomial_cdf(non_wins, n, 1.0 - true_win_rate)
        if power >= desired_power:
            return n, non_wins, power
    raise ValueError("Increase max_non_wins; power target not reached.")


def main() -> None:
    print("losses,aggregate_n_95pct,per_matchup_n_95pct,per_matchup_n_familywise_95pct,total_32_familywise")
    for losses in range(4):
        aggregate = minimum_games(losses, 0.05)
        individual = minimum_games(losses, 0.05)
        familywise = minimum_games(losses, 0.05 / 32)
        print(f"{losses},{aggregate},{individual},{familywise},{32 * familywise}")

    print("true_win_rate,power80_n,accepted_losses,power80,power90_n,accepted_losses,power90")
    expected_power = {
        0.996: ((28134, 121), (38601, 170)),
        0.997: ((6279, 22), (8591, 32)),
        0.998: ((2366, 6), (3389, 10)),
        0.999: ((1258, 2), (1549, 3)),
        0.9995: ((947, 1), (947, 1)),
        0.9999: ((598, 0), (598, 0)),
    }
    for true_rate, expected in expected_power.items():
        p80 = power_plan(true_rate, 0.80)
        p90 = power_plan(true_rate, 0.90)
        assert (p80[0], p80[1]) == expected[0]
        assert (p90[0], p90[1]) == expected[1]
        print(
            f"{true_rate:.4f},{p80[0]},{p80[1]},{p80[2]:.6f},"
            f"{p90[0]},{p90[1]},{p90[2]:.6f}"
        )

    assert minimum_games(0, 0.05) == 598
    assert minimum_games(0, 0.05 / 32) == 1290
    assert clopper_pearson_lower(598, 0, 0.05) >= TARGET
    assert clopper_pearson_lower(597, 0, 0.05) < TARGET
    print(f"19_games_zero_losses_per_matchup_lower_95pct={clopper_pearson_lower(19, 0):.12f}")


if __name__ == "__main__":
    main()
