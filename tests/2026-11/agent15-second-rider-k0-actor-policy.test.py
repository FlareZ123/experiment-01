"""Run from repository root:
python tests/2026-11/agent15-second-rider-k0-actor-policy.test.py
"""
from importlib.machinery import SourceFileLoader
from collections import Counter
from random import Random
m=SourceFileLoader('agent15_k0','scripts/2026-11/agent15-second-rider-k0-actor-policy.py').load_module()
assert len(m.base.DECK)==60

# Actual hand-only discard error: a one-card paid Treasure fetch for Rider V
# must preserve held Forest Seal Stone to evolve that Rider the next turn.
h=['Z','Heavy','FSS','T','Mimi','Stamp','Arven']
p=['Blower','T','VS','Iono','Ranger','T']
greedy=m.possible_plans_greedy(h,True)[0]
guarded=m.possible_plans(h,True)[0]
assert greedy['drops']==('FSS',)
assert guarded['drops']==('Stamp',)
assert m.apply_plan(h,p,greedy)==(True,3/44)
assert m.apply_plan(h,p,guarded)==(True,1.)

# Search/Prize failures cannot be silently rewound to original hand.
h=['Latias','Z','T','P','P','FSS','Lillie']
p=['R','R','R','V','Hood','Trev']
assert m.possible_plans(h,True)
assert m.k0_route(h,p)==(False,False,0.0)

rng=Random(27112028)
for _ in range(200):
    cards=m.base.DECK.copy();rng.shuffle(cards)
    hand,prizes=cards[:7],cards[7:13]
    g,x,prob=m.k0_route(hand,prizes)
    assert 0<=prob<=1
    assert not x or g
    protected=m.k0_route(hand,prizes,protect=True)
    upper=m.base.t1_best(hand,prizes,protect=True)[1]
    assert protected[2]<=upper+1e-12

# Paired reproducible seed; not a statistically representative match study.
trial=m.paired_compare(5000,27112028,False)
assert trial['eligible']==4305
assert trial['preserve_improvements']==2
assert trial['restoration_expected']['greedy']<trial['restoration_expected']['preserve']
assert abs(trial['restoration_expected']['preserve']-trial['restoration_expected']['oracle'])<1e-9
strict=m.paired_compare(5000,27112028,True)
assert strict['restoration_expected']['preserve']<=strict['restoration_expected']['oracle']+1e-9
print('Actor-only K0 second-Rider restoration policy regression passed')
