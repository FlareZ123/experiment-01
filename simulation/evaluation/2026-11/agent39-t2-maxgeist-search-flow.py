"""Source-aware limited turn-two Max Geist search-flow feasibility.
No opponent, no native game, no genuine matchup or deck-wins claim.
Run with Python 3.13: python simulation/evaluation/2026-11/agent39-t2-maxgeist-search-flow.py
First player: opening 7 (mulligan-conditioned), six Prizes, draw T1/T2.
Requires a V in original 7, selected Active, and ordinary Psychic
attachments on both turns. Uses a deterministic T1 priority:
direct Psychic > Fog Crystal > Forest Seal Stone's Star Alchemy.
T2 explores every modeled legal sequencing/search/discard decision.
The model intentionally omits Underworld Door, draw Supporters, gusts,
opponent, Tool contention except FSS's once-per-game cap, and all other
card-specific actions; don't extrapolate to field win rates.
"""
from random import Random
from time import perf_counter

# Exact frozen Hood 60 class counts, the OTHER 20 are opaque hand cards
# which may be discarded. Names and subtypes validated against source 60.
# V, VMAX, Basic Psychic, Dimension Valley, Forest Seal Stone, Fog Crystal,
# Mysterious Treasure, Arven, other ten starting Basics, remaining cards.
V, VM, E, D, F, FOG, MYST, ARVEN, BASIC, OTHER = range(10)
BASE=(4,4,11,1,1,4,4,1,10,20)

def possible(hand,deck,allow_arven=True,allow_fss=True,allow_myst=True,
             allow_fog=True,free_myst_discard=False,fss_used_initial=False):
    """Existential T2 planner: three conditions after ordinary T2 attachment.

    A genuine search takes a source copy out of the remaining deck.
    Mysterious Treasure discards one *additional* card; all categories
    may be discarded if doing so still permits a successful line.
    Arven searches at most one Item and one Tool, and only once on T2.
    Forest Seal Stone searches at most one card and one VSTAR Power/game.
    Opaque filler has no modeled effect except a possible discard.
    """
    seen=set()
    stack=[(tuple(hand),tuple(deck),0,0,0,int(fss_used_initial),0)]
    while stack:
        h,d,energy,evolved,stadium,fss_used,arven_used=stack.pop()
        if energy and evolved and stadium:return True
        key=(h,d,energy,evolved,stadium,fss_used,arven_used)
        if key in seen:continue
        seen.add(key)
        if len(seen)>10000:raise RuntimeError('search-state guard')
        def take(i):
            row=list(h);row[i]-=1;return row
        if not energy and h[E]:
            row=take(E)
            stack.append((tuple(row),d,1,evolved,stadium,fss_used,arven_used))
        if not evolved and h[VM]:
            row=take(VM)
            stack.append((tuple(row),d,energy,1,stadium,fss_used,arven_used))
        if not stadium and h[D]:
            row=take(D)
            stack.append((tuple(row),d,energy,evolved,1,fss_used,arven_used))
        if allow_fog and h[FOG] and d[E] and not energy:
            row=take(FOG);row[E]+=1
            remain=list(d);remain[E]-=1
            stack.append((tuple(row),tuple(remain),energy,evolved,stadium,
                          fss_used,arven_used))
        if allow_myst and h[MYST] and d[VM] and not evolved:
            row=take(MYST);remain=list(d);remain[VM]-=1
            # This is a *deliberately invalid* no-discard ablation, never
            # used as a legal result except to measure a connector illusion.
            if free_myst_discard:
                no_cost=row.copy();no_cost[VM]+=1
                stack.append((tuple(no_cost),tuple(remain),energy,evolved,
                              stadium,fss_used,arven_used))
            for disc in range(10):
                if row[disc]>0:
                    selected=row.copy();selected[disc]-=1;selected[VM]+=1
                    stack.append((tuple(selected),tuple(remain),energy,evolved,
                                  stadium,fss_used,arven_used))
        if allow_fss and h[F] and not fss_used:
            row=take(F)
            for target in (E,VM,D,FOG,MYST):
                if ((target==E and energy) or (target==VM and evolved) or
                    (target==D and stadium)):continue
                if d[target]:
                    selected=row.copy();selected[target]+=1
                    remain=list(d);remain[target]-=1
                    stack.append((tuple(selected),tuple(remain),energy,
                                  evolved,stadium,1,arven_used))
        if allow_arven and h[ARVEN] and not arven_used:
            row=take(ARVEN)
            items=[None]+[i for i in (FOG,MYST) if d[i]>0]
            tools=[None,F] if d[F]>0 else [None]
            for item in items:
                for tool in tools:
                    if item is None and tool is None:continue
                    selected=row.copy();remain=list(d)
                    for target in (item,tool):
                        if target is not None:
                            selected[target]+=1;remain[target]-=1
                    stack.append((tuple(selected),tuple(remain),energy,
                                  evolved,stadium,fss_used,1))
    return False

def run(count=20000,seed=390039,profile=BASE,**options):
    """200k physical shuffled trials; per-trial seed ensures replay/ablation."""
    assert len(profile)==10 and sum(profile)==60 and all(
        isinstance(x,int) and x>=0 for x in profile)
    pool0=[i for i,n in enumerate(profile) for _ in range(n)]
    valid=vFound=t1Energy=t2=0
    t0=perf_counter()
    for i in range(count):
        rng=Random(seed+i)
        pool=pool0.copy();rng.shuffle(pool)
        opening=pool[:7]
        if V not in opening and BASIC not in opening:continue
        valid+=1
        if V not in opening:continue # fixed Active V direct-path scope
        vFound+=1
        # 7:13 are six unknown Prizes, not searchable/drawable.
        deck=pool[13:].copy()
        hand=opening.copy();hand.append(deck.pop())
        fss_used_initial=False
        if E in hand:
            hand.remove(E)
        elif options.get('allow_fog',True) and FOG in hand and E in deck:
            hand.remove(FOG);deck.remove(E)
            rng.shuffle(deck) # actual T1 search reshuffles before T2 draw
        elif options.get('allow_fss',True) and F in hand and E in deck:
            hand.remove(F);deck.remove(E)
            rng.shuffle(deck)
            fss_used_initial=True
        else:continue
        t1Energy+=1
        hand.append(deck.pop()) # T2 first draw, after any T1 shuffle
        h=[hand.count(i) for i in range(10)]
        d=[deck.count(i) for i in range(10)]
        if possible(h,d,fss_used_initial=fss_used_initial,**options):
            t2+=1
    return dict(n=count,valid=valid,vFound=vFound,t1Energy=t1Energy,
                t2=t2,rate=t2/valid,seconds=perf_counter()-t0)

if __name__=='__main__':
    import json
    for label,p in [
        ('fixed Hood 60',BASE),
        ('DV 2',(4,4,11,2,1,4,4,1,10,19)),
        ('FSS 2',(4,4,11,1,2,4,4,1,10,19)),
        ('Psychic 12',(4,4,12,1,1,4,4,1,10,19))
    ]:
        print(json.dumps({'profile':label,**run(200000,390039,p)}),flush=True)
