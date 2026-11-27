"""Finite combinatorial checks, not gameplay simulation."""
from itertools import product, combinations
from math import comb
from fractions import Fraction
def p_live(d,h,gd,gh):
    assert 0<=gd<=d and 0<=gh<=h
    if d+h<5: return Fraction(0)
    kd=min(5,d); kh=5-kd
    return 1-Fraction(comb(d-gd,kd),comb(d,kd))*Fraction(comb(h-gh,kh),comb(h,kh))
def guaranteed(d,h,gd,gh):
    kd=min(5,d); kh=5-kd
    return d+h>=5 and (d-gd<kd or h-gh<kh)
board_cases=0
for total in range(1,10):
    for singles in range(min(total,5)+1):
        for active_single in (0,1):
            if not (active_single<=singles and 1-active_single<=total-singles and total-singles>=1): continue
            bench=[1]*(singles-active_single)+[2]*(total-singles-(1-active_single))
            active=1 if active_single else 2
            for dropped in combinations(range(len(bench)),max(0,len(bench)-5)):
                remaining=[active]+[x for i,x in enumerate(bench) if i not in dropped]
                assert 2 in remaining
                board_cases+=1
prob_cases=0
for d,h in product(range(9),repeat=2):
    for gd,gh in product(range(min(d,2)+1),range(min(h,2)+1)):
        if gd+gh>2: continue
        kd=min(d,5); kh=5-kd
        if h<kh:
            assert p_live(d,h,gd,gh)==0 and not guaranteed(d,h,gd,gh)
            prob_cases+=1
            continue
        trials=hits=0
        for dp in combinations(range(d),gd):
            for hp in combinations(range(h),gh):
                trials+=1
                hits+=any(p<kd for p in dp) or any(p<kh for p in hp)
        assert Fraction(hits,trials)==p_live(d,h,gd,gh)
        assert (hits==trials)==guaranteed(d,h,gd,gh)
        prob_cases+=1
print(f'{board_cases} Sky Field board/discard cases; {prob_cases} Marnie direct-out count cases; all passed')
for state in [(5,3,0,1),(5,3,1,1),(6,3,1,1),(4,1,0,1),(4,2,0,1),(3,5,0,2),(3,1,1,0)]:
    print(state,p_live(*state),guaranteed(*state))
