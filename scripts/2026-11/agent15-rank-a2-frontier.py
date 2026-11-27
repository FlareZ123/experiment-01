"""Inventory-filtered response-frontier **upper bounds**, not game rates.
Run from repo root: python scripts/2026-11/agent15-rank-a2-frontier.py
"""
from pathlib import Path
import sys, json
sys.path.insert(0,str(Path(__file__).parent))
from importlib import import_module
frontier=import_module('agent15-a2-response-frontier')
SOURCE=Path('results/aichi-2026/full-decklists.json')

def count(deck,name):
    return sum(c['count'] for c in deck['cards'] if c['name']==name)
def source_replies(deck):
    """A hypothetical A2 reply must first be a Dragon payload *in discard*.
    This inventory-only scan is a necessary source-card-presence condition,
    not evidence of public discard access, usable energy or optimal action.
    """
    if not count(deck,'Noivern ex'):
        return None
    choices=['covert']
    if count(deck,'Dragapult ex'):choices.append('phantom')
    if count(deck,'Kyurem'):choices.append('trifrost')
    if count(deck,'Dialga-GX') and count(deck,'Dragapult ex'):choices.append('timeless_phantom')
    if count(deck,'Hisuian Goodra VSTAR'):choices.append('rolling')
    if count(deck,'Mega Dragonite ex'):choices.append('ryuno')
    return tuple(choices)

def evaluate(raw):
    ranks=[]
    for deck in raw['decks']:
        if 'regidrago' not in deck['archetype'].lower():continue
        attack_set=source_replies(deck)
        if attack_set is None:continue # First source Covert branch inapplicable
        v=count(deck,'Regidrago V')
        s=frontier.Scenario(two_exposed_v=v>=4)
        gate=frontier.coverage(s,attack_set)
        hood=frontier.coverage(frontier.Scenario(dna=False,deoxys_benched=False,
                                                  two_exposed_v=v>=4),attack_set)
        ranks.append({'rank':deck['rank'],'attack_types':list(attack_set),
                      'regidrago_v':v,'gate_covered':{a:gate[a]['covered'] for a in gate},
                      'hood_covered':{a:hood[a]['covered'] for a in hood}})
    return sorted(ranks,key=lambda r:r['rank'])

if __name__=='__main__':
    data=json.loads(SOURCE.read_text())
    print(json.dumps(evaluate(data),indent=2))
