# Rank26 firstturn Dowsing hold: source-conserved whole-action choice

**Agent 4, 19 October 2026. Registered before execution.**

## Prior compiled evidence and targeted failure

The [validated source Quick Ball cost choice](rank26-quick-ball-discard-source.md) (CI 39207882769) had an actual firstturn owner-hand decision to discard `Iono PAL` instead of singleton `Dowsing Machine PLS` for Quick Ball. Both branches subsequently searched for and played Meloetta ex. The generic source bot then immediately played the retained Dowsing Machine, discarded Bicycle and Order Pad and retrieved Iono, passing without an attack or Prize decrease. The narrow new question is whether a **downstream PlayTrainerTactic veto** can preserve the ACE SPEC and those two Items in this specific real-source opening while allowing the bot's other tactics to proceed.

## Registered experiment

Use the **same four previously registered historically selected rank26-versus-rank6 source-seed/seat pairs**: 2046029502/A, 4158340325/A, 2818295704/B and 1839183531/A. No new seed search, deck substitution or input selection occurs. Each pair runs the original rank26 and rank6 printed 60s, actual source first, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source draw-log and opening assertions, identical `rank26-autonomous-cologne-pump-propagation-v3`, `Mail-starter-v2`, owner-deck Meloetta Quick Ball v1 and real-hand Iono Quick Ball cost v1. The variant alone adds [rank26-dowsing-hold.cjs](../../simulation/twinleaf/rank26-dowsing-hold.cjs), a reversible source-specific subclass of pinned `PlayTrainerTactic`.

When on the source first turn the tactic proposes to play Dowsing Machine while the source's own publicly discard-pile-visible `Iono` is present, suppress that proposal. All other tactics can still act; no Card, Zone or physical shuffle is modified and original tactic list is restored. This intentionally narrow guard may be strategically wrong in positions where recovering a useful Trainer immediately beats holding the ACE SPEC. It is a falsification of one known bad local continuation, not proof of an optimal Dowsing policy.

### Assertions and reported outcomes

Verify registered seed identity and actual source first-player draw, both source 60s and identical in-game deck hashes. Require each pair's firstturn trace to agree **through ordinal 25** before the previously seen Dowsing proposal, preserving initial Mail, Forest Seal Stone, Quick Ball cost, real Meloetta search and Bench placement. Require baseline seed 2046029502 to play Dowsing once during its first turn, the guarded variant to play it zero times, and at least one recorded blocked native Item tactic proposal. A failure means the positive control has drifted and must be investigated rather than replaced.

Archive all four original and guarded firstturn action sequences, veto counts and accepted native Store actions, root attacks, opposing Prize count, and any distinct later actions. Three historical no-op Quick Ball seeds stay in the denominator. **Even when Dowsing is held, no attack or win may be claimed without observed attack effect, opposing response and paper-clock qualification.** Outcomes remain non-prospective, and no generalizable win rate is estimated.

Execution: [rank26-dowsing-hold-source-pair.cjs](../../simulation/twinleaf/rank26-dowsing-hold-source-pair.cjs), pure [unit tests](../../tests/rank26-dowsing-hold.test.cjs), existing [manual Damage Pump CI](../../.github/workflows/aichi-damage-pump-fidelity.yml) with Boolean `rank26_dowsing_hold_probe`, archive `rank26-dowsing-hold-development-unqualified`.

Broader status unchanged: 29/32 exact Aichi Top32 60s, zero competitive-qualified games, no eligible 99.5% final candidate.


## Compiled outcome: authentic source ACE hold passed, with no attack

[Manual CI 39208852419](https://github.com/FlareZ123/experiment-01/actions/runs/39208852419) **passed** with pinned compiled Twinleaf, real first-player draw-log, fixed original 60-card hashes, pure veto tests, live Store and matching root prefixes. Full four-case JSON: [artifact 12166837088](https://github.com/FlareZ123/experiment-01/actions/runs/39208852419/artifacts/12166837088), `rank26-dowsing-hold-development-unqualified`.

On the one qualifying historic source seed, `2046029502/A`, control firstturn played Dowsing Machine at root ordinal **26**, discarded **Bicycle + Order Pad**, retrieved previously discarded **Iono**, then passed. The opt-in source-only `PlayTrainerTactic` veto suppressed exactly **one real Dowsing proposal**, leaving the same prefix intact through Float Stone at ordinal 25, then passed at ordinal 26 without spending ACE SPEC or those two Trainers. Three other pre-registered historical source deals had no qualifying veto.

Four-case summary: **original firstturn Dowsing plays 1; guarded 0; real vetoes 1; guarded root attacks 0; opponent Prize decreases 0**. The narrow resource hold happened as expected, yet attacker conversion and whole-game superiority remain unproven. This retrospective source-development cohort contributes **zero** qualified game outcomes and no prospective effectiveness estimate. The guard is a heuristic that may be wrong if Dowsing would recover a more valuable immediate target. The project remains **29/32 exact source lists, zero competitively qualified games, no final 99.5%-qualified list**.
