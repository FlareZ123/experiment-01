# Rank 15: permanently dismantle the dual Vileplume lock, not just KO a reusable Stage 2

Agent 20 · 2026-11-27 · Fixed Hood Shield and Lockbridge tactical decision evidence; no deck or frozen-policy change.

## Decision

Both unchanged candidate lists have Shadow Rider Calyrex V CRE74, Girafarig LOT94, Dimension Valley, Stealthy Hood and basic Psychic. The exact rank-15 Lopunny Vileplume source contains 2 Oddish UNB5 (50 HP), 2 Gloom UNB7, 2 Vileplume AOR3 (Irritating Pollen), 1 Vileplume BUS6 (Disgusting Pollen). It contains no Rare Candy, alternate Basic replacement or direct Stage-2 placement effect. Grand Tree and TM Evolution still require the respective evolutionary stages. Do not treat a KO or an ordinary discard as a permanent lock-resource loss: two Karen, two Bunnelby PRC121 (Omega Barrage / Rototiller), and Eldegoss V give the source recursion options.

**New concrete attack-target rule:** when both available copies of Oddish OR both Gloom are in the opponent's discard pile, Girafarig's Get Lost can remove them permanently in a single attack, making *both* Vileplume locks impossible for the remainder of this game. Even removing one Oddish OR one Gloom permanently prevents simultaneous AOR+BUS establishment (at most one chain survives), though that surviving chain can still produce either lock. Removing the unique BUS permanently eliminates Basic attack lock; removing both AOR eliminates Item lock. These are distinct objectives, not additive card-score bonuses. Account for previously Lost Zoned copies. Do not substitute unobserved Prize/hand information for discard evidence.

Get Lost costs one Colorless, or zero with live Dimension Valley (Girafarig is Psychic). If BUS is Active, it requires live Stealthy Hood on Girafarig or another actual means to remove/suppress the attack restriction; AOR alone does not prevent the attack or attaching Hood. Verify attack readiness and relevant public effects; do not assume every theoretically available discard pair is selectable. When the next attack wins outright, take the game instead of spending an attack on denial.

## Exact permanent cut-set selection

Let remaining non-Lost-Zoned counts after a proposed Get Lost choice be O,G,A,B in source order. Count every non-Lost-Zoned copy as optimistically recoverable, including hidden or Prized copies, so this is a conservative maximum future lock capability, not a prediction of access. Chain capacity n=min(O,G). Maximum AOR in play=min(n,A), maximum BUS=min(n,B), simultaneous AOR+BUS possible iff n>=2 and A>=1 and B>=1. Both lock types impossible iff n=0 or A+B=0. AOR and BUS cannot occupy the same chain at the same time.

| Public discard (no previous Lost Zone) | Get Lost selection | Max AOR / BUS / simultaneous dual |
|---|---|---|
| 2 Oddish, 2 AOR, BUS | **2 Oddish** | 0 / 0 / no |
| 2 Gloom, BUS | **2 Gloom** | 0 / 0 / no |
| Oddish, Gloom, 2 AOR, BUS | Oddish + BUS (Basic-dependent pilot); or 2 AOR (VMAX/Item-dependent pilot) | 1 / 0 / no; or 0 / 1 / no |
| Oddish, Gloom only | Oddish + Gloom | 1 / 1 / no |
| 2 AOR and BUS | 2 AOR or AOR + BUS depending on the actual winning axis | 0 / 1 / no; or 1 / 0 / no |
| One Oddish previously Lost Zoned; other now in discard | second Oddish + best other target | 0 / 0 / no |

Never interpret 1/1/no as an assurance that the opponent cannot change which lock is deployed later. Compare Get Lost to an immediate Prize win, possible gust KO, and the risk of using a one-Prize attacker instead of progressing the VMAX engine. If the goal is to restore Item access for an evolved attacker, eliminate both AOR when possible; if the only winning attack belongs to a Basic, prioritize the unique BUS. The pair that permanently removes all Vileplume dominates partial cuts *on lock capacity*, not necessarily on full game value.

## Create the discard opportunity: Astral Barrage

CRE74's Astral Barrage places five counters on each of two opponent Pokémon, including Bench Pokémon. Both UNB5 Oddish have exactly 50 HP, so two exposed, unprotected unevolved Oddish can be KO'd in one attack without gust. If these are the opponent's only Pokémon, this is an immediate board-out win (subject to simultaneous win-condition resolution); otherwise it takes two Prizes and removes both evolution bases from play. If they remain in discard on our next attack, the Get Lost follow-up permanently cuts the entire dual-lock system. The rank-15 player must actively deny this follow-up: Karen shuffles the Pokémon away; Bunnelby can Rototiller up to two cards via its two attacks, possibly saving a stage; after removing/recovering AOR the source may also have Item access. Therefore do not claim an unconditional two-attack lock kill.

