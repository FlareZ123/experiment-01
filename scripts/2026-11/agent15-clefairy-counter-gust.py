"""Conditional Regidrago gust-to-Clefairy adversarial attack model.
Source card availability, energy, turn and board are assumptions, not deals.
State is after A2 Deoxys Max Drain KO of source VSTAR2 (four own Prizes
taken); source has funded VSTAR3 Active, attack payload in discard.
No complete opponent policy, search, Item-access probability or full game.
"""
from dataclasses import dataclass
from typing import Literal

ATTACKS={'phantom':(200,0),'rolling':(200,80),'ryuno':(330,0),'covert':(70,0)}

@dataclass(frozen=True)
class State:
    own_prizes: int=2
    source_prizes: int=6
    clefairy_hp: int=190
    has_band: bool=True
    protective_dna: bool=True
    item_usable: bool=True
    counter_in_hand: bool=True
    apex_ready: bool=True
    payload_in_discard: bool=True
    own_deoxys_ready: bool=True
    own_ability_lock: bool=False
    backup_clefairy_accessible: bool=False
    source_attack: Literal['phantom','rolling','ryuno','covert']='phantom'
    own_ranger_available: bool=True
    skyliner_live: bool=True
    other_source_reduction: int=0

def counter_response(s:State):
    """Counter Catcher never switches its controller's Active Pokémon.
    Source must have more Prize cards remaining than candidate to use it.
    """
    if not(s.counter_in_hand and s.item_usable and s.source_prizes>s.own_prizes):
        return {'legal':False,'why':'Counter Catcher inaccessible or prize condition false'}
    if not(s.apex_ready and s.payload_in_discard):
        return {'legal':False,'why':'Apex Dragon/payload unavailable'}
    raw,reduction=ATTACKS[s.source_attack]
    dna=30 if (s.protective_dna and not s.own_ability_lock) else 0
    damage=max(0,raw+(20 if s.has_band else 0)-dna)
    clefairy_ko=damage>=s.clefairy_hp
    source_remaining=s.source_prizes-(2 if clefairy_ko else 0)
    fairy_on_next_turn=not clefairy_ko or s.backup_clefairy_accessible
    if not s.own_deoxys_ready:
        return {'legal':True,'source_attack':s.source_attack,'damage':damage,
                'clefairy_ko':clefairy_ko,'source_prizes':source_remaining,
                'fairy_next':fairy_on_next_turn,'candidate_a3_win':False,
                'why':'Deoxys unavailable on own next turn'}
    if not clefairy_ko and not s.skyliner_live:
        return {'legal':True,'source_attack':s.source_attack,'damage':damage,
                'clefairy_ko':False,'source_prizes':source_remaining,
                'fairy_next':True,'candidate_a3_win':False,
                'why':'surviving Active Clefairy cannot retreat to Deoxys'}
    reduction_applied=0 if s.own_ranger_available else reduction
    a3_damage=160*(2 if fairy_on_next_turn else 1)-reduction_applied-s.other_source_reduction
    return {'legal':True,'source_attack':s.source_attack,'damage':damage,
            'clefairy_ko':clefairy_ko,'source_prizes':source_remaining,
            'fairy_next':fairy_on_next_turn,'a3_damage':a3_damage,
            'candidate_a3_win':a3_damage>=280,
            'why':'fresh 280-HP Regidrago VSTAR, funded repeat Max Drain'}

# Exact physical card counts in 29 original published lists. Ranks 23,25,28
# were not authenticated and are not included as fabricated zeroes.
# Counter Catcher is the self-position-neutral Item; Prime Catcher and
# Guzma also switch the user's Active, so they require a separate pivot.
RANKS={
    10:{'counter':0,'prime':1,'guzma':2,'band':2,'dragapult':1,'goodra':1,'dragonite':0},
    12:{'counter':1,'prime':0,'guzma':2,'band':2,'dragapult':1,'goodra':0,'dragonite':0},
    13:{'counter':0,'prime':0,'guzma':2,'band':2,'dragapult':1,'goodra':0,'dragonite':0},
    14:{'counter':1,'prime':0,'guzma':2,'band':2,'dragapult':1,'goodra':1,'dragonite':1},
    18:{'counter':0,'prime':1,'guzma':3,'band':2,'dragapult':1,'goodra':1,'dragonite':0},
    20:{'counter':0,'prime':0,'guzma':2,'band':2,'dragapult':1,'goodra':0,'dragonite':1},
    21:{'counter':1,'prime':0,'guzma':2,'band':1,'dragapult':1,'goodra':1,'dragonite':0},
    27:{'counter':0,'prime':1,'guzma':2,'band':2,'dragapult':1,'goodra':0,'dragonite':0},
    32:{'counter':1,'prime':0,'guzma':2,'band':1,'dragapult':1,'goodra':1,'dragonite':1}
}
def rank_capability():
    return {r:{'counter_phantom':bool(d['counter'] and d['band'] and d['dragapult']),
               'counter_rolling':bool(d['counter'] and d['band'] and d['goodra']),
               'counter_ryuno_no_band':bool(d['counter'] and d['dragonite'])}
            for r,d in RANKS.items()}

if __name__=='__main__':
    from dataclasses import replace
    for attack in ATTACKS:
        for band in (False,True):
            for backup in (False,True):
                print(attack,band,backup,counter_response(State(
                    source_attack=attack,has_band=band,
                    backup_clefairy_accessible=backup)))
    print(rank_capability())
