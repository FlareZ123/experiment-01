"""Run from repo root: python tests/2026-11/agent15-rank-a2-frontier.test.py"""
from pathlib import Path
import sys,json
from importlib import import_module
sys.path.insert(0,'scripts/2026-11')
m=import_module('agent15-rank-a2-frontier')
raw=json.loads(Path('results/aichi-2026/full-decklists.json').read_text())
rows=m.evaluate(raw)
assert [r['rank'] for r in rows]==[12,13,14,20,21,27,32]
d={r['rank']:r for r in rows}
assert d[12]['gate_covered']=={'D':4,'R':2,'A':3,'G':2}
assert d[14]['gate_covered']=={'D':6,'R':2,'A':4,'G':2}
assert d[20]['gate_covered']=={'D':5,'R':2,'A':3,'G':2}
assert d[21]['gate_covered']=={'D':5,'R':2,'A':4,'G':0}
assert d[32]['hood_covered']['D']==0
assert d[32]['gate_covered']['D']==6
assert d[27]['gate_covered']['D']==4
for r in rows:
    assert r['gate_covered']['D']==len(r['attack_types'])
    assert r['hood_covered']['D']==0
    assert r['regidrago_v'] in (3,4)
print('inventory-filtered A2 frontier regression passed (29 published source lists)')
