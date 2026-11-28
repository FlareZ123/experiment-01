"""Run from repo root:
python tests/2026-11/agent15-vstar-field-coverage.test.py
"""
import json
from importlib.machinery import SourceFileLoader
m=SourceFileLoader('vstar_field','scripts/2026-11/agent15-vstar-field-coverage.py').load_module()
r=m.scan(json.loads(m.SOURCE.read_text()))
assert r['known']==29
assert r['missing_ranks']==[23,25,28]
assert r['vstar_ranks']==[10,12,13,14,18,20,21,27,32]
assert len(r['no_vstar_ranks'])==20
assert all(x['archetype']=='Regidrago' for x in r['rows'] if x['has_vstar'])
assert sum(len(x['vstar']) for x in r['rows'] if x['has_vstar'])==14
print('Aichi 29 known source VSTAR inventory coverage regression passed')
