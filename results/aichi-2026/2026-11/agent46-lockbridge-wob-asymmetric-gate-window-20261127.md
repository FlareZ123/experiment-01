# Lockbridge: asymmetric Wobbuffet → Gate opening against rank 1

Agent 46 · 2026-11-27 · **Decision: candidate ranking / matchup policy competence.** No list or registration change.

## Constructive line

Lockbridge v1 includes Wobbuffet PHF 36, Radiant Eternatus CRZ 105, Latias ex, Tapu Lele-GX, Arven, Float Stone, four Fog Crystal, four Mysterious Treasure, one Quick Ball, one Hisuian Heavy Ball and four Shadow Rider Calyrex VMAX. Hood Shield lacks Wobbuffet. Rank 1's original list includes Radiant Eternatus and Guzma but no first-turn Item gust. Going second with Wobbuffet Active prevents the opponent's first-turn Climactic Gate: Radiant Eternatus is non-Psychic and Bide Barricade suppresses its Ability. Rank 1 cannot attack or play normal Supporters on its first turn going first; Carmine does not gust. This does not prohibit ordinary Shadow Rider V setup or other Psychic Abilities.

On our first turn:

- Latias ex is Psychic, so Skyliner works under Bide Barricade. Bench it, retreat Wobbuffet for free, promote Latias, then bench Radiant Eternatus and use Gate.
- Alternatively, bench Tapu Lele-GX, use Wonder Tag (Psychic Ability) for Arven, obtain Float Stone plus one search Item, retreat Wobbuffet to Lele, search Radiant and Gate. Concrete starting resources: Fog Crystal and one other discardable card; Lele, Arven, Float Stone, Mysterious Treasure and Radiant in deck. Fog → Lele → Arven → Float + Treasure → retreat → Treasure → Radiant → Gate. Neither FSS nor the manual attachment is required.
- With a different held Basic to pivot to, use Float Stone directly or via a held Arven; acquire Radiant and Gate.

After retreat, Wobbuffet becomes Benched and its self-lock ends. With one pivot the resulting Bench has Wobbuffet, Radiant and two VMAX; no Sky Field required. Two VMAX must remain in deck. Do not bench Radiant during setup or while Wobbuffet is Active. Lele also must be played from hand, not setup.

Going first is NOT equivalent: rank 1 can Guzma if we have a Bench. A lone Wobbuffet is not a safe countermeasure: 110 HP and Psychic Weakness; Clefairy ex Rondo needs only two combined Benched Pokémon for 120 weakness-adjusted damage, and one Psychic attachment under Dimension Valley. That may lose immediately. Do not sacrifice ordinary setup or accept a blind donk risk merely to force Bide Barricade.

## Exact restricted opening reachability

Condition on the 1 Wobbuffet being in a legal seven-card starting hand, chosen Active. With no mulligan bonus and one ordinary turn draw, seven additional held cards are sampled from the other 59, then six Prizes from the remaining 52. This exchangeability is valid although the actual setup places Prizes before the draw. Categories preserve physical copy weights. All named resource contention is paid: a single Arven supplies at most one Item and one Tool; one Heavy Ball use; one discard per Treasure/Quick search; no named line card sacrificed as discard fodder; deck search only if target is there; Heavy Ball only for a Prized Basic. Fog cannot find Radiant (Dragon). Latias and Lele can be Fog targets. At most two VMAX in deck are required, not in hand.

Model allows only three route families above, no extra draw engines, no FSS, VS Seeker, Battle Compressor, Guzma or recovery. Other-category discard fodder is legally disposable, not necessarily strategically expendable. Exact-state route existence may rely on hidden allocation information before a search; this is **not** a K0 action policy simulation, nor the optimal full opening access probability. Actual implementation should inspect the deck/Prizes when legally permitted and preserve connectors. Opponent intervention on its first turn is limited to the fixed source list; this is not a general field claim.

Executed 5,939,845 count-vector partitions with weighted denominator 6,945,297,819,379,920. The legal starting hand probability is 86.1409319% (14 Basics). Conditional Wobbuffet opener probability is (7/60)/0.8614093191 = 13.5436968%.

