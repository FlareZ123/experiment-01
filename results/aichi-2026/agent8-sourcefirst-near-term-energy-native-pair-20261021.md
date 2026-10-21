# Source-first rank-11 owner Energy staging comparison

**Agent 8 | 21 October 2026 | retrospective, same-checkout native development comparison | competitive qualification: none**

## Fixed question and provenance

The existing [source-first recipient result](agent45-canonical-sourcefirst-recipient-native-negative-20261021.md) reports a genuine New Moon turn-22 owner attachment of `Psychic Energy MEE` to newly Active `Galarian Articuno V CRE`. Printed `Psyray` remains two ordinary Basic attachments short *after* that action. Source Oranguru V's `Psychic` attack continues through source turns 23, 25 and 27 and eventually takes two Prizes from Articuno. The physically matched source Deal SHA-256 is `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, historical seed `482443328`, physical source seat 0 / candidate seat 1.

The existing post-choice public board at candidate turn 20 additionally exposes a zero-Energy Bench `Gengar & Mimikyu-GX TEU`, whose printed non-GX `Poltergeist` requires two Psychic Energy; two Duskull's accessible `Future Sight` does zero printed damage. The candidate owner held `Escape Rope BST` in the observed turn-20 hand, with the same Item still present in the observed turn-24 hand. The 21 October Critic requested a falsifiable, owner-visible decision alternative on this exact physical state, with native source continuation.

The **experimental hypothesis** is narrow: prefer a Bench damaging attack with at most one ordinary attachment short *after* this attachment, over an Active whose nearest positive printed damage attack still needs at least two, but only if the owner visibly holds a `Switch` or `Escape Rope` Item and Item play is not currently locked. This uses an available future promotion route without claiming the promotion will be chosen, legal in all continuous effects, or beneficial. A strictly positive native printed base damage is a necessary screen, which avoids treating Duskull's zero-damage `Future Sight` as a near-term damaging alternative. The actual attack effect (such as Poltergeist's opponent-hand-dependent damage), threat geometry, and full Store legality are unmodeled.

## Implementation and planned contrast

Research-owned files on isolated branch `agent8-near-term-damage-recipient-20261021`:

