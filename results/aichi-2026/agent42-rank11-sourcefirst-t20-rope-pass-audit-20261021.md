# Rank-11 source-first T20: held Escape Rope behind a Pass, with both Benches populated

**Agent 42 | 21 October 2026 | evidence: independent archived native transcript analysis + supplied printed card text. No new Store intervention, games or outcomes.**

## Exact original evidence

I independently downloaded the existing Agent 8 [native source-first emergency Supporter artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39658143819/artifacts/12373300483), ZIP SHA-256 `04e7902f87b228c6daacc4be0a1cfc640fb5be635c6fe8a1b61e60f35a323bbc`, and inspected `agent8-near-term-no-ace-sourcefirst.json` and `agent8-near-term-control-sourcefirst.json`. These contain four archived rank-6/rank-11, champion/New Moon rows for a **retrospectively selected** source-first setup. They are reused data, so none of this is a prospective win-rate sample.

This finding applies to rank-11 Absol/Garbodor published 60 against unchanged **New Moon Lockbreaker v1**, actual source physical seat 0 first, candidate seat 1 second, engine seed `482443328`, complete original source-deal fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. It has the pre-existing paper Supporter guard and actor-only policy; native overall CI run was red on an *independent rank-6 original epoch gate*, while the source-first subset and its same-deal checker passed. Root-ledger SHA for the no-Ace source-first row: `3ad102104924c931c612460c19897e4d89b63edaa584cdb3f996212b5ca9eda6`.

At **candidate global turn 20**, native `PassTurnAction` occurred at **action ordinal 103** after the Wait from the source's **turn-19 `Psychic` KO** and Prize/promotion sequence. The transcript's authentic candidate-owner hand after this Pass held nine physical printings:

`Ace Trainer AOR; Dusclops SFA; Hisuian Heavy Ball ASR; Canceling Cologne ASR; Secret Box TWM; Escape Rope BST; Field Blower GRI; Powerglass SFA; Sky Field ROS.`

The public native pre-Pass board shows:

| Source Active and Bench | Candidate Active and Bench |
| --- | --- |
| **Oranguru V** with **200 damage**, three Darkness Energy, no Tool | **Galarian Articuno V** with zero attached Energy, zero damage |
| **Garbodor** with zero Energy, **zero Tool**; **Crobat V** with zero Energy | Two **Duskull**, **Gengar & Mimikyu-GX**, **Latias ex**, all zero attached Energy |
| No Stadium | No Stadium |

The next authentic source turn played Trubbish and Tapu Lele-GX, then source **`Psychic`** at native ordinal **109 / global turn 21**. Candidate T22 played one Psychic Energy onto Active Articuno at ordinal 113, then passed at 114. There is no `Escape Rope` action in that candidate T20 root.

## Printed rule and falsification

The provided card pool has `Escape Rope`, `swsh5-125` (Battle Styles), as an Expanded-legal **Item**: *Each player switches their Active Pokémon with a Benched Pokémon; the opponent switches first; a player without Bench does not switch.* The Advanced Player's Rulebook permits multiple Item cards during a turn, distinguishes a card-effect Switch from the once-per-turn ordinary retreat, and explains that “Switch out your opponent's Active Pokémon” permits the opponent to choose its promoted Pokémon. In the observed T20 public snapshot **both players have alternative Benched Pokémon**, and the only opponent shown Ability-lock candidate Garbodor has **no Tool attached**. The preceding source attack is printed `Psychic`, not an observed Item lock.

Thus this is a **specific plausible paper-legal and actor-owned tactical pivot**: playing the already held Escape Rope could move the energy-loaded, almost-KO'd Oranguru away from Active and force the source to promote one of two zero-Energy Benched Pokémon, while the candidate selects its own promotion. With native-source opponent choice and subsequent switching/recovery, the route might delay a follow-up attack, expose different Prizes, or leave the candidate in an even worse position. **No benefit is established.** Native Store acceptance, switch prompts, actual selection, legal restrictions outside the snapshot, the opponent's independent next turn, and any Paper-effect correction remain to be tested.

**Minimal same-deal test:** fork the existing canonical source-first T20 Store immediately before ordinal103. Preserve source/candidate printings, physical deal, all roots through 102, source policy, both actor information boundaries, and all Supporter/KO-order gates. Replace only the candidate Pass with an actor-owned actual `Escape Rope BST` PlayCard root (if Store allows), settle opponent-first and candidate switch prompts under the **unchanged general source policy**, then resume both players. Compare with the untouched control at least through source T21, candidate T22, source T23, and the previously studied T27 damage horizon. Log rejected or absent choices, physical Prizes, visible damage, completed attacks, new source roots, full root ledger and any epoch failure. If this pivot makes no progress, retain that negative result.

This is a natural candidate for a **multi-action common-policy** repair alongside Agent8's held **Ace Trainer** at the same T20 owner root; the two cards use different per-turn channels, but sequencing and Supporter contention must be measured. No source-specific Oranguru hardcoding should be merged into the common scorer, and no new benchmark harness is needed. Relevant original [Agent8 Ace native result](agent8-emergency-ace-trainer-native-sourcefirst-20261021.md), [Agent40 Energy-exposure follow-up](agent40-rank11-turn22-actor-energy-exposure-20261021.md), and [canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs).

## Boundaries

This note establishes a real source-first **held Item + actual Pass + board state** observation, checked independently against the archived full root ledger and supplied card text. It **does not prove native playability at this exact root, tactical superiority, a competitive match win, or a validated field win rate**. Other teammates may already be exploring mobility; check their current leased work before implementation. Existing project status: 29/32 exact source 60s (ranks 23,25,28 missing), **zero competitive-qualified games**, no demonstrated 99.5% fixed-60 target.
