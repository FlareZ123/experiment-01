"""K0 fixed hand-only T1 hybrid Gate plan vs optimistic prize-aware planner.
The K0 plan is chosen without reading Prize/deck contents. A search then
reveals available deck composition; the success metric conservatively requires
that the precommitted plan's needed card(s) are actually unprized.
No game-rate or natural opponent-policy claim.
"""
from collections import Counter
from itertools import product
from random import Random
from importlib.machinery import SourceFileLoader
from pathlib import Path
import sys
base=SourceFileLoader('agent15_rider_base',str(Path(__file__).with_name('agent15-second-rider-t2-restoration.py'))).load_module()

DISCARD_RANK=['Blower','Ranger','Sky','BC','Hood','Guzma','Acerola','Iono','Lillie','Team','Raihan','Mar','Gir','Mimi','Dialga','Trev','DxV','C','Float','VS','P','V','FSS','Arven','R','Latias','Valley','Stamp','Q','T','F']
DISCARD_MAP={n:i for i,n in enumerate(DISCARD_RANK)}
PROTECTED=base.PROTECTED

def possible_plans(hand,require_extra=True,protect=False):
    """Hand-only connectors and discard alternatives; preserve the best
    reachable T2 VMAX evolution route before generic cheap-card disposal.
    """
    active=base.active_selection(hand)
    if active is None or active=='Z':return []
    h0=Counter(hand);h0[active]-=1
    needs=[]
    if not h0['Z']:needs.append('Z')
    if require_extra and not(h0['R'] or active=='R'):needs.append('R')
    options={'Z':['Q','T'],'R':['F','Q','T']}
    plans=[]
    from itertools import combinations
    for cs in product(*(options[n] for n in needs)):
        cons=Counter(cs)
        if any(h0[k]<v for k,v in cons.items()):continue
        afterConnectors=h0.copy();afterConnectors.subtract(cons)
        reserve=Counter({'Z':1 if h0['Z'] else 0,'R':1 if require_extra and active!='R' and h0['R'] else 0})
        candidates=[]
        for k,n in afterConnectors.items():
            if protect and k in PROTECTED:continue
            candidates.extend([k]*max(0,n-reserve[k]))
        cost=sum(c in ('Q','T') for c in cs)
        if len(candidates)<cost:continue
        seen=set()
        for indexCombo in combinations(range(len(candidates)),cost):
            drops=tuple(sorted(candidates[i] for i in indexCombo))
            if drops in seen:continue
            seen.add(drops)
            h=afterConnectors.copy();h.subtract(Counter(drops))
            for n in needs:h[n]+=1
            if not h['Z'] or (require_extra and active!='R' and not h['R']):continue
            h['Z']-=1
            if require_extra and active!='R':h['R']-=1
            if h['V']: access=100
            elif h['FSS']:access=90
            elif h['Arven']:access=70
            elif h['T'] and sum(h.values())>=2:access=55
            else:access=0
            access_count=sum(int(h[n]>0) for n in ('V','FSS','Arven','T'))
            penalty=sum(DISCARD_MAP.get(d,200) for d in drops)
            score=10000*access+100*access_count-penalty*2+10*h['P']-10*cost
            plans.append(dict(active=active,needs=tuple(needs),connectors=cs,drops=drops,hand=h,score=score))
    return sorted(plans,key=lambda p:(-p['score'],p['connectors'],p['drops']))

def possible_plans_greedy(hand,require_extra=True,protect=False):
    active=base.active_selection(hand)
    if active is None or active=='Z':return []
    h0=Counter(hand);h0[active]-=1
    needs=[]
    if not h0['Z']:needs.append('Z')
    if require_extra and not(h0['R'] or active=='R'):needs.append('R')
    options={'Z':['Q','T'],'R':['F','Q','T']}
    plans=[]
    for cs in product(*(options[n] for n in needs)):
        cons=Counter(cs)
        if any(h0[k]<v for k,v in cons.items()):continue
        h=h0.copy();h.subtract(cons)
        reserve=Counter({'Z':1 if h0['Z'] else 0,'R':1 if require_extra and active!='R' and h0['R'] else 0})
        drops=[]
        cost=sum(c in ('Q','T') for c in cs)
        for _ in range(cost):
            candidates=[k for k,n in h.items() if n>reserve[k] and (not protect or k not in PROTECTED)]
            if not candidates:break
            d=min(candidates,key=lambda k:(DISCARD_MAP.get(k,200),k))
            drops.append(d);h[d]-=1
        if len(drops)<cost:continue
        for n in needs:h[n]+=1
        if not h['Z'] or (require_extra and active!='R' and not h['R']):continue
        h['Z']-=1
        if require_extra and active!='R':h['R']-=1
        access=1 if h['V'] else 0
        access+=0.5 if h['FSS'] else 0
        access+=0.25 if h['Arven'] else 0
        access+=0.1 if h['T'] else 0
        utility=(access*1000 - 40*cost - 5*len(drops)
                 - sum(15 for d in drops if d in PROTECTED)
                 - 3*cons['T'])
        plans.append(dict(active=active,needs=tuple(needs),connectors=cs,drops=tuple(drops),hand=h,score=utility))
    return sorted(plans,key=lambda p:(-p['score'],p['connectors'],p['drops']))