- `simulation/twinleaf/agent44-actor-energy-recipient.cjs`: preserve default Active-first comparator, opt in `preferNearTermDamage`.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`: option and independent audit version `agent8-owner-visible-near-term-damage-v1`; reject near-term flag unless the existing recipient frontier is on.
- `tests/agent8-near-term-damage-recipient.test.cjs`: source-first turn-22 printed-cost synthetic analogue, no-op safety cases, and opponent-hidden noninterference.
- `scripts/agent8-near-term-damage-native-paircheck.cjs`: compare all four retrospective source-first trials by immutable trial metadata, source physical Deal fingerprints, actual first actor and source continuation; require a physically accepted, correct owner choice change at rank11 New Moon turn22.

The **existing manually dispatched canonical workflow** compiles pinned Twinleaf once, runs the unchanged registered four historical source-first fixtures with the experimental scorer, then runs the identical four fixtures in the same job with this scorer explicitly disabled. The same owner Basic Energy recipient mode and other actor-only policy flags remain enabled. The shared manual workflow's 25-input limit is preserved; on this isolated branch only, setting `source_first_retrospective=true` and `actor_energy_recipient=true` runs the pair. The original default on main stays unchanged. Existing source-first source-attack, one-epoch, paper Supporter, Cologne and paper-clock caveats all remain in force.

**Pre-result expectation:** a genuine T22 `Psychic Energy` attachment should target Gengar's Bench slot rather than Articuno's Active, provided native public printed attack damage agrees with the deliberately narrow positive-damage screen. This is a prediction to falsify, not a reported native success. A changed attachment alone will be recorded as a selected resource decision; only actual settled damaging attacks and opponent replies could support greater progress. Outcomes, errors, and censored arms remain visible. The decision can change without improving the match.

Manual same-head CI requested 21 October at [run 39654706241](https://github.com/FlareZ123/experiment-01/actions/runs/39654706241), branch head `005ea2b02842cd8417561d74b6603c62ba8cf614`. **Outcome pending at preparation of this note.** No performance or 99.5%-rate claim.


## Executed pinned native result and negative progress finding

The same-checkout compiled CI [39654706241](https://github.com/FlareZ123/experiment-01/actions/runs/39654706241) checked out `005ea2b02842cd8417561d74b6603c62ba8cf614`. The five new pure tests, both full source-first execution steps, strict source-first 4/4 audit, the paired T22 Store decision check, and artifact upload **all passed**. The overall workflow status is **failure** because its unchanged original candidate-first rank-6 epoch-sensitive four-arm integrity gate remains red. The source-first comparison is independently executed and archived; the overall workflow failure is explicitly preserved.

[Native paired artifact 12372360109](https://github.com/FlareZ123/experiment-01/actions/runs/39654706241/artifacts/12372360109), ZIP SHA-256 `6c7fd003b9c69f236baa584b1d29e1ef24b13c3ed3ca2eb9d2104a6c45b2e284`, contains both complete four-trial JSON packets and the fail-closed paircheck. Every control/treatment pair matches source deal fingerprint and physical first-player identity. No unarchived arm is excluded.

**The specific native T22 counterfactual was demonstrated.** From the same genuine owner hand index 9, the control accepted `Psychic Energy MEE` on Active Articuno for `Psyray`, printed cost gap 3 → 2. Treatment accepted that exact printing on Benched Gengar & Mimikyu-GX at Bench index 3, for `Poltergeist`, printed gap 2 → 1. Both had `accepted:true` and `nativePhysicalEffect:'confirmed-public-effect'`, with actual public Energy-zone changes. This is one authentic, owner-information-safe, versioned policy divergence. Neither branch attacked with Gengar or Articuno afterward.

**The comparison did not improve offense or game result.** All four attempts remain unqualified development games:

| Frozen source/candidate | Control / treatment root actions | Control / treatment printed attack declarations, source then candidate | Final Prizes, both | Winner, both |
| --- | ---: | --- | --- | --- |
| Rank 6 Iron Thorns / champion | 93 / 93 | 0+4 / 0+4 | [6,2] | candidate seat 1 |
| Rank 6 Iron Thorns / New Moon | 223 / 223 | 6+0 / 6+0 | [0,6] | source seat 0 |
| Rank 11 Absol/Garbodor / champion | 89 / 89 | 0+4 / 0+4 | [6,1] | candidate seat 1 |
| Rank 11 Absol/Garbodor / New Moon | **224 / 228** | **16+2 / 17+2** | **[0,6]** | **source seat 0** |

The rank-11 New Moon source attack/root sequence on turns 23/25/27 was **exactly unchanged**: owner Basic Darkness attachment and printed `Psychic` attack at T23, `Psychic` at T25, Mega Absol ex bench play and `Psychic` at T27. On candidate T24 and T26, **both branches passed**, despite treatment staging one Basic Psychic on Gengar. Both branches later made zero new candidate printed attack declarations (only the prior two Moon Press attacks remain), while the source attacked once more in treatment on turn 51 rather than ending on turn 49. No improvement can be credited to the resource staging, and an additional source attack is adverse as evidence of practical policy quality, though not an independent game sample.

The actual common actor-only root has no routine to *play* owner-held `Escape Rope` / `Switch`, fund an insufficient-energy Benched attacker through a search or Energy recovery plan, or choose a safe promotion as a sequenced tactic. Thus a one-attachment shortcut is insufficient to make Poltergeist available on this native line. The narrower, actionable common-policy problem is resource-to-attacker transition and viable movement under source pressure. Do not repeat this exact scorer contrast as an expected competitive gain; use it as a regression and test an owner-safe multi-action promotion/funding decision with a pre-registered native source continuation if one can be justified.

**Evidence status:** selected historical deals, 29/32 recovered source opponents, **zero competitively qualified games**, no demonstrated 99.5% win-rate fixed 60.
