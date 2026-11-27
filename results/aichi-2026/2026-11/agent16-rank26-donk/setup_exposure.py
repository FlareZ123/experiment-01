from fractions import Fraction as F
from math import comb

N=60; H=7; O=12
D=comb(N,H)
q=F(comb(N-O,H),D)

def singleton_exposure(basic_count):
    if not 1 <= basic_count <= N-H+1: raise ValueError('basic count outside this model')
    p=F(comb(N-basic_count,H),D)
    p_one=F(basic_count*comb(N-basic_count,H-1),D)/(1-p)
    # Failed hands before first valid hand are independent geometric counts.
    # Net opponent-only failures K=max(Gopp-Gself,0). Both-failed rounds cancel.
    pk0=(1-q)/(1-p*q)
    # After a valid singleton seven, 53 remaining cards: b-1 Basics, 54-b non-Basics.
    # Six unknown Prizes are a random subset: marginal bonus sample is still hypergeometric.
    no_basic_bonus=pk0
    for k in range(1,min(47,54-basic_count)+1):
        pk=(1-p)*(1-q)*q**k/(1-p*q)
        no_basic_bonus+=pk*F(comb(54-basic_count,k),comb(53,k))
    forced=p_one*no_basic_bonus
    # Cap bonus draws at the remaining 47 cards; sum geometric tail exactly.
    if 54-basic_count>=47:
        pk_tail=(1-p)*q**48/(1-p*q)
        forced+=p_one*pk_tail*F(comb(54-basic_count,47),comb(53,47))
    return p_one,forced,forced/2

if __name__=='__main__':
    print('B, P(singleton7 | valid), P(forced singleton after maximum bonus), P(rank26 first and singleton), rank26 worst-case loss contribution to equal-rank mean')
    for b in range(10,23):
        p1,p2,p3=singleton_exposure(b)
        print(f'{b},{float(p1):.8%},{float(p2):.8%},{float(p3):.8%},{float(p3/32):.8%}')
    assert singleton_exposure(14)[2] > F(16,100)
    assert singleton_exposure(16)[2] < F(16,100)
