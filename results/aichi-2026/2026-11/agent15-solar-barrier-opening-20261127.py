"""Restricted first-going-turn opening-resource screen; not full games.
Hood physical slots map to solar-barrier candidate one-for-one.
All 14 Basics remain Basic; all four VMAX remain VMAX.
"""
from collections import Counter
from itertools import product
from random import Random
from math import sqrt

N = 300_000
SEED = 27112026
# Slot map: M = second Clefairy -> Mew; B contains the Rider V -> Espeon V.
# E = fourth Rider VMAX -> Espeon VMAX; both special slots are ordinary
# Rider/Clefairy in Hood. C = retained Clefairy; L = Latias; D = Valley.
# A = Acerola slot, replaced by Big Parasol ONLY in the alternate Tool package.
POOL = (['B']*10 + ['G','M','C','L'] + ['V']*3 + ['E'] + ['P']*11
        + ['T']*4 + ['F']*4 + ['Q','H','D','A'] + ['X']*19)
assert len(POOL) == 60
BASIC = {'B','G','M','C','L'}

def route(hand, prizes, deck, targets):
    """Reserve held target copies; assign distinct physical search connectors.
    G = Radiant Eternatus, M = Mew, P = Psychic Energy, C = Clefairy,
    L = Latias; D = Dimension Valley and A = Big Parasol (direct only). 
    Heavy Ball may retrieve one Prized G or M, not arbitrary card.
    T and Q cost one additional hand card each. No DCI model.
    """
    h = Counter(hand)
    available = h.copy()
    missing = []
    for target in targets:
        if available[target]:
            available[target] -= 1
        else:
            missing.append(target)
    options = []
    for target in missing:
        o = []
        if deck[target]:
            o += {'G':['T','Q'], 'M':['T','Q','F'], 'P':['F'],
                  'C':['T','Q','F'], 'L':['T','Q','F'], 'D':[], 'A':[]}[target]
        if target in ('G','M','C','L') and prizes[target]:
            o += ['H']
        if not o: return False
        options.append(o)
    for connectors in product(*options):
        used = Counter(connectors)
        if any(used[c] > available[c] for c in used): continue
        # After reserving targets and connector cards, enough physical cards
        # must remain to pay the one-card T/Q discard costs.
        if sum(available.values()) - len(connectors) >= used['T']+used['Q']:
            return True
    return False

def classify(open7, prizes, draw, deck):
    # Select a non-Radiant Active when possible, preferring not to start Mew.
    # A hand containing ONLY Radiant as Basic cannot use Climactic Gate.
    starter = next(x for x in ('C','L','B','M','G') if x in open7)
    h = list(open7) + [draw]
    h.remove(starter)
    d = Counter(deck); p = Counter(prizes)
    gate = starter != 'G' and route(h,p,d,('G',))
    hood2 = gate and d['V'] + d['E'] >= 2
    solar2 = gate and d['V'] >= 2
    hybrid = gate and d['V'] >= 1 and d['E'] >= 1
    dual = hybrid and starter not in ('G','M') and route(h,p,d,('G','M','P'))
    hybrid_with_mew = hybrid and starter not in ('G','M') and route(h,p,d,('G','M'))
    def ready(*targets):
        return hybrid and route(h,p,d,tuple(x for x in targets if x != starter))
    # Clefairy / Latias can be Active or Benched. Without Mew, the five
    # Bench slots suffice regardless of starter (including Mew as Active).
    # For both C/L and a BENCHED Mew alongside Gate, C or L must be Active
    # under ordinary five-Bench capacity; Sky Field is not modeled.
    hybrid_clefairy = ready('G','C')
    dual_clefairy = dual and ready('G','M','P','C')
    offense_board = ready('G','C','L','D')
    dual_offense_board = starter in ('C','L') and ready('G','M','P','C','L','D')
    return {'hood_two_riders':hood2,'solar_two_riders':solar2,
            'solar_hybrid':hybrid,'solar_either_two':solar2 or hybrid,
            'hybrid_mew_unfunded_or_funded':hybrid_with_mew,
            'hybrid_mew_funded':dual,
            'hybrid_but_no_two_rider_option':hybrid and not solar2,
            'hood_two_rider_option_lost_entirely':hood2 and not solar2,
            'radiant_gate_any':gate,'hybrid_clefairy':hybrid_clefairy,
            'tool_mew_parasol_two_riders':hood2 and starter not in ('G','M')
               and route(h,p,d,('G','M','A')),
            'hybrid_mew_funded_clefairy':dual_clefairy,
            'hybrid_clefairy_latias_valley':offense_board,
            'hybrid_mew_funded_clefairy_latias_valley':dual_offense_board}

def main():
    # Focused positive/negative payment and tutor regressions.
    assert route(['T','F','Q','X','X','X','X'], Counter(), Counter(G=1,M=1,P=10), ('G','M','P'))
    assert not route(['T','F','X','X','X','X','X'], Counter(), Counter(G=1,M=1,P=10), ('G','M','P'))
    assert not route(['T','Q'],Counter(),Counter(G=1,M=1),('G','M'))
    assert route(['H','F','P'],Counter(G=1),Counter(M=1),('G','M','P'))
    assert not route(['H','F','P'],Counter(G=1,M=1),Counter(),('G','M','P'))
    assert not classify(['G']+['X']*6,['X']*6,'B',['V']*3+['E'])['radiant_gate_any']
    rng=Random(SEED); sums=Counter(); rejected=0; valid=0
    for _ in range(N):
        a=POOL.copy(); rng.shuffle(a)
        if not any(c in BASIC for c in a[:7]):
            rejected+=1; continue
        valid+=1
        sums.update(k for k,v in classify(a[:7],a[7:13],a[13],a[14:]).items() if v)
    print(f'seed={SEED} attempted={N} valid={valid} rejected={rejected}')
    for k,v in sorted(sums.items()):
        p=v/valid
        print(f'{k}: {v}/{valid} = {100*p:.5f}% (MC SE {100*sqrt(p*(1-p)/valid):.5f} pp)')
    assert sums['solar_either_two']==sums['hood_two_riders']
    assert sums['hood_two_rider_option_lost_entirely']==sums['hybrid_but_no_two_rider_option']
    assert sums['hybrid_mew_funded']<=sums['hybrid_mew_unfunded_or_funded']<=sums['solar_hybrid']
if __name__=='__main__': main()
