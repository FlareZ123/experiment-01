"""Conditional Rider+Deoxys Gate on T1, extra Rider V evolves to VMAX on T2.

Real 60-card physical sampling (seven opening, six Prizes); Basic legal starts;
no T1 Supporter/opponent/Ability lock/mulligan bonus/other Trainer drawing.
Choose starting Basic by fixed opening-only priority; enumerate direct,
Quick Ball/Mysterious Treasure/Fog Crystal T1 searches and paid discards;
choose max T2 evolution accessibility among legal plans. A T2 normal draw,
held or searched VMAX, Forest Seal Stone, and Arven are represented.
No natural opponent behavior, late Prizes, on-board attacks, Tools already
attached, competing Supporter use, or full-game win-rate inference.
The planner's T1 maximum uses complete sampled deck knowledge (optimistic
reachability); it is NOT an information-constrained production policy.
"""
from collections import Counter
from itertools import product,combinations
from random import Random
import sys
COUNTS={
 'R':3,'V':3,'DxV':1,'DxMax':1,'C':2,
 'Tapu':1,'Trev':1,'Latias':1,'Dialga':1,'Mimi':1,'Gir':1,'Mar':1,'Z':1,
 'Lillie':2,'Iono':1,'Team':1,'Raihan':1,'Acerola':1,'Guzma':1,
 'T':4,'F':4,'VS':2,'Q':1,'Heavy':1,'BC':1,'Blower':1,'Stretcher':1,
 'Stamp':1,'Float':1,'FSS':1,'Sky':1,'Valley':1,'Ranger':1,
 'Hood':2,'Arven':1,'P':11}
assert sum(COUNTS.values())==60
BASICS={'R','DxV','C','Tapu','Trev','Latias','Dialga','Mimi','Gir','Mar','Z'}
ACTIVE_ORDER=['Latias','R','Trev','DxV','C','Tapu','Gir','Mar','Mimi','Dialga','Z']
DECK=sum(([c]*n for c,n in COUNTS.items()),[])
# Alternate subjective DCI restrictions, never immutable card judgments.
PROTECTED={'V','P','FSS','Arven','Valley','C','Latias','Ranger',
           'Acerola','Guzma','VS','T','Hood','Stamp'}

def active_selection(hand):
    c=Counter(hand)
    return next((x for x in ACTIVE_ORDER if c[x]),None)

def get_choices(target,h,d):
    if target is None:return [(None,)]
    if not d[target]:return []
    if target=='Z':return [(x,) for x in ('Q','T') if h[x]]
    if target=='R':return [(x,) for x in ('F','Q','T') if h[x]]
    raise ValueError(target)

def t2_tutor_allowed(hand,deck):
    """Rider V was already in play since T1; Tool host and power are available."""
    if hand['V']>0:return True
    if deck['V']<=0:return False
    if hand['FSS']>0:return True
    if hand['Arven']>0 and deck['FSS']>0:return True
    # Treasure can discard even another Treasure if holding two.
    if hand['T']>0 and sum(hand.values())>=2:return True
    return False

def t2_success_probability(hand,deck):
    """One actual T2 draw from a uniformly shuffled remaining deck."""
    total=sum(deck.values())
    assert total>0
    successes=0
    for name,n in deck.items():
        if n<=0:continue
        hh=hand.copy();dd=deck.copy();hh[name]+=1;dd[name]-=1
        if t2_tutor_allowed(hh,dd):successes+=n
    return successes/total

def t1_best(hand,prizes,protect=False,need_extra_rider=True):
    """(T1 Gate opportunity, max T2 extra Rider evolution probability).
    need_extra_rider=False counts any hybrid Rider+Deoxys Gate opportunity.
    need_extra_rider=True requires one Rider V already in play by T1,
    so its evolution to another Rider VMAX on T2 is legal.
    """
    active=active_selection(hand)
    if active is None or active=='Z':return False,0.0
    h0=Counter(hand);h0[active]-=1
    d0=Counter(DECK)-Counter(hand)-Counter(prizes)
    assert sum(d0.values())==47
    missZ=None if h0['Z']>0 else 'Z'
    missR=(None if (h0['R']>0 or active=='R') else 'R') if need_extra_rider else None
    best=-1.0
    for a,b in product(get_choices(missZ,h0,d0),get_choices(missR,h0,d0)):
        connectors=[x for x in (a[0],b[0]) if x is not None]
        if any(connectors.count(x)>h0[x] for x in set(connectors)):continue
        h=h0.copy();d=d0.copy()
        for conn in connectors:h[conn]-=1
        discard_cost=sum(x in ('Q','T') for x in connectors)
        reserve=Counter()
        if missZ is None:reserve['Z']=1
        if need_extra_rider and missR is None and active!='R':reserve['R']=1
        pool=[]
        for name,num in h.items():
            if protect and name in PROTECTED:continue
            pool.extend([name]*max(0,num-reserve[name]))
        if len(pool)<discard_cost:continue
        seen=set()
        for positions in combinations(range(len(pool)),discard_cost):
            drops=tuple(sorted(pool[i] for i in positions))
            if drops in seen:continue
            seen.add(drops)
            hh=h.copy();dd=d.copy()
            for card in drops:hh[card]-=1
            if missZ is not None:
                if not dd['Z']:continue
                dd['Z']-=1;hh['Z']+=1
            if missR is not None:
                if not dd['R']:continue
                dd['R']-=1;hh['R']+=1
            if not hh['Z'] or (need_extra_rider and not hh['R'] and active!='R'):continue
            # Play Radiant on Bench; also play held/fetched Rider V if needed.
            hh['Z']-=1
            if need_extra_rider and active!='R':hh['R']-=1
            # Climactic Gate fetches the two designated VMAX from deck.
            if dd['V']<1 or dd['DxMax']<1:continue
            dd['V']-=1;dd['DxMax']-=1
            score=t2_success_probability(hh,dd) if need_extra_rider else 0
            if score>best:best=score
    return best>=0,max(0,best)

def simulate(N=100000,seed=27112028,protect=False):
    rng=Random(seed)
    legal=any_gate=gate_with_rider=0
    restoration_expected=0.0
    for _ in range(N):
        cards=DECK.copy();rng.shuffle(cards)
        hand,prizes=cards[:7],cards[7:13]
        if not any(c in BASICS for c in hand):continue
        legal+=1
        any_g,_=t1_best(hand,prizes,protect=protect,need_extra_rider=False)
        if any_g:any_gate+=1
        extra_g,prob=t1_best(hand,prizes,protect=protect,need_extra_rider=True)
        if extra_g:
            gate_with_rider+=1
            restoration_expected+=prob
    assert gate_with_rider<=any_gate<=legal
    return {'sample':N,'seed':seed,'protect':protect,'legal':legal,
            'any_gate':any_gate,'gate_with_rider':gate_with_rider,
            'any_gate_over_legal':any_gate/legal if legal else 0,
            'with_rider_over_legal':gate_with_rider/legal if legal else 0,
            'restoration_given_gate_with_rider':restoration_expected/gate_with_rider if gate_with_rider else 0,
            'restoration_given_any_gate':restoration_expected/any_gate if any_gate else 0,
            'gate_plus_restoration_over_legal':restoration_expected/legal if legal else 0}
if __name__=='__main__':
    n=int(sys.argv[1]) if len(sys.argv)>1 else 50000
    seed=int(sys.argv[2]) if len(sys.argv)>2 else 27112028
    print(simulate(n,seed))
    print(simulate(n,seed,protect=True))
