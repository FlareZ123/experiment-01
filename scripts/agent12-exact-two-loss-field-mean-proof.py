#!/usr/bin/env python3
"""Exact-rational certificate for the 128-stratum, 10-games/cell, <=2-loss proof."""
from fractions import Fraction as F
from math import comb


def poly_sub(a, b):
    size = max(len(a), len(b))
    return [
        (a[i] if i < len(a) else F(0)) - (b[i] if i < len(b) else F(0))
        for i in range(size)
    ]


def poly_mul(a, b):
    result = [F(0)] * (len(a) + len(b) - 1)
    for i, left in enumerate(a):
        for j, right in enumerate(b):
            result[i + j] += left * right
    return result


def poly_derivative(a):
    return [F(i) * a[i] for i in range(1, len(a))]


def poly_divmod(a, b):
    remainder = a[:]
    quotient = [F(0)] * max(1, len(a) - len(b) + 1)
    while len(remainder) >= len(b) and not (len(remainder) == 1 and remainder[0] == 0):
        degree = len(remainder) - len(b)
        coefficient = remainder[-1] / b[-1]
        quotient[degree] = coefficient
        for index, value in enumerate(b):
            remainder[degree + index] -= coefficient * value
        while len(remainder) > 1 and remainder[-1] == 0:
            remainder.pop()
    return quotient, remainder


def power_to_bernstein_on_unit_interval(power_coefficients):
    degree = len(power_coefficients) - 1
    return [
        sum(
            power_coefficients[k] * F(comb(i, k), comb(degree, k))
            for k in range(i + 1)
        )
        for i in range(degree + 1)
    ]


# Case 1 lower bound:
# F1(s) = P(s) / ((25s+9)(25s+3134)^2), 0 <= s <= 2/19.
# Coefficients are stored low-degree first and all arithmetic is rational.
P = [
    F(149021440),
    F(26972769608),
    F(-82866212360),
    F(84498860750),
    F(-64823018750),
    F(22327109375),
]
linear_a = [F(9), F(25)]
linear_b = [F(3134), F(25)]
D = poly_mul(linear_a, poly_mul(linear_b, linear_b))
F1_derivative_numerator_uncancelled = poly_sub(
    poly_mul(poly_derivative(P), D),
    poly_mul(P, poly_derivative(D)),
)
# The derivative numerator and denominator share one (25s+3134) factor.
F1_derivative_numerator, derivative_remainder = poly_divmod(
    F1_derivative_numerator_uncancelled, [F(3134), F(25)]
)
assert derivative_remainder == [F(0)]

expected_derivative_numerator = [
    F(749051050091248),
    F(-4680997060014120),
    F(623840898527500),
    F(5998182838468750),
    F(-12117028680468750),
    F(6971872490234375),
    F(27908886718750),
]
assert F1_derivative_numerator == expected_derivative_numerator

# Substitute s = (2/19)z to put the proof interval on z in [0,1].
scaled_power = [
    coefficient * F(2, 19) ** k
    for k, coefficient in enumerate(F1_derivative_numerator)
]
bernstein = power_to_bernstein_on_unit_interval(scaled_power)
assert all(value > 0 for value in bernstein)

# F1(0) > 0, and its denominator is positive on the interval.
f1_at_zero = P[0] / D[0]
assert f1_at_zero == F(37255360, 22099401)
assert f1_at_zero > 0
assert 25 * F(0) + 9 > 0
assert 25 * F(2, 19) + 9 > 0
assert 25 * F(0) + 3134 > 0
assert 25 * F(2, 19) + 3134 > 0

# Case 2: the coarse analytic lower bound is strictly positive.
case2_lower = F(381123, 66125)
assert case2_lower > 0

# Case 3: h_t is negative, so h is minimized at t=s^2/4. The resulting
# g(s) is positive at the left endpoint and increasing over [11/50,16/25].
g_at_left = F(784179, 50000000)
assert g_at_left > 0
# g'(s) = (s-2)(19s^2 - 22s + 2)/2. The quadratic is convex and negative
# at both endpoints, so both factors are negative throughout the interval.
quadratic_at_left = 19 * F(11, 50) ** 2 - 22 * F(11, 50) + 2
quadratic_at_right = 19 * F(16, 25) ** 2 - 22 * F(16, 25) + 2
assert F(11, 50) - 2 < 0
assert quadratic_at_left < 0
assert quadratic_at_right < 0
# The upper bound on h_t is 6 - 40s + 19s^2; it decreases on this interval
# and is already negative at s=11/50.
h_t_upper_at_left = 6 - 40 * F(11, 50) + 19 * F(11, 50) ** 2
assert h_t_upper_at_left < 0
assert -40 + 38 * F(16, 25) < 0

# Exact binomial tails at the two adjacent sample sizes.
alpha = F(1, 20)
failure = F(1, 200)
win = 1 - failure


def binomial_cdf_at_most_two(n):
    return (
        win ** n
        + n * failure * win ** (n - 1)
        + F(comb(n, 2)) * failure ** 2 * win ** (n - 2)
    )


pvalue_10 = binomial_cdf_at_most_two(128 * 10)
pvalue_9 = binomial_cdf_at_most_two(128 * 9)
assert pvalue_10 < alpha
assert pvalue_9 > alpha

print('Bernstein coefficients of F1 derivative numerator on [0, 2/19]:')
for value in bernstein:
    print(value)
print(f'F1(0) = {f1_at_zero} = {float(f1_at_zero):.12f}')
print(f'case-2 lower bound = {case2_lower} = {float(case2_lower):.12f}')
print(f'case-3 g(11/50) = {g_at_left} = {float(g_at_left):.12f}')
print(f'n=10, N=1280, P[X<=2] = {float(pvalue_10):.17g} (exact fraction checked)')
print(f'n=9, N=1152, P[X<=2] = {float(pvalue_9):.17g} (exact fraction checked)')
