"""Exact finite-population Underworld Door/manual attachment race.

Restricted post-Radiant-Gate state, not a Pokemon match:
Four Pokemon in play (own Active Basic, Radiant Eternatus, two VMAX),
6 hand incl 2 Psychic, 6 Prizes incl 1 Psychic, 44 deck incl 8 Psychic;
no Psychic in play. With an optional initial attachment, the deck
Psychic count falls by one and the physical deck has 43 cards.
Turns 2..T: normal draw one, use every payable live Door to attach
a Psychic from hand to a Benched Psychic and draw 2, manual attach
one Psychic if held. No Supporter, search, other acceleration,
healing/recovery/KO, evolution to another Rider, interference,
dynamic Bench/Tool changes, or attack legality. Card access and
same-turn payoff are not claimed. Probabilities are exact under
this deliberately conditioned exchangeable-deck model.
"""
from collections import defaultdict
from math import comb

def draws(p,o,n):
    N=p+o
    n=min(n,N)
    if n<=0 or not N:return ((0,0,1.),)
    den=comb(N,n)
    return tuple((x,n-x,comb(p,x)*comb(o,n-x)/den)
                 for x in range(max(0,n-o),min(p,n)+1))

def turn_distribution(state,doors):
    """State=(deck Psychic, deck other, hand Psychic, attached Psychic)."""
    p,o,h,a=state
    for x,y,p_draw in draws(p,o,1):
        todo={(p-x,o-y,h+x,a):p_draw}
        for _ in range(doors):
            nxt=defaultdict(float)
            for (dp,do,hp,attached),weight in todo.items():
                if hp<=0:
                    nxt[(dp,do,hp,attached)]+=weight
                    continue
                for dx,dy,prob in draws(dp,do,2):
                    nxt[(dp-dx,do-dy,hp-1+dx,attached+1)]+=weight*prob
            todo=nxt
        for (dp,do,hp,attached),weight in todo.items():
            yield (dp,do,int(hp-(hp>0)),int(attached+(hp>0))),weight

def run(doors,turns=7,initial_attached=0,total_psychic=11):
    assert doors>=0 and total_psychic>=initial_attached+3
    # One prize P, two in hand, 'initial_attached' already on a Pokemon.
    p=total_psychic-3-initial_attached
    states={(p,36,2,initial_attached):1.0}
    result=[]
    for t in range(2,turns+1):
        nxt=defaultdict(float)
        for state,weight in states.items():
            for new,prob in turn_distribution(state,doors):
                nxt[new]+=weight*prob
        states=nxt
        assert abs(sum(states.values())-1)<1e-9
        result.append({'turn':t,'door':doors,'initial':initial_attached,
                       'total':total_psychic,
                       'mean_attached':sum(s[3]*w for s,w in states.items()),
                       **{f'p_ge_{k}':sum(w for s,w in states.items() if s[3]>=k)
                          for k in (5,8,9,10,11)},
                       'states':len(states)})
    return result

def earliest_turn(required,doors,initial=0):
    """Earliest theoretical turn, ignoring deck access, not a game guarantee."""
    assert required>=initial and doors>=0
    capacity=doors+1
    return 1+(required-initial+capacity-1)//capacity

if __name__=='__main__':
    for initial in (0,1):
        for doors in (1,2):
            print('initial',initial,'doors',doors)
            for r in run(doors,7,initial):
                if r['turn'] in (3,4,5,6,7):
                    print(r['turn'],round(r['mean_attached'],5),
                          {k:round(r[f'p_ge_{k}']*100,5) for k in (5,8,9,10,11)})
        print('one Door + twelfth P, turn5 p>=9:',run(1,5,initial,12)[-1]['p_ge_9'])
    for k in (9,10,11):
        print('ceiling earliest T',k,
              {(d,i):earliest_turn(k,d,i) for d in (1,2) for i in (0,1)})
