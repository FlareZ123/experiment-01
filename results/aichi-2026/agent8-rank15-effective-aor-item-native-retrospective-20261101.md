# Effective AOR Vileplume Item-play veto: exact original-rank15 retrospective replay

**Agent 8, 1 November 2026 | same original seeds, new postobserved policy treatment, no competitive qualification**

## Executive finding

A pinned-native, effective-Ability-sensitive Item legality filter in the **both-seat canonical Fog Crystal action path** changed the original 16 paired rank15 developmental games as follows:

| Category | Original baseline with public movement receipt | New native-effective AOR Item filter |
| --- | ---: | ---: |
| Engine-terminal | 10 | 12 |
| Native root-cap unfinished | 2 | 4 |
| Native Store `CANNOT_PLAY_THIS_CARD` abort | **4** | **0** |
| Source-deal fingerprint matches within 16 pairs | 16 | 16 |
| Accepted coin, chooser and first-draw certified pairs | 16 | 16 |
| Competitively qualified games | **0** | **0** |

The filter recorded **40 actual native-effective AOR Item vetoes** across the four formerly aborted treatment games, all from the actor Fog Crystal handler. It recorded **zero native errors, 40 skipped Fog Crystal root offers, and zero generic Item-tactic rejections**. No general win-rate, paper legality, source-policy quality, or 99.5% claim follows.

## Four previously fatal roots, now actual accepted native alternatives

The prior control Store's rejected `Fog Crystal CRE` `PlayCardAction` and the new treatment's *accepted alternative root* occupy the **same global turn and action ordinal** on each original ID. Each observed unchanged original source opening; the first divergence is the attempted prohibited Item versus the alternate root.

| Original registered ID | Prior fatal turn/root | Native-effective-filter alternative at that root | New bounded status |
| --- | --- | --- | --- |
| `15:0:A:champion-reference` | turn 31 / ordinal 131 | `PassTurnAction` | engine terminal, candidate seat 0 winner |
| `15:0:A:new-moon-lockbreaker-v1` | turn 35 / ordinal 150 | `AttackAction: Motivate` | engine terminal, source seat 1 winner |
| `15:2:A:champion-reference` | turn 55 / ordinal 216 | `PassTurnAction` | unfinished at root cap |
| `15:2:A:new-moon-lockbreaker-v1` | turn 15 / ordinal 70 | `AttackAction: Motivate` | unfinished at root cap |

The two alternate **Motivate** attacks are direct evidence that the Item filter can expose an actual attack decision when Fog Crystal is prohibited. The two Pass roots reveal a still-weak decision policy. Both unfinished statuses remain **censored**, and the two terminal winner labels are **native simulation outcomes only**.

## Native preflight and suppression controls

The probe `simulation/twinleaf/agent8-aor-vileplume-item-preflight.cjs` inspects the owner's permitted public Pokémon positions for Vileplume AOR. If present, it clones the current native `Store.state` and invokes the exact pinned `IS_ABILITY_BLOCKED` predicate that the AOR Vileplume reducer itself uses before rejecting `PlayItemEffect`. The clone is discarded, and any temporary RNG override is restored before the real action.

The initial native test run [41341431384](https://github.com/FlareZ123/experiment-01/actions/runs/41341431384) confirmed **eight staged cases** with actual Store acceptance: seats 0/1 × (no Vileplume, opponent's Vileplume, own Vileplume, and Wobbuffet PHF actively suppressing Vileplume). All 8 preflight predictions matched Store dispatch, including the suppression negative control. These are synthetic legality fixtures, and do not represent legally completed real games. The detached check can reflect pinned engine assumptions that still require paper-rules verification.

The filter is **disabled by default** and only included when the research runner passes `actorNativeAorItemLock:true` into the actor-only composition. Its Fog handler suppresses a locked direct Item proposal without setting `itemUsed`, then delegates to the established actor root and native fallback. In addition, the generic tactic `isValidAction` path is guarded for effective AOR Item restriction, allowing the bot to examine subsequent tactics. This avoids a blanket Vileplume ban that would incorrectly reject Items if the Ability is suppressed. All hooks restore the original pinned engine methods at the end of the run. It does not cover every possible Item-lock effect in the paper Expanded universe.

## Provenance

- [Manual native retrospective replay 41342131631](https://github.com/FlareZ123/experiment-01/actions/runs/41342131631), artifact `13097448004`, archive `agent8-rank15-aor-effective-item-veto-retrospective`. Head SHA `c90914a60dbeb4b64eb376ac2b082e3625522b86`.
- Exact pinned upstream engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Original preregistration blob `e72eeb19e4a7157f4533fc1ad6337a090ef94695`, 16 original trial IDs and exact physical original rank15 60. The policy filter was designed **after** inspecting the original failures: this makes the new comparison explicitly **retrospective** and unsuitable for out-of-sample strength inference.
- Research-owned policy: `simulation/twinleaf/agent9-fog-actor-prompt.cjs`, opt-in predicate `simulation/twinleaf/agent8-aor-vileplume-item-preflight.cjs`, canonical composition `simulation/evaluation/agent7-canonical-actor-composition.cjs`, bilateral switch in `simulation/evaluation/agent41-bilateral-v2-development.cjs`.
- Reproduction driver `simulation/evaluation/agent8-rank15-effective-aor-item-replay.cjs`; manual workflow `.github/workflows/agent8-rank15-effective-aor-item-retrospective.yml`. Full original raw roots and setup proof remain in artifact, not only aggregate summaries.
- [Original exact failed card and setup report](agent8-rank15-fogcrystal-aor-itemlock-diagnostic-20261101.md).

## Interpretation and next work

**Verified improvement:** the actor filter avoided four independently witnessed illegal native Item plays without adding new simulation exceptions, and two recovered roots used an actual attack. **Unverified:** alternate roots' tactical strength, paper-legality completeness, prevention of other card-specific locks, 25-minute match behavior, benchmark field coverage, and win probability. The 2 additional root-capped games suggest that avoiding an abort alone is inadequate. A new, predeclared independent seed tranche is needed to test robustness and whether the blocker reveals useful attacks consistently. Broader effective Item lock mechanisms require a separate ontology; see [printed Item-lock taxonomy](../strategy/item-lock-printed-effect-taxonomy-agent8-20261101.md).
