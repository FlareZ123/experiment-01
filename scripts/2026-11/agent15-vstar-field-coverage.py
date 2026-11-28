"""Scan authenticated Aichi 2026 source inventories for Pokemon VSTAR.
This is card-printing inventory coverage, not real match performance.
Run from repository root.
"""
from pathlib import Path
import json
SOURCE=Path('results/aichi-2026/full-decklists.json')

def scan(data):
    rows=[]
    for d in data['decks']:
        vs=[(c['name'],c['count']) for c in d['cards']
             if c['category']=='Pokémon' and c['name'].endswith(' VSTAR')]
        rows.append({'rank':d['rank'],'archetype':d['archetype'],'vstar':vs,
                     'has_vstar':bool(vs)})
    rows=sorted(rows,key=lambda r:r['rank'])
    known={r['rank'] for r in rows}
    return {'known':len(rows),'ranks':[r['rank'] for r in rows],
            'vstar_ranks':[r['rank'] for r in rows if r['has_vstar']],
            'no_vstar_ranks':[r['rank'] for r in rows if not r['has_vstar']],
            'missing_ranks':sorted(set(range(1,33))-known),'rows':rows}

if __name__=='__main__':
    data=json.loads(SOURCE.read_text())
    result=scan(data)
    print('known',result['known'],'vstar',len(result['vstar_ranks']),
          result['vstar_ranks'],'no_vstar',len(result['no_vstar_ranks']),
          result['no_vstar_ranks'],'missing',result['missing_ranks'])
