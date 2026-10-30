"""Exact marginal mulligan-bonus card-location frontier for a fixed 60."""
from fractions import Fraction as F
from math import comb

def route_given_bonus(m):
    """Tinkaton/Poffin in first 8+m; four channels in first 9+m; valid seven."""
    assert 0 <= m <= 45
    v = 1 - F(comb(49, 7), comb(60, 7))
    out = F(0)
    for bits in range(16):
        miss = sum(n for i, n in enumerate((7, 4, 6, 2)) if bits & (1 << i))
        for no_setup in range(2):
            for no_basics in range(2):
                opener = 15 if no_setup and no_basics else (
                    8 if no_setup else 11 if no_basics else 0)
                if 60-miss-opener < 7 or 53-miss-8*no_setup < 1+m:
                    continue
                if 52-m-miss < 0:
                    continue
                term = F(comb(60-miss-opener, 7), comb(60, 7))
                term *= F(comb(53-miss-8*no_setup, 1+m), comb(53, 1+m))
                term *= F(52-m-miss, 52-m)
                out += (-1)**(bits.bit_count()+no_setup+no_basics)*term
    return out/v

def thorns_bonus_bounds(cutoff=30):
    """Mulligan-race mixture with all optional bonus cards taken; tail bounded."""
    assert 0 <= cutoff <= 45
    u=1-F(comb(49,7),comb(60,7))
    t=1-F(comb(56,7),comb(60,7))
    positive=u*(1-t)/(1-(1-u)*(1-t))
    low=(1-positive)*route_given_bonus(0)
    for m in range(1,cutoff+1):
        mass=positive*t*(1-t)**(m-1)
        low+=mass*route_given_bonus(m)
    tail=positive*(1-t)**cutoff
    return dict(candidate_valid=u,thorns_valid=t,bonus_probability=positive,
                no_bonus=route_given_bonus(0),lower=low,upper=low+tail,
                unresolved_tail=tail,cutoff=cutoff)
