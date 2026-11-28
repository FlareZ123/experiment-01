#!/usr/bin/env python3
"""Exact first-own-draw Guzma & Hala / Wonder Tag access in fixed New Moon v5.

This is a PHYSICAL SOURCE-COPY visibility screen, not supporter use,
discard-payment, Item-lock escape, player competence or game win probability.

Opening seven must contain at least one Basic Pokemon. A non-Active Tapu Lele-GX
can be retained in hand for Wonder Tag on own turn; if Tapu was the sole Basic
in initial seven it must begin Active and cannot Wonder Tag by being benched.
If Tapu is the first regular draw, an opening Active already exists.
No opponent mulligan bonus, searches, first-turn attack or abilities locked.
Prize: if Guzma & Hala is not drawn among the first eight, its survival in the
47-card draw-deck after six prizes is 46/52 by uniform sampling.
"""
from math import comb
from fractions import Fraction

def choose(n,k):
    return comb(n,k) if 0<=k<=n else 0

def exact_supporter_channels():
    # Tapu Lele-GX (Basic) 1; remaining Basic Pokemon 16;
    # Guzma & Hala (Supporter) 1; remaining nonbasic cards 42.
    total=direct=via_tapu=0
    union=Fraction(0)
    for tapu in (0,1):
        for other_basic in range(8-tapu):
            for gh in (0,1):
                other=7-tapu-other_basic-gh
                if other<0 or tapu+other_basic==0:continue
                weight=(choose(1,tapu)*choose(16,other_basic)
                        *choose(1,gh)*choose(42,other))
                if weight==0:continue
                for drawn,remain in [
                    ("Tapu",1-tapu),("otherBasic",16-other_basic),
                    ("GuzmaHala",1-gh),("other",42-other)]:
                    if remain<=0:continue
                    ways=weight*remain
                    total+=ways
                    own_supporter=bool(gh or drawn=="GuzmaHala")
                    # Choose other Basic Active instead of opening Tapu;
                    # or draw Tapu later, and play it from hand to Bench.
                    eligible_tapu=(bool(tapu and other_basic>=1)
                                   or drawn=="Tapu")
                    if own_supporter:direct+=ways
                    if eligible_tapu:via_tapu+=ways
                    if own_supporter:
                        union+=ways
                    elif eligible_tapu:
                        union+=Fraction(ways*46,52)
    return {
        "direct_supporter":Fraction(direct,total),
        "hand_playable_tapu":Fraction(via_tapu,total),
        "combined_if_wonder_tag_live":union/total,
        "combined_if_wonder_tag_suppressed":Fraction(direct,total),
    }

if __name__=="__main__":
    result=exact_supporter_channels()
    expected={
        "direct_supporter":Fraction(3752617,29041933),
        "hand_playable_tapu":Fraction(62469984,493712861),
        "combined_if_wonder_tag_live":Fraction(112812273,493712861),
        "combined_if_wonder_tag_suppressed":Fraction(3752617,29041933),
    }
    assert result==expected,(result,expected)
    for name,probability in result.items():
        print(f"{name} = {100*float(probability):.9f}% = {probability}")
