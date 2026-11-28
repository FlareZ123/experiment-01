"""Run from repo root:
python tests/2026-11/agent15-clefairy-counter-gust.test.py
"""
from importlib.machinery import SourceFileLoader
from dataclasses import replace
m=SourceFileLoader('counter_gust','scripts/2026-11/agent15-clefairy-counter-gust.py').load_module()
s=m.State()
r=m.counter_response(s)
assert r['legal'] and r['damage']==190 and r['clefairy_ko']
assert r['source_prizes']==4 and not r['fairy_next']
assert r['a3_damage']==160 and not r['candidate_a3_win']
assert not m.counter_response(replace(s,has_band=False))['clefairy_ko']
assert m.counter_response(replace(s,has_band=False))['candidate_a3_win']
assert m.counter_response(replace(s,backup_clefairy_accessible=True))['candidate_a3_win']
assert not m.counter_response(replace(s,source_prizes=2))['legal']
assert not m.counter_response(replace(s,item_usable=False))['legal']
assert not m.counter_response(replace(s,counter_in_hand=False))['legal']
assert not m.counter_response(replace(s,payload_in_discard=False))['legal']
assert not m.counter_response(replace(s,apex_ready=False))['legal']
roll=m.counter_response(replace(s,source_attack='rolling',
    backup_clefairy_accessible=True,own_ranger_available=False))
assert roll['a3_damage']==240 and not roll['candidate_a3_win']
assert m.counter_response(replace(s,source_attack='rolling',
    backup_clefairy_accessible=True,own_ranger_available=True))['candidate_a3_win']
assert m.counter_response(replace(s,source_attack='ryuno',has_band=False))['clefairy_ko']
assert not m.counter_response(replace(s,source_attack='covert'))['clefairy_ko']
assert {r for r,c in m.rank_capability().items() if c['counter_phantom']}=={12,14,21,32}
assert {r for r,c in m.rank_capability().items() if c['counter_rolling']}=={14,21,32}
assert {r for r,c in m.rank_capability().items() if c['counter_ryuno_no_band']}=={14,32}
print('Counter Catcher Fairy Zone source counterplay regression passed')
