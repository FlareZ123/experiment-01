"""Restricted T1 Flutter Mane counterlock -> Radiant Gate opportunity.
A 60-card Hood Shield list with one diagnostic Flutter Mane substitution.
No opponent decisions except active Iron Thorns ex/Initialization; no
match/game policy or deck nomination. Counts sample 7+six Prizes+T1 draw.
"""
from collections import Counter
from itertools import product,combinations
from random import Random
import sys

BASE={'R':4,'V':4,'C':2,'Tapu':1,'Trev':1,'Latias':1,'Dialga':1,'Mimi':1,'Gir':1,'Mar':1,'Z':1,
'Lillie':2,'Iono':1,'Team':1,'Raihan':1,'Acerola':1,'Guzma':1,'T':4,'F':4,'VS':2,'Q':1,
'Heavy':1,'BC':1,'Blower':1,'Stretcher':1,'Stamp':1,'Float':1,'FSS':1,'Sky':1,'Valley':1,
'Ranger':1,'Hood':2,'Arven':1,'P':11}
assert sum(BASE.values())==60
BASICS={'R','C','Tapu','Trev','Latias','Dialga','Mimi','Gir','Mar','Z','Flutter'}
RETREAT={'R':2,'C':1,'Tapu':1,'Trev':3,'Latias':2,'Dialga':3,
         'Mimi':1,'Gir':1,'Mar':1,'Z':2,'Flutter':1}
PROTECTED={'Z','Flutter','V','P','Float','FSS','Arven','T','Q','F','C','R','Latias'}

def make_deck(cut='Team'):
    c=BASE.copy()
    assert c[cut]>0
    c[cut]-=1;c['Flutter']=1
    assert sum(c.values())==60
    return sum(([n]*count for n,count in c.items()),[])

def choose_active(opening):
    basics=[n for n in opening if n in BASICS]
    if not basics:return None
    if 'Flutter' in basics:return 'Flutter'
    others=[n for n in basics if n!='Z']
    if others:return min(others,key=lambda n:(RETREAT[n],n))
    return 'Z'

def target_connector_choices(target):
    if target=='Flutter':return ['F','T','Q']
    if target=='Z':return ['T','Q']
    raise ValueError(target)

def a1_reachable(opening,prizes,draw,going_second=True,cut='Team',protect=False,tool_jammer=False):
    """Full-zone optimistic feasible action screen, not actor K0 policy.
    It reads hidden Prizes/deck when selecting a legal connector line.
    """
    active=choose_active(opening)
    if active is None or active=='Z':return False
    h0=Counter(opening+[draw]);h0[active]-=1
    d0=Counter(make_deck(cut))-Counter(opening)-Counter(prizes)-Counter([draw])
    assert sum(d0.values())==46
    if d0['V']<2:return False
    for use_arven in (False,True):
        if use_arven and (not going_second or not h0['Arven']):continue
        if not use_arven:
            arven_items=[None];arven_tools=[None]
        else:
            arven_items=[None]+[x for x in ('F','T','Q') if d0[x]]
            arven_tools=[None,'Float'] if d0['Float'] else [None]
        for ar_item,ar_tool in product(arven_items,arven_tools):
            hh=h0.copy();dd=d0.copy()
            if use_arven:hh['Arven']-=1
            if ar_item:hh[ar_item]+=1;dd[ar_item]-=1
            if ar_tool:hh['Float']+=1;dd['Float']-=1
            needs=[]
            if active!='Flutter' and not hh['Flutter']:needs.append('Flutter')
            if not hh['Z']:needs.append('Z')
            conn_lists=[target_connector_choices(n) for n in needs]
            for connectors in product(*conn_lists):
                cons=Counter(connectors)
                if any(hh[n]<k for n,k in cons.items()):continue
                h=hh.copy();d=dd.copy();h.subtract(cons)
                reserves=Counter({'Flutter':int(active!='Flutter' and hh['Flutter']>0),
                                  'Z':int(hh['Z']>0)})
                costs=sum(x in ('Q','T') for x in connectors)
                available=[]
                for name,count in h.items():
                    if protect and name in PROTECTED:continue
                    available.extend([name]*max(0,count-reserves[name]))
                if len(available)<costs:continue
                seen=set()
                for comb in combinations(range(len(available)),costs):
                    drops=tuple(sorted(available[i] for i in comb))
                    if drops in seen:continue
                    seen.add(drops)
                    h1=h.copy();d1=d.copy();h1.subtract(Counter(drops))
                    if any(not d1[n] for n in needs):continue
                    for n in needs:d1[n]-=1;h1[n]+=1
                    if not h1['Z'] or (active!='Flutter' and not h1['Flutter']):continue
                    if active!='Flutter':
                        float_route=h1['Float']>0 and not tool_jammer
                        basic_retreat=(RETREAT[active]==0 or
                                       (RETREAT[active]==1 and h1['P']>0))
                        if not(float_route or basic_retreat):continue
                    return True
    return False

def simulate(N=25000,seed=28112026,going_second=True,cut='Team',protect=False,tool_jammer=False):
    rng=Random(seed);deck=make_deck(cut)
    eligible=flutter_start=reachable=0
    for _ in range(N):
        cards=deck.copy();rng.shuffle(cards)
        h,p,draw=cards[:7],cards[7:13],cards[13]
        act=choose_active(h)
        if act is None:continue
        eligible+=1
        flutter_start+=act=='Flutter'
        reachable+=a1_reachable(h,p,draw,going_second,cut,protect,tool_jammer)
    return dict(N=N,seed=seed,cut=cut,going_second=going_second,
                protect=protect,eligible=eligible,flutter_start=flutter_start,
                reachable=reachable,tool_jammer=tool_jammer,
                fraction=reachable/eligible,
                conditional_flutter_start=flutter_start/eligible)

if __name__=='__main__':
    n=int(sys.argv[1]) if len(sys.argv)>1 else 25000
    for second in (False,True):
        for protected in (False,True):
            for jammer in (False,True):
                print(simulate(n,28112026,second,'Team',protected,jammer))
