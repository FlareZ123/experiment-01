"""Run from root: python tests/2026-11/agent15-one-v-two-door-energy-ceiling.test.py"""
import sys
from importlib import import_module
sys.path.insert(0,'scripts/2026-11')
m=import_module('agent15-one-v-two-door-energy-ceiling')
for n in (1,2):
    assert abs(sum(z[2] for z in m.draws(8,36,n))-1)<1e-12
    assert abs(sum(z[2] for z in m.draws(0,36,n))-1)<1e-12
for req in (9,10,11):
    for door in (1,2):
        for initial in (0,1):
            earliest=m.earliest_turn(req,door,initial)
            assert initial+(earliest-2)*(1+door)<req
            assert initial+(earliest-1)*(1+door)>=req
for door in (1,2):
    r=m.run(door,7,0)
    assert all(0<=d['p_ge_9']<=1 for d in r)
    assert all(r[i]['p_ge_9']<=r[i+1]['p_ge_9'] for i in range(len(r)-1))
    assert all(d['mean_attached']<=11 for d in r)
one=m.run(1,7,0);two=m.run(2,7,0)
assert one[3]['p_ge_9']==0 # turn 5
assert two[3]['p_ge_9']>0
assert one[4]['p_ge_9']>0 # turn 6
assert two[3]['p_ge_9']>one[3]['p_ge_9']
assert m.run(1,5,0,12)[-1]['p_ge_9']==0 # twelfth P does not break action cap
assert m.run(1,5,1,11)[-1]['p_ge_9']>0
print('post-Gate finite Door ceiling regression passed')
