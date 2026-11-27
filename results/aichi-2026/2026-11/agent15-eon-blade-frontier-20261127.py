"""Restricted public-state attachment/retreat frontier, not a game simulator.
G=Shadow Rider VMAX; D=Deoxys VMAX; C=Clefairy ex; L=Latias ex;
T=Trevenant & Dusknoir-GX; R=Shadow Rider V; E=Radiant Eternatus.
All except E are Psychic. Draws from Door do not add resources to this calculation.
No search, Supporter, Tool, switches other than retreat, evolution or effects
other than the supplied target protections. Count no scenario frequencies.
"""
from collections import deque
from dataclasses import dataclass

HP = dict(G=320,D=330,C=190,L=210,T=270,R=210,E=170)
PRIZES = dict(G=3,D=3,C=2,L=2,T=3,R=2,E=1)
RETREAT = dict(G=2,D=3,C=1,L=2,T=3,R=2,E=2)
# This model requires all Pokémon alive and Skyliner/Fairy Zone/Door enabled.
@dataclass(frozen=True)
class Case:
    name: str
    board: str
    energy: tuple
    hand: int
    valley: bool=True
    oppbench: int=0
    reduction: int=80
    basicwall: bool=False
    dragon: bool=True
    hp: int=280
    latias_cooldown: bool=False


def attack_frontier(c, allow_latias=True):
    assert len(c.board)==len(c.energy) and len(c.board)<=6
    # (active, energies, hand, manual used, Door uses remaining, retreat used)
    root=(0,c.energy,c.hand,False,c.board.count('G'),False)
    todo=deque([(root,())]); seen={root}; best={}
    while todo:
        state,path=todo.popleft()
        active,e,h,m,d,r=state; p=c.board[active]; total=sum(e)
        weak=2 if c.dragon and 'C' in c.board else 1
        options={
            'G':('Geist',3-c.valley,10+30*total),
            'D':('Drain',3-c.valley,160),
            'C':('Rondo',2-c.valley,20+20*(len(c.board)-1+c.oppbench)),
            'L':('Eon',3-c.valley,200),
            'T':('Night Watch',3,150),
        }
        if p in options and (p!='L' or (allow_latias and not c.latias_cooldown)):
            name,cost,damage=options[p]
            if e[active]>=cost:
                damage=0 if c.basicwall and p not in 'GD' else max(0,damage*weak-c.reduction)
                # Report the best damage for each attack, then highest total
                # remaining attached Energy; then fewest operations.
                score=(damage,total,-len(path))
                if name not in best or score>best[name][0]:
                    best[name]=(score,path,e,active)
        successors=[]
        if h:
            for i,p2 in enumerate(c.board):
                v=list(e);v[i]+=1;v=tuple(v)
                if not m:successors.append(((active,v,h-1,True,d,r),f'manual->{p2}{i}'))
                if d and i!=active and p2!="E":successors.append(((active,v,h-1,m,d-1,r),f'Door->{p2}{i}'))
        if not r:
            cost=0 if 'L' in c.board and p not in 'GD' else RETREAT[p]
            if e[active]>=cost:
                v=list(e);v[active]-=cost;v=tuple(v)
                for i,p2 in enumerate(c.board):
                    if i!=active:successors.append(((i,v,h,m,d,True),f'retreat {p}{active}->{p2}{i} (-{cost})'))
        for s,act in successors:
            if s not in seen:seen.add(s);todo.append((s,path+(act,)))
    return best


def cases():
    return [
      Case('Hood L funded', 'LGGEC',(1,0,0,0,0),3),
      Case('Gate L funded', 'LGDEC',(1,0,0,0,0),2),
      Case('Hood Trev pivot', 'TGGELC',(1,0,0,0,0,0),3),
      Case('Gate Trev pivot', 'TGDELC',(1,0,0,0,0,0),2),
      Case('Gate L empty', 'LGDEC',(0,0,0,0,0),2),
      Case('Hood L empty', 'LGGEC',(0,0,0,0,0),3),
      Case('Gate no Valley', 'TGDELC',(1,0,0,0,0,0),2,False),
      Case('Hood no Valley', 'TGGELC',(1,0,0,0,0,0),3,False),
      Case('Gate Covert Flight', 'LGDEC',(1,0,0,0,0),2,True,0,0,True),
      Case('Hood Covert Flight', 'LGGEC',(1,0,0,0,0),3,True,0,0,True),
      Case('Gate L cooldown', 'LGDEC',(1,0,0,0,0),2,latias_cooldown=True),
      Case('Hood no Fairy Zone', 'LGGE',(1,0,0,0),3),
      Case('Gate wide no wall', 'TGDELC',(1,0,0,0,0,0),2,True,2,0),
    ]


if __name__=='__main__':
    for c in cases():
        b=attack_frontier(c)
        old=attack_frontier(c,False)
        k=lambda q:sorted(n for n,(s,*_) in q.items() if s[0]>=c.hp)
        print(f'{c.name}: old KO {k(old)}; expanded KO {k(b)}; damage '+str({n:s[0] for n,(s,*_) in sorted(b.items())}))
        if 'Eon' in b:print('  Eon witness:',b['Eon'])
    rows={c.name:attack_frontier(c) for c in cases()}
    assert rows['Hood L funded']['Eon'][0][0]==320
    assert rows['Gate L funded']['Eon'][0][0]==320
    assert 'Eon' not in rows['Gate L empty']
    assert 'Eon' not in rows['Gate no Valley']
    assert rows['Hood no Valley']['Eon'][0][0]==320
    assert rows['Gate Covert Flight']['Eon'][0][0]==0
    assert rows['Gate Covert Flight']['Drain'][0][0]==320
    assert 'Eon' not in rows['Gate L cooldown']
    assert rows['Hood no Fairy Zone']['Eon'][0][0]==120

    def min_count(fn, hp, cap):
        return next((i for i in range(cap+1) if fn(i)>=hp),None)
    print('\nThresholds (minimum attached P for Geist, combined Bench for Rondo):')
    for target,hp,weak,red in [('Drago',280,2,0),('Rolling Iron',280,2,80),('Mega Absol',280,1,0),('Mew VMAX',310,1,0),('Iron Thorns',230,1,0),('Mega Lopunny',330,1,0),('Raging Bolt/Fairy',240,2,0),('Raging Bolt/no Fairy',240,1,0),('Meloetta',200,1,0),('Raichu',110,1,0)]:
        print(target,min_count(lambda n:(10+30*n)*weak-red,hp,11),min_count(lambda b:(20+20*b)*weak-red,hp,16),160*weak-red,200*weak-red)
    print('\nVSTAR attack damage to same neutral Active; no intervening healing:')
    for band in (0,20):
        for dna in (0,30):
            hits={name:max(0,base+band-dna) for name,base in [('Phantom',200),('Timeless',150),('Dragonite',330),('Trifrost active',110)]}
            print('band',band,'DNA',dna,hits,'Timeless+Phantom',hits['Timeless']+hits['Phantom'])
    assert (160*2-80,200*2-80)==(240,320)
    assert (150+20-30)+(200+20-30)==330
    assert 330+20-30==320
