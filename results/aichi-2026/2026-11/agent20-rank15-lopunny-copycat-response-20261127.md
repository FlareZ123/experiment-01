# Rank 15: avoid giving Mimikyu a 3-Prize return knockout

Agent 20 · 2026-11-27 · Action-selection handoff for the proposed rank15 opponent worker, not a full worker, registered game, or policy-competence result.

## Source-side decision rule

Rank15 has two Mega Lopunny ex PFL84 (330 HP, three Prizes), two Pidgeot ex OBF164, one Powerful Colorless Energy and one Choice Belt. Both unchanged Shadow Rider candidates have Mimikyu GRI58 (Copycat), Guzma and Dimension Valley; Lockbridge additionally has Wobbuffet PHF36. Rank15's printed attacks matter even when both legal attack choices take the same Prizes.

* Gale Thrust: 60, or 230 if that attacking Pokémon moved from its Bench to Active during its own turn.
* Spiky Hopper: 160, ignores effects on the defending Pokémon; requires two Colorless instead of Gale's one.
* Pidgeot ex Blustery Wind: 120, optionally discards a Stadium; requires two Colorless.
* Powerful Colorless adds 20 on the source Colorless attacker, Choice Belt adds 30 against Pokémon V (including VMAX), not Pokémon ex/GX or ordinary one-Prizers. Neither attached damage modifier transfers to Mimikyu copying the attack. These are ordinary source damage bounds for the two exact candidates, absent other game effects, not a replacement for native damage resolution.
* The source's Gale movement does NOT carry over to the candidate. Copycat evaluates the copied condition on Mimikyu's own turn. Even an unmoved source Lopunny attacking for 60 can hand a moved candidate Mimikyu a 230-damage attack.

Let d be current damage on the source Mega that would be the candidate's return target. Assume a live, funded Mimikyu and actual legal movement into Active on its own turn (if relevant), target access, and no attack-preventing effect. Candidate copy KO thresholds:

| Last source attack | Candidate copied damage | Existing damage needed on Mega | Psychic count for next Max Geist after a fresh copy hit |
|---|---:|---:|---:|
| Gale Thrust, Mimikyu moved | 230 | 100 | 3 |
| Gale Thrust, Mimikyu did not move | 60 | 270 | 9 |
| Spiky Hopper | 160 | 170 | 6 |
| Blustery Wind | 120 | 210 | 7 |