Timing and funding: Astral Barrage requires three Colorless (two with Dimension Valley), not one; neither candidate can pay it by normal single attachment on its first turn. A second-turn opportunity requires prior attachment plus a second attachment with Valley or actual acceleration, and survival/position. A Gloom at 80 HP or fully evolved Vileplume is not a 50-HP Oddish; do not select it as an immediate KO unless existing damage makes it lethal. Against Active BUS, the Basic Shadow Rider V also requires live Hood or a real suppression/position route. When both Oddish are already Gloom, Max Geist, rather than the hypothetical early Barrage, may be required to create the discard window. Damage counters are attack effects, not ordinary damage.

## Opponent's overlooked Hood answer: Pidgey FLF75

The rank-15 list has **two Pidgey FLF75**, whose one-Colorless Peck Off discards all Tools attached to the defending Active Pokémon before dealing 10 damage. This is an attack effect, not an opponent Ability, so Stealthy Hood cannot protect itself. This remains usable during AOR Item lock and can be funded with a basic Grass or even a one-unit Special Energy under Temple. The absence of Field Blower/Faba/Tool Scrapper is therefore not equivalent to absence of Tool removal. Do not spend both Hoods indiscriminately or assume an attached Hood survives.

There is a precise opportunity cost to Peck Off: the attacking Pidgey occupies Active through the end of the attack and gives the candidate a turn without Active BUS's Basic attack lock (rank 15 has no effect that switches its own Active after Peck Off). Benched AOR may still block Items. In an ordinary ongoing state with Hood-stripped Girafarig surviving Active, two Oddish/Gloom in discard, and a paid Get Lost, the candidate can execute the permanent cut immediately without a replacement Hood. A candidate relying on its remaining Hood should exploit this one-turn window, not automatically search another Tool. Rank 15 should avoid exposing an irreversible pair to a surviving Girafarig on the reply. If Pidgey instead KOs the candidate's attacker, or attack cost/effects prevent the reply, the cut is not guaranteed. Opponent may choose to keep BUS active instead and attack/deny in other ways; cannot claim both actions simultaneously. On the candidate side, with 2-3 Psychic and a live Valley as appropriate, Girafarig Mind Shock also KOs a healthy 60-HP Pidgey for one Prize, but the Get Lost lock cut can be worth more if no immediate Prize win exists.

## Computational check

Local Python enumerated every possible rank-15 component count in Lost Zone, remaining discard counts and Get Lost selection of up to two relevant components (irrelevant discard cards may fill the remaining required choices). 1,323 component-only combinations tested, with zero failed assertions. Reproduce the exact count with:

```python
from itertools import product
N = (2,2,2,1)
def caps(v):
    o,g,a,b=v; n=min(o,g)
    return min(n,a),min(n,b),int(n>=2 and a>0 and b>0)
checked=0
for l in product(*(range(v+1) for v in N)):
    rem=tuple(n-x for n,x in zip(N,l))
    for d in product(*(range(v+1) for v in rem)):
        for x in product(*(range(v+1) for v in d)):
            if sum(x)!=min(2,sum(d)): continue
            r=tuple(n-y for n,y in zip(rem,x))
            a,b,dual=caps(r)
            assert dual==int(r[0]>=2 and r[1]>=2 and r[2]>=1 and r[3]>=1)
            assert (a==b==0)==(r[0]==0 or r[1]==0 or r[2]+r[3]==0)
            if r[0]<2 or r[1]<2: assert dual==0
            checked+=1
assert checked==1323
```

This is finite inventory arithmetic only. It does not test legal native action tokens, establish reachability, simulate draws or opponent policy, or compare matchup rates. The six selection examples above are direct outputs of the same count calculation. No newly registered scenario, workflow, fixture, game, or gate.

## Application

Use the existing candidate successor's actual attack and discard-target continuations where authorized; do not add a parallel evaluator or delay the owner-gated V3 pair. Three useful actor-visible challenge states after implementation: (1) two 50-HP Oddish offered as Astral Barrage targets versus two nonlethal targets; negative: both already Gloom; (2) Get Lost offered two Oddish plus two AOR and BUS, choose the common-base cut (negative: only one common base remains in discard; choose axis according to actual plan); (3) Pidgey Active after Peck Off, no active BUS, living paid Girafarig, exact discard cut available, prefer executing it over unnecessary Hood replacement. Include terminal win overriding denial. Do not claim these states are naturally reached.

Inputs: `results/aichi-2026/full-decklists.json` rank15, `results/aichi-2026/candidate-hood-shadow-rider.json`, `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`; supplied card archive CRE74, LOT94, PHF93, UNB5/7/186, AOR3, BUS6, FLF75, PRC121, OBF164, PFL84, SCR136, PAR178, RCL19, Karen. Advanced Rulebook A-01, A-05, B-02, C-07, C-12, E-09; prior work Agent30 two-Oddish setup fork, Agent43 Hood-access report, Agent36 two-Vileplume Prize gate. Their setup/availability studies are not rerun here. No qualified matchup or win rate demonstrated; no candidate ranking change.
