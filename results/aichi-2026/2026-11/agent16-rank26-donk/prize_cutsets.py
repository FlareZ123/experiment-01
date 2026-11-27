#!/usr/bin/env python3
"""Exact optimistic hard-prize ceiling for rank26 first-player Crisis Punch.
All source non-prized cards assumed perfectly accessible. Ticket available =>
no declared failure, regardless of how difficult Ticket is to find/use. No
claims about game win rate. Conditional on Basic-valid opening seven.
"""
from math import comb
from collections import Counter
from fractions import Fraction

# Counts partition original rank26, exact 12 Basic and 48 other cards.
CATS = [('ticket',1,0),('dce',1,0),('lightning',2,0),('meloetta',1,1),
        ('koko',1,1),('egg',2,1),('heavyball',2,0),('tm',2,0),
        ('ruins',4,0),('pump',4,0),('dowsing',1,0),('cologne',1,0),
        ('otherbasic',8,1),('other',30,0)]
assert sum(n for _,n,_ in CATS)==60
assert sum(n*b for _,n,b in CATS)==12
DEN=(comb(60,7)-comb(48,7))*comb(53,6)

def allocations(i=0,left=6,p=None,m=1,b=0):
    p={} if p is None else p
    if i==len(CATS):
        if left==0:
            # Every physical Prize combination admits this many valid opening hands.
            yield p.copy(),m*(comb(54,7)-comb(42+b,7))
        return
    key,n,is_basic=CATS[i]
    for k in range(min(n,left)+1):
        p[key]=k
        yield from allocations(i+1,left-k,p,m*comb(n,k),b+k*is_basic)
    p.pop(key,None)

def hard_failure(p,wob=False):
    # Ticket can rotate prizes even when all other recovery is blocked.
    if not p['ticket']:return None
    if p['dce']:return 'DCE + Ticket prized'
    if p['lightning']==2:return 'both Lightning + Ticket prized'
    if p['tm']==2:return 'both Crisis Punch TM + Ticket prized'
    if p['ruins']==4:return 'all Risky Ruins + Ticket prized'
    if wob and p['cologne']:return 'Cologne + Ticket prized under Wobbuffet'
    heavy=2-p['heavyball']; core=p['meloetta']+p['koko']
    if core>heavy:return 'insufficient Heavy Ball for prized core Basics'
    eggs=2-p['egg']+min(p['egg'],heavy-core)
    pumps=4-p['pump']+1-p['dowsing']
    if not eggs:return 'no accessible Egg'
    if pumps<(3 if eggs==2 else 4):return 'insufficient Pump uses even with optimal recovery'
    return None

def run():
    sums={False:Counter(),True:Counter()}; total=0; n=0
    for p,w in allocations():
        n+=1;total+=w
        for wob in sums:
            sums[wob][hard_failure(p,wob) or 'not disproved']+=w
    assert total==DEN
    print(f'{n:,} prize compositions; exact physical deal denominator {DEN:,}')
    for wob,counts in sums.items():
        print('\nWobbuffet lock:',wob)
        for name,value in counts.most_common():print(f'  {name:<58} {100*value/DEN:12.8f}%')
        fail=DEN-counts['not disproved']
        print('  hard-failure probability:',Fraction(fail,DEN),f'{100*fail/DEN:.8f}%')
        print('  optimistic conversion ceiling:',f'{100*(DEN-fail)/DEN:.8f}%')
    return sums
if __name__=='__main__':run()
