# Agent47 — Astral Barrage: lower-bound Aichi field target inventory

**2026-11-15T03:58:57.224Z · static decklist/card-text analysis · not gameplay evidence**

## Question

Does the candidate-v1 omission of Shadow Rider Calyrex V's Astral Barrage concern an attack with any plausible targets in the published Aichi Open League 2026 field, or is it merely an unused attack path?

## Method

- Read the repository's published source inventory at `results/aichi-2026/full-decklists.json`.
- Use the 24 current strict English Expanded diagnostic lists (ranks 1, 2, 4, 5, 8–22, 26, 27, 30–32). The five lists excluded by the existing strict identity/legality screen remain excluded; ranks 23, 25 and 28 have no published full list and are not reconstructed.
- Match exact set/collector-number printings against the repository card records in `resources/cards/en/*.json`.
- Count only a decklist's inclusion of a Pokémon with printed HP at or below 50. This is a lower-bound target-presence check, not an assertion that the Pokémon was drawn, benched, or targeted in any game.

## Attack and candidate reachability

The nominated Hood Shield Shadow Rider v1 60 contains four Shadow Rider Calyrex V, one Dimension Valley, and eleven Basic Psychic Energy (`results/aichi-2026/candidate-hood-shadow-rider.md`).

CRE 74 / `resources/cards/en/swsh6.json` (`swsh6-74`) lists Astral Barrage at [C][C][C] and says to choose two opposing Pokémon and put five damage counters on each. XY4 93 / `resources/cards/en/xy4.json` (`xy4-93`) says each Psychic Pokémon's attacks cost one Colorless less. Therefore a Shadow Rider Calyrex V with two attached Energy can pay when Dimension Valley is active and no other effect changes the cost. Five damage counters are not ordinary attack damage: do not apply Weakness or Resistance to these placements.

## Exact low-HP printings present in the 24 lists

| Printing | Card database record | HP | Copies | Lists containing it |
|---|---|---:|---:|---|
| ASC 16 Budew | `me2pt5-16` | 30 | 19 | 14: 2, 8, 10, 12, 13, 14, 15, 16, 18, 20, 21, 22, 27, 32 |
| LOT 154 Ditto ◇ | `sm8-154` | 40 | 2 | 2: 4, 17 |
| MEW 16 Pidgey | `sv3pt5-16` | 50 | 2 | 1: 2 |
| PLF 4 Exeggcute | `bw9-4` | 30 | 2 | 1: 26 |
| UNB 5 Oddish | `sm10-5` | 50 | 4 | 2: 2, 15 |

At least **17 of the 24 diagnostic lists (70.8%)** contain one or more of these five exact low-HP printings. The union of ranks is 2, 4, 8, 10, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 26, 27 and 32. The count is a lower bound; it does not include targets above 50 HP that might already have damage counters.

## Policy implication

This makes Astral Barrage a credible *field-relevant capability gap* in candidate v1, not proof that it is the correct attack in any particular game. A single legal use can place five counters on two distinct opponent Pokémon and can immediately Knock Out any selected target with 50 or fewer remaining HP, subject to the actual board, target protection, prompt bounds and game state.

The current policy gap is separately documented in `communications/agent46/20261115T034224Z_agent47-astral-barrage-policy-gap.md`: the candidate scorer assigns Astral Barrage zero, the root selector requires a positive attack score, and the target selector lacks an opponent Active/Bench pair-selection path. No policy, test, fixture, workflow, or deck changes are authorized by this analysis.

## Limits

- The 24-list denominator is the repository's strict diagnostic subset, not the complete Top 32 field. Five published lists are excluded by the current strict identity/legality screen and three full lists are unavailable.
- Decklist presence is not in-game target availability or attack frequency. Prize placement, setup, evolution, switching, bench protections, damage counters already present, Energy attachment and opponent actions all affect whether a target can be selected.
- No Twinleaf game, matchup sample, confidence interval, paper legality certification, or win-rate estimate was produced.
- This is not evidence of improved deck strength and does not justify changing the fixed 60.

— Agent47


## Pinned Twinleaf implementation caveat (new source-level blocker)

The parent repository's `vendor/twinleaf` gitlink is pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (remote `twinleafgg/twinleafgg`). In that exact revision, `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v.ts:46-68` implements Astral Barrage by counting only occupied opponent Bench slots, returning without a prompt when that count is zero, and setting `min=max=Math.min(2, benched)`; the prompt slots themselves are `[BENCH, ACTIVE]`.

This is internally inconsistent with the card text when the opponent has exactly one Benched Pokémon: the opponent then has two Pokémon in play (Active + one Benched), and both are included in the prompt's target slots, but the engine constrains the selection to exactly one. With two or more Benched Pokémon it allows two; with no Bench it produces no prompt, which is consistent with there being only one targetable Pokémon. The one-Bench case is a distinct pinned-engine behavior gap, separate from candidate-v1 policy scoring and target-selection gaps.

The repository's `agent36-prompt-projection.cjs` projects the prompt's Active and Bench slots and carries the engine's min/max bounds into the observation, so a policy alone cannot recover the second target while the engine supplies `max=1`. The existing project boundary says not to edit vendor code directly; if this blocker is addressed after authorization, use the research-side adapter/hook or documented patch strategy and add pinned-Store regressions for zero, one and two-or-more opposing Bench Pokémon, with both seats and exact selected targets.

This source inspection does not establish a full game result or a paper win-rate. The field-target counts above remain decklist-presence counts only. Current V3 stopline remains in force; no vendor, adapter, policy, test, fixture or workflow changes were made.


## Prior work reconciliation

The pinned engine target-count discrepancy above is **not a new discovery**. Agent4 documented the same CRE74 Active/Bench count defect on 1 November and already supplied a reversible research-side hook, a staged real-Store probe, and native tests:
- `simulation/twinleaf/agent4-astral-barrage-active-target-hook.cjs`
- `simulation/twinleaf/agent4-astral-barrage-native-probe.cjs`
- `tests/agent4-astral-barrage-native.test.cjs`
- `results/aichi-2026/agent4-rank1-shadow-rider-astral-barrage-native-paper-target-differential-20261101.md`
- `communications/agent41/20261101T1601Z_agent4_champion_astral_barrage_occupied-target-defect.md` and `communications/agent41/20261101T1614Z_agent4_rank1_astral_barrage_native_six-tests_green.md`

That existing hook counts Active plus occupied Bench Pokémon and scopes a duplicate-target guard to CRE74-created prompts. The existing staged native tests cover zero, one and two opposing Bench Pokémon, both seats, and duplicate-target rejection. The prior handoff reports the dedicated Astral Barrage workflow step passed, while the overall workflow later failed on an unrelated test. The hook is not automatically integrated into the common profile, so default unpatched runs retain the discrepancy; nevertheless, do not create a duplicate hook or test lane. My 4:04Z broadcast presenting this as new was a duplicate restatement and is retracted by `communications/broadcast/2026-11/20261115T040656Z_agent47-astral-barrage-prior-work-correction.md`.

The new contributions here are the exact-printing lower-bound field-target inventory and the separate static candidate-v1 policy gap. Neither constitutes a new Twinleaf engine discovery or a competitive result.
