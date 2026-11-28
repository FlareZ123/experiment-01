"""Run from root: python tests/2026-11/agent15-second-rider-t2-restoration.test.py"""
from collections import Counter
from random import Random
import sys
from importlib import import_module
sys.path.insert(0,'scripts/2026-11')
m=import_module('agent15-second-rider-t2-restoration')
assert sum(m.COUNTS.values())==60 and len(m.DECK)==60

def deal(hand,required_prizes=()):
    bag=Counter(m.DECK)
    for x in hand:
        assert bag[x]>0
        bag[x]-=1
    for x in required_prizes:
        assert bag[x]>0
        bag[x]-=1
    extras=[]
    for c,n in bag.items():
        if c not in ('DxMax','V','Z','R'):
            extras.extend([c]*n)
    return hand,list(required_prizes)+extras[:6-len(required_prizes)]

h,p=deal(['Latias','Z','R','V','P','P','FSS'])
assert m.t1_best(h,p)==(True,1.0)
assert m.t1_best(h,p,need_extra_rider=False)[0]
# Radiant as the only opening Basic is forced Active, so Gate can't fire.
h,p=deal(['Z','V','FSS','P','Lillie','Guzma','Arven'])
assert m.t1_best(h,p)==(False,0.0)
# A Prized singleton Deoxys VMAX cannot be fetched by Radiant Gate.
h,p=deal(['Latias','Z','R','FSS','P','Lillie','Guzma'],['DxMax'])
assert not m.t1_best(h,p)[0]
# All Rider V copies Prized: ordinary Gate may succeed, extra T2 Rider can't.
h,p=deal(['Latias','Z','P','FSS','Lillie','Guzma','Arven'],['R','R','R'])
assert m.t1_best(h,p,need_extra_rider=False)[0]
assert not m.t1_best(h,p,need_extra_rider=True)[0]
rng=Random(27112028)
for _ in range(200):
    cards=m.DECK.copy();rng.shuffle(cards);h,p=cards[:7],cards[7:13]
    possible,_=m.t1_best(h,p,need_extra_rider=False)
    extra,q=m.t1_best(h,p)
    protected,_=m.t1_best(h,p,protect=True)
    assert not extra or possible
    assert 0<=q<=1
    assert not protected or extra
all_plans=m.simulate(500,27112028)
conserved=m.simulate(500,27112028,protect=True)
assert all_plans['legal']==conserved['legal']
assert all_plans['any_gate']>=all_plans['gate_with_rider']>=conserved['gate_with_rider']
assert all_plans['gate_plus_restoration_over_legal']>=conserved['gate_plus_restoration_over_legal']
print('T1 hybrid Gate / T2 second Rider restoration regression passed')
