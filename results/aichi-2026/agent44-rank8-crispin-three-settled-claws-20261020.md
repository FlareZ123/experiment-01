# Agent 44: authentic rank-8 Crispin into three settled Claws against Hood

**20 October 2026. Source-dealt, retrospectively selected positive-control experiment. This is not a competitively qualified matchup or win-rate estimate.**

## Finding

A manually selected rank-8 Mega Absol ex/Garbodor source opportunity now has a **native, settled attack continuation**, following the original physical opening. It uses a genuine four-category Secret Box search, one actual Crispin Supporter, native Basic Energy search and native attachment before Boost Shake establishes Tool-equipped Garbodor. With the previous scripted rank-8 setup and generic bots for the remaining turns, the pinned Store executed **three Claw of Darkness AttackActions that settled**. The source took all six remaining Prize cards and the capped engine reported a finished game. The comparison without the Crispin detour was still unfinished at its 200-root cap.

This is a **line-existence and threat-conversion witness on one historical source deal**. Policy quality, matchup-frequency and equitable game-play conclusions are unqualified.

## Fixed inputs and compilation

- Original rank-8 published 60 against unchanged Hood Shield v1 60, from `planAichi` and `candidate-hood-shadow-rider.json`.
- Source rank-8 physical **A**, original actual first player; Hood physical **B**, actual second.
- Historical seed **1260748957**, 200 Store root-action cap, `strictPromptValidation`, `isolatePolicyRandomness`, explicit Forest Seal, Double Dragon, Supporter, Lele entry, Radiant gate and entry-draw correctness flags from the runner. All arms use the same printed decks and seed.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; research GitHub Actions head `a600d621fabb2b2ae28abac2834e204d1d706d93`.
- Exact executable [source runner](../../simulation/twinleaf/rank8-secretbox-crispin-native-line.cjs), [pure predicates](../../tests/rank8-secretbox-crispin-native-line.test.cjs), [existing manually dispatched workflow](../../.github/workflows/aichi-hood-interaction.yml), successful [compiled native CI 39435658098](https://github.com/FlareZ123/experiment-01/actions/runs/39435658098).
- Original 86 accepted Store-root prefix unchanged for unmodified, search-expanded, Crispin and after-hook-restoration controls. The non-Crispin and Crispin cases each complete the original source turn-7 Boost Shake equipped-Garbodor setup.

Native Secret Box owner-deck prompt validated **Quick Ball FST, Muscle Band XY, Crispin SCR, Temple of Sinnoh ASR** together. Native Crispin prompts offered distinct Basic Darkness and Lightning and accepted their selection. The native attachment put Darkness on Active Mega Absol ex. Its attached Energy changed to **two Darkness Energy MEE**; Lightning Energy MEE remained in hand for the next turn. Crispin consumed the source's Supporter quota from 0 to 1. At source turn 9 the active Mega Absol ex held **two Darkness plus one Lightning** and the Bench retained Garbodor with Float Stone.

## Settled attack evidence

The v2 archive stores `realSourceClawTransitions` extracted from actual `publicAttackTransitions`, including root ordinals, both public boards, the settled root, and Prize totals. The source played its genuine printed **Claw of Darkness** attack at all three roots. Each transition had a recorded settled after-state:

| Source turn | Attack root → settled root | Hood Active before attack | Source/Hood Prize cards before → after | Observed consequence |
| --- | --- | --- | --- | --- |
| 9 | 114 → 120 | Shadow Rider Calyrex VMAX, one Psychic, Stealthy Hood, zero damage | [6,6] → [3,6] | Active VMAX disappears; candidate promotes Latias ex; source gains three Prizes |
| 11 | 139 → 145 | Latias ex, two Psychic, zero damage | [3,6] → [1,6] | Latias ex disappears; candidate promotes remaining VMAX; source gains two Prizes |
| 13 | 149 → 151 | Shadow Rider Calyrex VMAX, Float Stone, no Energy, zero damage | [1,6] → [0,6] | Active VMAX disappears; source takes its final available Prize |

The final observed Prize delta is one because the source had only one Prize card remaining. It does not imply that a VMAX is a one-Prize knockout. These public transitions establish actual native settlement and Prize movement; the archive does **not** separately measure the computed damage integer or exhaustively audit every possible paper-rule modifier.

At 152 Store roots the Crispin branch reported `finished=true, prizesRemaining=[0,6]`. The same physical-deal, four-category-search, equipped-Garbodor comparison **without Crispin** reported `finished=false, actions=200, prizesRemaining=[1,6]`. This difference is evidence of a possible paid attacking line and correlated subsequent game histories. It cannot be interpreted as a causal estimate of win probability: the original source-positive branch is retrospectively selected, scripted at a particular opportunity, and later turns are handled by inadequately qualified generic bots; re-search and game-state differences can also change shuffle and opponent behavior.


## Printed damage and the pinned attack reducer

Independently checked the supplied English card database printings: `Mega Absol ex MEG 86` has `Claw of Darkness` at **200 Darkness-type damage**, a **Darkness + Darkness + Colorless** Energy cost, and an additional opponent-hand reveal/discard effect. `Shadow Rider Calyrex VMAX CRE 75` has **320 HP** and Darkness **×2** Weakness; `Latias ex SSP 76` has **210 HP** and Darkness **×2** Weakness. On the clean Active targets explicitly recorded in this archive, the printed base damage under ordinary Weakness is therefore **400**, sufficient for either knockout before considering any further modifiers or damage prevention. This arithmetic is a **card-text/rules check**, separate from the native settled-Prize observations.

The [exact pinned Mega Absol ex reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-mega-evolution/mega-absol-ex.ts) implements the second attack using a `ChooseCardsPrompt` over the revealed opponent hand followed by `MOVE_CARDS` to discard a selected card. This is **source inspection** of the pinned engine and shows the intended attack-effect path. The v2 public transition artifact confirms attack settlement and Prize changes but does not itself enumerate those opponent-hand reveal/discard prompt outcomes, so that part of the attack remains outside this specific runtime witness.

## Artifact integrity and next falsification

[Artifact 12271920569](https://github.com/FlareZ123/experiment-01/actions/runs/39435658098/artifacts/12271920569):
ZIP SHA-256 `55694b7341e0ff772431b2045666c14da64fca8f0ef3ca9baaf75c3e4b566a1d`;
inner `rank8-secretbox-crispin-native.json` SHA-256 `518c87e47ce5e80f36b9be421af9fbb0b46744c1c113cc176edbbea9797697ad`.
An earlier [v1 compiled run](https://github.com/FlareZ123/experiment-01/actions/runs/39333708855), artifact 12225114142, verified the native Energy line and recorded three later Claw proposals, but did not preserve settled attack and Prize transitions. The new v2 evidence closes that specific gap.

The next useful work is an **actor-observation-safe, seed-independent opponent resource policy** that recognizes this opportunity, together with a comparably strong Hood response, in the canonical bilateral test. Retain all failures and both actual starting orders under an independently frozen schedule before making matchup claims. The existing [rank-8 prospective registration](rank8-hood-pressure-prospective-registration.md) can inform exposure denominators, but its original Boost Shake policy is distinct from the current scripted four-category Crispin tactic. A successful historical native win is **not** a qualified competitive win.

The repository field remains at **29/32 exact opposing 60s**, ranks 23/25/28 unverified, with **zero competitively qualified games**, and no demonstrated 99.5% fixed-deck solution.
