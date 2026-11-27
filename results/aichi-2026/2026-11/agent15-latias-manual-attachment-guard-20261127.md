# Latias manual-attachment reservation: one decisive action before Underworld Door

**Agent 15 | 27 November 2026 | exact conditional resource calculation; not a match, simulator result, deck nomination, or win-rate estimate.**

## Decision and implementation rule

Before using Underworld Door, a candidate policy must inspect whether its **Active Latias ex** can take a decisive Prize KO by receiving the **one manual Psychic attachment** it needs for Eon Blade. If Latias is Active with one Psychic attached, Dimension Valley and Fairy Zone are live, its Eon Blade restriction is absent, and an eligible Dragon target has at most 320 effective HP after a possible Rolling Iron reduction, then attaching the held Psychic to **Active Latias first** preserves that two-Prize line. Door cannot attach to an Active Pokémon. Do **not** blindly consume the only hand Psychic on Door, even when two Rider VMAX Abilities are ready.

This is a conditional tactical guard, not a global recommendation to always attach manually first. It can be bypassed when an already payable alternate attack takes the same Prizes or an actor-visible, reliable alternate way to make the Active attachment exists. If Eon is unavailable due to Covert Flight, cooldown, Ability lock, missing Fairy Zone/Valley, insufficient damage, or an unaffordable pivot, protect other lines instead. An opponent's hidden hand is never an input. This rule applies to the unchanged Hood Shield 60 and to Deoxys Gate v0 (and other candidates using the same Latias/Rider package); it does **not** require a card swap.

## An exact physically consistent 60-card conditional state

- In play: **Active Latias ex** with one Basic Psychic Energy; Benched **two Shadow Rider Calyrex VMAX**, **Radiant Eternatus**, and **Lillie's Clefairy ex**. Five Pokémon plus one attached Energy = six physical cards; Bench has room/legal Psychic recipients for Door.
- Hand: seven cards including **exactly one Psychic Energy and no Fog Crystal**.
- Face-down Prizes: six, including exactly one Psychic Energy.
- Deck: **41 cards** consisting of eight Psychic Energy, four Fog Crystal, and 29 other physical cards. The 11-energy and four-Fog inventories match the candidate. Other cards have no effect in this *one-action* subproblem.
- Normal manual attachment for this turn is unused; neither Door Ability has been used; the opponent's revealed Active is a fresh 280-HP Dragon Regidrago VSTAR with a possible Rolling Iron reduction of 80; Eon Blade's own cooldown is clear. Abilities and Stadium effects are enabled, there is no relevant prevention or effect lock, and the player's attack has not occurred. Latias already has one Energy, so Valley reduces the PPC cost to **two Psychic**. Fairy Zone enables 400 damage, or 320 through Rolling Iron: enough to KO Regidrago.

The state is a conditional counterexample with legal physical totals, **not** a claim about the probability of drawing or reaching it. Do not read any of the following numbers as matchup success rates.

## Exact next-action result

Compare policies that choose the manual attachment **first** against a greedy **Door-first** policy that attempts to activate all available Doors before manually attaching to the Active. Each Door spends one hand Psychic on a Benched Psychic, then draws two without replacement; if Fog is permitted, the greedy policy uses a held/drawn Fog to search a deck Psychic only when it otherwise lacks Psychic to continue Door or to pay the subsequent manual action. No other card access, Supporter, draw, switching, or search effect is modeled. The Fog-disabled condition corresponds to an Item-locked/otherwise inaccessible Fog route, **not** Ability lock.

| Abilities greedily used before manual | Manual-first: pay Eon | Door-first, Fog inaccessible | Door-first, Fog usable |
|---:|---:|---:|---:|
| 0 | 100% | 100% | 100% |
| 1 | 100% | **35.6098%** | **50.4878%** |
| 2 | 100% | **14.0594%** | **28.4487%** |

For zero usable Fog search and one Door, the only route back to a Psychic for Active Latias is finding one in the two drawn cards. With 8 Psychic among 41 deck cards this has probability

`1 - C(33,2) / C(41,2) = 0.3560975609756098`.

With two greedily exercised Doors, the second Door can consume a newly drawn Psychic. Exactly summing all possible ordered two-card draw classes yields **0.14059445047891772**. With four Fog Crystal in the deck and playable if drawn, the fully enumerated probabilities rise to 0.5048780487804877 and 0.2844867480297518, respectively. All numbers are **exact under the stipulated exchangeable-deck and greedy-policy model**, not Monte Carlo approximations. The apparent paradox that extra Door capacity can lower attack reliability is due to **using** the additional Ability before fulfilling the Active attack cost; extra available Doors never force that sequencing in the actual game.

## Why this changes policy priority

The previous constructed [Eon Blade frontier](agent15-eon-blade-frontier-20261127.md) and [three-attack relay](agent15-eon-relay-20261127.md) identify a same-list 320-damage Regidrago counterattack. This calculation isolates a failure mode that can forfeit that attack even with the correct cards already held. It is more actionable than an extra card draw or a marginal generic setup estimate: **reserve the one manual-only Energy on the exact turn it converts into a terminal/two-Prize attack**. The reserve is state/matchup-specific; it must not be implemented as a general ban on Door-first sequencing.

### Implementable actor-only guard

```text
if Active is Latias ex AND Eon Blade is usable on this Active
   AND live Valley makes attack cost payable with one manual Psychic
   AND Fairy Zone/current target/damage permit decisive Prize KO
   AND normal manual attachment remains
   AND hand has an eligible Psychic Energy
   AND no equally strong currently payable alternative attack:
       manual-attach Psychic to Active Latias before Door
       then use any remaining Door opportunities if legal and valuable
else:
       compare ordinary Door/search/attachment alternatives
```

Do not require access to opponent hidden cards or exact Prize positions. Check active-position constraints, other current effects, and the actual card-printing text; a Benched Latias can receive Door, while Active Latias cannot. In a future candidate worker, implement this as a **pre-attack action preference/guard** in the already-approved bounded successor policy lane only after its owner accepts the scope; do not patch frozen Stage-A/V3, change a fixture, or run a game as part of this finding.

## Reproduction and boundary

- Executable exact hypergeometric branch recursion: [source](../../../scripts/2026-11/agent15-latias-manual-guard.cjs). Run: `node scripts/2026-11/agent15-latias-manual-guard.cjs`.
- Local Node 22 assertions passed: [unit tests](../../../tests/2026-11/agent15-latias-manual-guard.test.cjs). Run: `node tests/2026-11/agent15-latias-manual-guard.test.cjs`. These are local tests, **not** pinned-Twinleaf, CI, or full-game evidence.
- Card text checked against the supplied English card corpus: Shadow Rider Calyrex VMAX CRE75 **Underworld Door** attaches only to a Benched Psychic and draws two; Latias ex SSP76 **Eon Blade** costs PPC; Clefairy ex JTG56 gives Dragons Psychic Weakness. Relative rules derive from the supplied Advanced Player's Rulebook: manual once per turn and attacks' Energy costs.
- The calculation omits the cost/likelihood of assembling this board, alternative search cards (including Star Alchemy/Arven), draw order before this state, tool/Bench occupancy changes, opponent reply, prize collection and full turn continuation. Its input is a constructed full-deck partition, **not** a sample of natural hands and not evidence of the 99.5% target.

**Status:** No candidate deck changed. All 32 Aichi ranks remain the required field; 29 original source lists currently authenticated and zero competitively qualified matchups.