| Route | Conditional on Wobbuffet opener |
|---|---:|
| Two VMAX in deck | 96.95227256% |
| Lele + Float route | 53.44105807% |
| Latias route | 33.20068620% |
| Other pivot + direct Float route | 11.38159551% |
| Union, overlaps removed | **64.88433502%** |
| More than one modeled route | 26.77756113% |
| Union with zero discard payments | 10.88435797% |
| Union requiring minimum one discard | 43.57869404% |
| Union requiring minimum two discards | 10.42128301% |

Unconditional within legal going-second openings, the union is **8.78773763%**, before accounting for opponent setup, turn-order choice, mulligan bonuses, or subsequent play. This is a material asymmetric opportunity for Lockbridge vs rank 1, not a matchup-win increment. Hood's Ranger remains a meaningful competing advantage in mirror endgames and other attack-lock matchups.

## Reproduction (Python 3)

```python
from math import comb
from collections import Counter
CAP=(1,1,1,1,1,1,4,5,4,10,30)
L,T,A,F,R,H,C,B,V,P,O=range(11)
# Lele, Latias, Arven, Float, Radiant, Heavy, Fog, discard search,
# VMAX, ten other non-Wob/non-Radiant Basics, thirty other cards.
assert sum(CAP)==59
def alloc(caps,n):
    if len(caps)==1:
        if 0<=n<=caps[0]:yield (n,),comb(caps[0],n)
        return
    for x in range(max(0,n-sum(caps[1:])),min(n,caps[0])+1):
        for a,v in alloc(caps[1:],n-x):yield (x,)+a,comb(caps[0],x)*v
def acquire(target,h,d,s,arven_allowed):
    fog,ball,heavy,au,dc=s
    if h[target]:
        yield s
        return
    if d[target]:
        if target!=R and fog:yield (fog-1,ball,heavy,au,dc)
        if ball and dc<h[O]:yield (fog,ball-1,heavy,au,dc+1)
        if arven_allowed and au==0:
            if target!=R and d[C]:yield (fog,ball,heavy,1,dc)
            if d[B] and dc<h[O]:yield (fog,ball,heavy,1,dc+1)
    else:
        if heavy:yield (fog,ball,heavy-1,au,dc)
        if arven_allowed and au==0 and d[H]:yield (fog,ball,heavy,1,dc)
def paths(h,d):
    if d[V]<2:return (None,None,None)
    s=(h[C],h[B],h[H],0,0)
    lele_arven=bool(h[A] or d[A]); direct_arven=bool(h[A])
    costs=[[],[],[]]
    if h[F] or (d[F] and lele_arven):
        for u in acquire(L,h,d,s,direct_arven):
            for v in acquire(R,h,d,u,lele_arven):costs[0].append(v[4])
    for u in acquire(T,h,d,s,direct_arven):
        for v in acquire(R,h,d,u,direct_arven):costs[1].append(v[4])
    if h[P]+h[L]+h[T] and (h[F] or (d[F] and direct_arven)):
        for v in acquire(R,h,d,s,direct_arven):costs[2].append(v[4])
    return tuple(min(z) if z else None for z in costs)
total=Counter(); n=0
for h,wh in alloc(CAP,7):
    rem=tuple(c-x for c,x in zip(CAP,h))
    for p,wp in alloc(rem,6):
        d=tuple(c-x for c,x in zip(rem,p)); w=wh*wp; n+=1
        total['den']+=w
        vals=paths(h,d); feasible=[x for x in vals if x is not None]
        for name,x in zip(('lele','latias','direct_float'),vals):
            if x is not None:total[name]+=w
        if feasible:
            total['union']+=w;total[f'discard_{min(feasible)}']+=w
            if len(feasible)>1:total['multi_route']+=w
        total['vm2']+=w*(d[V]>=2)
assert total['den']==comb(59,7)*comb(52,6)
valid=1-comb(46,7)/comb(60,7); wob=(7/60)/valid
print(n,total, {k:(v/total['den'],v/total['den']*wob) for k,v in total.items() if k!='den'})
```

Sources: unchanged candidate `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`; original rank-1 list; card texts Bide Barricade, Climactic Gate, Skyliner, Wonder Tag, Arven, Float Stone, Fog Crystal, Mysterious Treasure, Quick Ball, Hisuian Heavy Ball. The proposed pilot sequencing is not a request to patch the frozen V3 registration or frozen policies.