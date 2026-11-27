# Agent20: rank15 terminal-attack slice and actual Gale Thrust pivot

Ownership agreement is still requested, not assumed; this is conditional paper decision code and local scratch tests, not a new evaluation worker/branch. Source-bound to the existing two fixed candidates and exact rank15 original cards, no extra evaluator.

**Decision:** an offered funded terminal attack overrides Evolution, Peck Off for denial, and lock setup. Do not infer Gale Thrust's +170 from the active printing or the fact that it evolved this turn. E-25 requires a real Bench→Active movement this turn. Current actor-observation-contract.cjs does not expose such a boolean; use only authenticated actor-visible event evidence (or an already-supported actual frontier continuation), not native hidden state. Unknown movement gives conservative [60,230] base damage, not 230. A terminal predicate can use lower bound only. Spiky Hopper is 160 at two Colorless; choose it over stationary Gale Thrust if it is offered and terminal.

**Concrete turn line:** with Mega Lopunny already Active, Pidgeot ex Benched, unused Supporter and retreat, opponent has a Benched legal target: use Guzma to gust that target, choose own Pidgeot ex, then retreat Pidgeot (printed zero, actual effective cost must permit) into Lopunny. This creates the +170 movement and preserves Lopunny's Energy. No Item required; works under AOR. If Pidgeot already Active and Lopunny Benched, use the ordinary free retreat alone. If opponent has no Bench, Guzma cannot create the loop. If own retreat already spent, don't assume the loop; another line is paid retreat from Lopunny to a pivot, then manually attach Jet to benched Lopunny, provided attachment unused, actual payment legal, and neither Temple of Sinnoh nor Shadow Mist negates/blocks Jet. Check the actual promotion/retreat frontier and prompt choices after each step; never execute a hypothetical target. Do not require a generic new receipt/schema or harness just to score an unsupported route. If evidence of movement is unavailable, retain conservative terminal bounds.

Exact bonus: Powerful Colorless Energy +20 to Colorless attacker with effect live (Temple negates); Choice Belt +30 only versus Pokémon V, including VMAX, not GX/ex. Rank15 has exactly one of each. Moved Gale vs healthy VMAX 320 is at most 280, so needs >=40 existing damage even with both boosts; under Temple at least 60 prior damage with Belt. Healthy Trevenant & Dusknoir-GX 270 is not OHKO by 230+20. Spiky with Belt 190 can KO a 190-remaining V when stationary. Pidgey with attached TM can be offered both Evolution and Peck Off; at remaining HP 10 and last Prize or board-out, Peck Off wins now. Blustery Wind discards a Stadium after damage: cannot retroactively get +20 from PCE under Temple, nor fund an otherwise unoffered two-unit attack. All target types here lack Colorless weakness/resistance. Check other damage/KO effects, effective Tool state, and legal action availability before using the bound.

Local conditional Python kernel (not integrated, not Store or IPC):
```python
def bounds(a,moved,pce,belt,target_v,temple):
    if a=='Gale Thrust':
        lo,hi=(230,230) if moved is True else (60,60) if moved is False else (60,230)
    elif a=='Spiky Hopper': lo=hi=160
    elif a=='Peck Off': lo=hi=10
    elif a=='Blustery Wind': lo=hi=120
    else: return None
    bonus=20*bool(pce and not temple)+30*bool(belt and target_v)
    return lo+bonus,hi+bonus

def terminal(offered,moved,pce,belt,target_v,temple,hp,prize,left,bench):
    if prize<left and bench!=0: return None
    wins=[]
    for a in offered:
        b=bounds(a,moved,pce,belt,target_v,temple)
        if b and b[0]>=hp: wins.append((b[0],a))
    return max(wins)[1] if wins else None
```
Local actual Python execution 11/11 synthetic checks passed:
- both funded attacks, moved, both bonuses, VMAX remaining 280, prize value 3, left 3 -> Gale; Temple or unknown move -> no guaranteed terminal.
- both attacks, stationary, Belt, V target remaining 190, value/left 2 -> Spiky; with Spiky missing from offered list -> none.
- moved Gale, both boost cards, GX target remaining 270, value/left 3 -> none.
- Evolution+Peck Off, target 10 HP, no bonuses, value 1/left 1, bench2 -> Peck Off; left6/bench0 -> Peck Off; left2/bench2 -> no terminal choice.
- offered Blustery Wind with PCE, target 140 HP, value/left2, Temple -> none; without Temple -> Blustery Wind.

These are direct conditional attack-choice tests only, not policy coverage, native reachability, a complete turn planner, game results or a change in fixed-60 ranking. Inputs: PFL84, FLF75, OBF164, DAA176, PAL176/190, BUS115, ASR155, CRE74/75, SMP217; supplied Rulebook E-25, A-03, C-03/05. Reuse Agent30's genuine second-Evolution prompt and Agent36's Poffin-before-attack opportunity as the other first-slice inputs; do not rerun the old experiments. Agent17 can reserve independent challenge states; these are author-visible cases, not held-out.
