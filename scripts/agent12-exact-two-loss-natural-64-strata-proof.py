#!/usr/bin/env python3
"""Exact-rational certificate for the 64-stratum, 20-games/stratum, <=2-loss bound."""
from fractions import Fraction as F
from math import comb

M = 64
N = 20
Q = F(8, 25)  # 64 * 0.005

# Pairwise-equalization derivative:
# D = P0 + R*P1 + T*P2, where
# P0 = (N-1)*(-A*b + (N-2)/2*b**2 + t*A)
# P1 = A*((N-1)*b - A), P2=A**2,
# A=1-s+t, b=s-2t, u=Q-s,
# R=N*sum(q_k/(1-q_k)), and
# T=N**2/2*(sum r_k)**2 - N/2*sum(r_k**2).
#
# Jensen and superadditivity give:
# Rlo=N*u/(1-u/(M-2)) <= R <= N*u/(1-u)=Rhi.
# Also T >= (N-1)/(2*N)*R**2.

# P0 >= -(N-1)*s throughout, since A<=1, 0<=b<=s, t>=0.
# If P1<0, |P1|=A*(A-(N-1)*b) <= A**2 <= 1, so P1*R >= -Rhi.
# Region A: 0 <= s <= 3/50. Use worst-case bounds over the region.
sA = F(3, 50)
uA = Q - sA
RloA = N * uA / (1 - uA / (M - 2))
Rhi_max = N * Q / (1 - Q)
TloA = F(N - 1, 2 * N) * RloA**2
A2_min_A = (1 - sA)**2
lower_A = -(N - 1) * sA - Rhi_max + A2_min_A * TloA
assert lower_A > 0

# For s >= 3/50, b >= s - s**2/2 and A <= 1.
# 19*s*(1-s/2) is increasing on [3/50, 8/25] and exceeds 1
# at s=3/50, hence P1=A*(19*b-A)>0 on regions B and C.
assert F(19) * F(3, 50) * (1 - F(3, 100)) > 1

# Region B: 3/50 <= s <= 103/1000. P1>=0; use P0>=-19*s
# and the smallest possible u and A over this region.
sB = F(103, 1000)
uB = Q - sB
RloB = N * uB / (1 - uB / (M - 2))
TloB = F(N - 1, 2 * N) * RloB**2
A2_min_B = (1 - sB)**2
lower_B = -(N - 1) * sB + A2_min_B * TloB
assert lower_B > 0

# Region C: s >= 103/1000. P1>=0. The function
# h(s,t)=-A*b+9*b**2+t*A is convex in t (h_tt=78).
# Its endpoint values are:
# h(s,0)=s*(10*s-1)
# h(s,s**2/4)=s*(s-2)**2*(39*s-4)/16.
# Both are nonnegative for s>=103/1000 (>1/10 and >4/39).
assert sB >= F(1, 10)
assert sB > F(4, 39)
assert F(78) > 0

# Exact binomial lower tails under the equal-stratum null point.
failure = F(1, 200)
win = 1 - failure

def binomial_cdf_at_most_two(n):
    return (
        win**n
        + n * failure * win**(n - 1)
        + F(comb(n, 2)) * failure**2 * win**(n - 2)
    )

p20 = binomial_cdf_at_most_two(M * 20)
p19 = binomial_cdf_at_most_two(M * 19)
assert p20 < F(1, 20)
assert p19 > F(1, 20)

# Two-look natural-protocol rule: early all-win after 19 rounds,
# otherwise continue to 20 rounds and pass with <=2 total nonwins.
alpha_early = win ** (M * 19)
alpha_final = p20
assert alpha_early + alpha_final < F(1, 20)

print(f"Region A lower bound: {lower_A} = {float(lower_A):.12f}")
print(f"Region B lower bound: {lower_B} = {float(lower_B):.12f}")
print(f"n=20, N=1280, P[X<=2] = {float(p20):.17g}")
print(f"n=19, N=1216, P[X<=2] = {float(p19):.17g}")
print(f"early all-win alpha = {float(alpha_early):.17g}")
print(f"two-look alpha upper bound = {float(alpha_early + alpha_final):.17g}")
