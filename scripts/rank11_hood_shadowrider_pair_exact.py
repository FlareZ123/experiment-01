"""Exact second-turn Hood/Shadow Rider resource access, under restricted draws."""
from fractions import Fraction
from itertools import product
from math import comb

COUNTS = (4, 10, 4, 2, 1, 11, 28)
EVENTS = ('hood', 'hood_v', 'hood_v_vmax', 'hood_v_vmax_energy',
          'hood_v_vmax_two_energy')


def c(n, k):
    return comb(n, k) if 0 <= k <= n else 0


def exact_rates():
    sums = [0] * 5
    for s in product(*(range(min(n, 8) + 1) for n in COUNTS)):
        if sum(s) != 8 or not s[0] + s[1]:
            continue
        v, b, m, h, a, e, _ = s
        w = 7 if v + b == 1 else 8
        for n, k in zip(COUNTS, s):
            w *= c(n, k)
        u = [n - k for n, k in zip(COUNTS, s)]
        lm, lh, le = u[2], u[3], u[5]
        rest = 52 - lm - lh - le
        for pm in range(7):
            for ph in range(3):
                for pe in range(7):
                    p = c(lm, pm)*c(lh, ph)*c(le, pe)*c(rest, 6-pm-ph-pe)
                    if not p or not (h or (a and lh > ph)):
                        continue
                    x = w*p
                    vm, en = lm-pm, le-pe
                    sums[0] += 46*x
                    if not v:
                        continue
                    sums[1] += 46*x
                    sums[2] += (46 if m else vm)*x
                    sums[3] += ((46 if e else en) if m else
                                (vm if e else 0))*x
                    sums[4] += ((46 if e >= 2 else
                                 (en if e == 1 else 0)) if m else
                                (vm if e >= 2 else 0))*x
    den = 8*comb(60, 8)*comb(52, 6)*46
    legal = Fraction(comb(60, 7)-comb(46, 7), comb(60, 7))
    return {k: Fraction(v, den)/legal for k, v in zip(EVENTS, sums)}


if __name__ == '__main__':
    for name, p in exact_rates().items():
        print(name, f'{float(p)*100:.12f}%', p)