def apply_plan(hand,prizes,plan):
    """Validate precommitted K0 plan against hidden physical zone; this
    function evaluates outcomes, never ranks T1 choices.
    """
    d=Counter(base.DECK)-Counter(hand)-Counter(prizes)
    for n in plan['needs']:
        if not d[n]:return False,0.0
        d[n]-=1
    h=plan['hand'].copy()
    if d['V']<1 or d['DxMax']<1:return False,0.0
    d['V']-=1;d['DxMax']-=1
    return True,base.t2_success_probability(h,d)

def k0_route(hand,prizes,protect=False,greedy=False):
    """One K0 precommitted plan; failed searches are not freely rewound."""
    choose=possible_plans_greedy if greedy else possible_plans
    first=choose(hand,True,protect)
    if first:
        valid,p=apply_plan(hand,prizes,first[0])
        return valid,valid,p if valid else 0.0
    simple=choose(hand,False,protect)
    if simple:
        valid,_=apply_plan(hand,prizes,simple[0])
        return valid,False,0.0
    return False,False,0.0

def simulate(n=10000,seed=27112028,protect=False,include_opt=False):
    rng=Random(seed);legal=gate=extra=0;rest=0.;optimistic=optgate=0
    for _ in range(n):
        shuffled=base.DECK.copy();rng.shuffle(shuffled)
        hand,prizes=shuffled[:7],shuffled[7:13]
        if not any(k in base.BASICS for k in hand):continue
        legal+=1
        g,x,p=k0_route(hand,prizes,protect)
        gate+=g;extra+=x;rest+=p
        if include_opt:
            o,_=base.t1_best(hand,prizes,protect,need_extra_rider=False)
            k,q=base.t1_best(hand,prizes,protect,need_extra_rider=True)
            optgate+=o;optimistic+=q if k else 0.
    return dict(seed=seed,n=n,legal=legal,gate=gate,extra=extra,restoration_expected=rest,
      gate_fraction=gate/legal if legal else 0,extra_fraction=extra/legal if legal else 0,
      restoration_fraction=rest/legal if legal else 0,
      restoration_given_gate=rest/gate if gate else 0,
      optimistic_restoration_fraction=optimistic/legal if legal and include_opt else None,
      optimistic_gate_fraction=optgate/legal if legal and include_opt else None)

def paired_compare(n=50000,seed=27112028,protect=False):
    rng=Random(seed)
    eligible=0; gates=[0,0,0]; other=[0,0,0]; restoration=[0.,0.,0.]
    disagreement=0
    for _ in range(n):
        deck=base.DECK.copy();rng.shuffle(deck)
        hand,prizes=deck[:7],deck[7:13]
        if not any(c in base.BASICS for c in hand):continue
        eligible+=1
        oracle_gate,_=base.t1_best(hand,prizes,protect,False)
        oracle_extra,oracle_p=base.t1_best(hand,prizes,protect,True)
        for i,(g,x,p) in enumerate([k0_route(hand,prizes,protect,True),
                                    k0_route(hand,prizes,protect,False),
                                    (oracle_gate,oracle_extra,oracle_p)]):
            gates[i]+=int(g);other[i]+=int(x);restoration[i]+=p
        if k0_route(hand,prizes,protect,True)[2]<k0_route(hand,prizes,protect,False)[2]-1e-10:
            disagreement+=1
    return {'n':n,'seed':seed,'protect':protect,'eligible':eligible,
            'gate_counts':dict(zip(('greedy','preserve','oracle'),gates)),
            'extra_counts':dict(zip(('greedy','preserve','oracle'),other)),
            'restoration_expected':dict(zip(('greedy','preserve','oracle'),restoration)),
            'restoration_per_eligible':dict(zip(('greedy','preserve','oracle'),(v/eligible for v in restoration))),
            'preserve_improvements':disagreement}

if __name__=='__main__':
  n=int(sys.argv[1]) if len(sys.argv)>1 else 10000
  seed=int(sys.argv[2]) if len(sys.argv)>2 else 27112028
  for protected in (False,True):print(paired_compare(n,seed,protected))