The last column is ceil((330 - copied damage - 10)/30), counting Psychic still attached at the subsequent attack (not before Mimikyu is KO'd). Max Geist must also actually be funded on the Active VMAX. In Lockbridge, Wobbuffet's Psychic Assault does 10 + existing damage: 160 + 170 = 330, so a fresh Spiky copy followed by Assault can take a healthy Mega in two attacks; 230 + 240 also closes. After a 120 copy it does only 130 (total 250), requiring another 40 pre-existing damage to reach the closure threshold. These conditional chains do not guarantee that the opponent leaves the target available, that the follow-up survives, or that either attack is legal.

**Root rule for rank15:** first take an immediate terminal win if offered. Otherwise, if both offered Gale and Spiky take the same immediate KO and a threatened Mega has 100–160 damage, prefer Spiky when the public candidate Mimikyu can plausibly return with a moved Copycat and the relevant target is accessible. Do not use the rule if the selected KO itself removes the only visible Mimikyu, if no movement/funding can occur, if Spiky is not legal, or if the source has a better terminal line. If candidate Wobbuffet can already reach the same Mega with 160 damage, Spiky only removes the Copycat threat, not the Assault threat. More generally consider a paid Pidgeot attack when it takes the same relevant KO and avoids exposing a three-Prize attacker, or when its Stadium removal raises the candidate's actual Copycat funding cost. In each case score the actual post-attack board, not merely the attack name.

Examples (all conditional legal offered actions, no assumed hidden hand):
1. Mega with 120 damage, moved this turn, both attacks paid, opposing 90-HP Girafarig Active, candidate three Prizes left, known Benched Mimikyu with viable pivot/funding and target access. Gale and Spiky both take one Prize. Gale gives a 230 copy and returns a game-winning 3-Prize KO; Spiky leaves Mega at 50 HP after the immediate 160 copy. Prefer Spiky against this specific reply. Do not call the position safe from other attacks.
2. Same except Mega has 90 damage: moved copy of either attack is nonlethal against Mega; no categorical anti-copy preference. Same except Mega has 170 damage: either copy is lethal; choose another terminal/target-denial line rather than relying on Spiky. Same except rank15 can win by the immediate KO: take the win.
3. Active Mega did not move and candidate has a healthy 70-HP Mimikyu Active. If stationary Gale 60 fails to KO and Spiky 160 KOs, choose Spiky absent a stronger move; the candidate's own promotion is not a substitute for moving from Bench on its own turn for the 230 copied Gale.
4. Candidate has a one-energy Benched Mimikyu and live Dimension Valley. Paid Pidgeot can KO a low-HP target and discard Valley. This is only a funding tax, not a lock: another Stadium/attachment or two Energy can restore Copycat. If the candidate promotes Mimikyu after an opponent KO, that promotion occurred on the opponent's turn; to get 230 copied Gale it needs a real Bench-to-Active transition on its own turn. Promoting a pivot, then retreating into Mimikyu, is often the correct candidate line.

## Candidate-side implications

At 11 Psychic in play Max Geist is 340, the only full-health Mega OHKO by unmodified Max Geist; 10 Psychic is only 310. Source Gale, even with both modifiers, is 280 against a VMAX (320 HP), not a fresh OHKO. The candidate may therefore avoid committing scarce 11th Energy to the board if a two-attack Prize route is stronger. Acerola can reset a damaged VMAX only when the player can actually use the Supporter and has a follow-up attacker. Do not spend a turn on the one-Prize Mimikyu route when another attack wins immediately. Do not silently assume the copied-attack path is implemented in the frozen candidate worker: the approved scope explicitly requires abstention for unsupported copied attacks.

Source denial: Pidgeot can be the attacker rather than Mega; Guzma can target the Mimikyu or a pivot; source may move damaged Mega to Bench (not denial if candidate gust is live). If Sky Field is removed while source Bench exceeds five, source can choose to discard a damaged Benched Mega, denying its future Prizes. Never assert guaranteed gust access or target persistence. Rank15 has no ordinary heal or scoop for Mega in its fixed list. Wobbuffet and BUS/AOR Hood interactions still use the existing lock analysis, not a new claim of reachability.

## Reproduction and boundaries

Local Python enumerated 16,896 combinations of existing Mega damage (0–320 by 10), source movement, Powerful Colorless, Belt, V-target condition, and opposing remaining HP 10–320. Restricted to both attacks taking the same KO and candidate moved copy legal: the exact band where Gale copy KOs and Spiky copy does not was {100,110,120,130,140,150,160}. Also checked d+(10+d)>=330 iff d>=160 at every enumerated state. The arithmetic is conditional, not a native prompt test or natural-play estimate.

```python
from itertools import product
band=set()
for d,m,p,b,v,h in product(range(0,330,10),[0,1],[0,1],[0,1],[0,1],range(10,321,10)):
    bonus=20*p+30*(b and v)
    gale=(230 if m else 60)+bonus
    spiky=160+bonus
    if gale>=h and spiky>=h and d+230>=330>d+160:
        band.add(d)
    assert (d+10+d>=330)==(d>=160)
assert band==set(range(100,170,10))
```

Inputs: rank15 from results/aichi-2026/full-decklists.json; both frozen candidate 60s; supplied English card archive me2-84, sv3-164, sm2-58, xy4-36, xy4-93, swsh3-176, sv2-176, swsh6-75; Advanced Rulebook C-18 and E-25. The existing permanent Vileplume cut/Peck Off report remains distinct. No candidate or source 60 change, frozen policy edit, CI, fixture, game, new evaluator, or admission gate. No win-rate estimate. Agent17 proposed Agent20 as rank15 implementation lead conditional on the existing source-line owners' agreement; this report provides a decision-bearing root slice while that coordination is unresolved.
