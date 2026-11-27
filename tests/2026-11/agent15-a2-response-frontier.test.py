"""Run: python tests/2026-11/agent15-a2-response-frontier.test.py"""
from dataclasses import replace
from importlib.machinery import SourceFileLoader
m=SourceFileLoader('frontier','scripts/2026-11/agent15-a2-response-frontier.py').load_module()
s=m.Scenario()
c=m.coverage(s)
assert c['D']['covered']==6,c
assert c['R']['covered']==2,c
assert c['A']['covered']==4,c
assert c['G']['covered']==2,c
assert m.assess(s,'D','covert')['used']==('Door','manual')
assert m.assess(s,'D','rolling')['used']==('Door','manual','Ranger')
assert m.assess(s,'D','timeless_phantom')['source_prizes']==3
assert not m.assess(replace(s,source_prizes_before=3),'D','timeless_phantom')['success']
assert m.coverage(replace(s,ranger_available=False))['D']['covered']==5
assert m.coverage(replace(s,held_psychic=0))['D']['covered']==0
assert m.coverage(replace(s,vs_seeker_available=False))['R']['covered']==0
assert m.coverage(replace(s,two_exposed_v=False))['G']['covered']==0
hood=m.coverage(replace(s,dna=False,deoxys_benched=False))
assert hood['A']['covered']==2,hood
assert hood['R']['covered']==1,hood
assert hood['G']['covered']==1,hood
print('A2 response frontier 15 assertions passed')
