#!/usr/bin/env python3
"""Exact legal-seven, six-Prize, pre-turn-draw surface for early Gladion.

Natural observation only: no searches, attacks, locks, extra draws, source
responses or gameplay. Event: singleton Dusknoir is Prized, Gladion isn't,
>=1 Duskull and >=1 Dusclops are outside Prizes, and Gladion is in opening
seven or first k ordinary turn-start draws (k=0..4).
"""
from itertools import product
from math import comb
from fractions import Fraction

# v3g physical categories: one Stage2, one Gladion, two Duskull Basics,
# two Dusclops, 15 other Basics, 39 other non-Basics. Exactly 60/17 Basics.
COUNTS=(1,1,2,2,15,39)
assert sum(COUNTS)==60

def allocations(cap,total):
    """Enumerate bounded category counts and multivariate hypergeom weight."""
    for x in product(*(range(min(total,c)+1) for c in cap)):
        if sum(x)==total:
            ways=1
            for c,i in zip(cap,x):
                ways*=comb(c,i)
            yield x,ways

legal_seven=comb(60,7)-comb(43,7)
physical=0
natural={k:Fraction(0) for k in range(5)}
for hand,hways in allocations(COUNTS,7):
    if hand[0] or hand[2]+hand[4]==0:
        continue
    rest=tuple(c-h for c,h in zip(COUNTS,hand))
    for prize,pways in allocations(rest,6):
        # Must Prize Stage2, not Prize Gladion, and leave >=1 each
        # Duskull/Dusclops in all non-Prize zones including the hand.
        if prize[0]!=1 or prize[1]!=0 or prize[2]>=2 or prize[3]>=2:
            continue
        cases=hways*pways
        physical+=cases
        for k in natural:
            # k turn-start draws from the post-Prize 47-card deck.
            # A singleton unprized Gladion is available if initially held,
            # else in precisely k/47 of post-Prize draw prefixes.
            p=Fraction(1) if hand[1] else Fraction(k,47)
            natural[k]+=cases*p

conditional_den=legal_seven*comb(53,6)
# Independently reproduces Agent1's +9.081806579 pp physical-role gain.
assert abs(float(Fraction(100*physical,conditional_den))-9.081806579)<1e-8
assert all(0<=natural[k]<=physical for k in natural)
assert all(natural[k]<=natural[k+1] for k in range(4))
print('legal-seven probability:',round(legal_seven/comb(60,7),9))
print('physically rescue-capable:',f'{100*physical/conditional_den:.9f}%')
for k,weight in natural.items():
    pct=100*float(weight/conditional_den)
    share=100*float(weight/physical)
    print(f'by own T{k} (opening+{k} ordinary draws): '
          f'{pct:.9f}% of legal openings; {share:.6f}% of physical cases')
