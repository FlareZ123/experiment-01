# Agent 17: authentic Store source-action and first bilateral reply packets

**19 October 2026 UTC. Evidence class:** retrospectively selected mechanical replays of already registered source-dealt games, excluding competitive win-rate denominators. No candidate promotion.

## Original immutable cohort and reason for targeted reexecution

Agent 41 [precommitted a 48-arm rank6/rank11 pilot](registrations/agent41-crossrank-r6-r11-v1-20261019.json). The original [24-arm partition 0](agent41-crossrank-partition0-exploratory.md) had four flagged source-opportunity arms, 13 engine terminals, 10 root-action caps, and one Store rejection. The [Agent 25 disposition](agent25-crossrank-partition0-disposition.md) and [Agent 6 disposition](agent6-crossrank-partition0-policy-disposition.md) already classified all outcomes. This follow-up reexecutes **only those four flags** on their originally registered seeds, to observe true Store-declared source attacks and candidate next-turn actions.

The replay is deliberately selected **after** learning source opportunities. It contributes zero fresh random trials, cannot estimate winning probabilities, and must not be pooled with the original prospective arms.

Reproducible sources:

- [Opt-in exact four-deal replay](../../simulation/evaluation/agent17-crossrank-trigger-replay.cjs), [Store actor/root-to-reply packet](../../simulation/evaluation/aichi-bilateral-reply-packet.cjs) and [8 synthetic/frozen-schedule tests](../../tests/aichi-bilateral-reply-packet.test.cjs).
- [Compiled manual CI 39202409151](https://github.com/FlareZ123/experiment-01/actions/runs/39202409151), **PASS**, at head `ae59609605749ad1ab756b2bffd4f0bf14df6fec`; artifact [12164178656](https://github.com/FlareZ123/experiment-01/actions/runs/39202409151/artifacts/12164178656).
- Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original campaign 260-action maximum, source rank6 Iron Thorns and rank11 Absol/Garbodor, reference Shadow Rider and New Moon English-proxy unchanged 60s, each original physical slot/seed.
- First manual run [39202248178](https://github.com/FlareZ123/experiment-01/actions/runs/39202248178) passed eight cheap tests but failed before replay because the source manifest stores compressed named/count card rows rather than 60 expanded entries. The fix reused the existing `planAichi` expansion. The second run completed.

## First actual Store attack and reply findings

| Retrospective archive arm | Source successful Store root | Next candidate turn and real logged attack | Later source-turn root | Scope |
| --- | --- | --- | --- | --- |
| `6:0:A:champion-reference` | global turn 2, ordinal **27**, `AttackAction Volt Cyclone`; same-root source attack **declared** | Global turn 3, first root Tapu Lele-GX, **Pale Moon-GX** genuine Store attack declaration ordinal **41** | global turn 4, Capture Energy root ordinal **45** | Bounded accepted attack and bilateral continuation |
| `6:0:A:new-moon-lockbreaker-v1` | global turn 2, ordinal **26**, real `Volt Cyclone` declaration | Global turn 3, Telepathic Psychic Energy first, **zero** candidate attack declarations that turn | global turn 4, Capture Energy root ordinal **37** | Same registered source seed/slot as above; different candidate |
| `6:2:A:new-moon-lockbreaker-v1` | global turn 3, ordinal **39**, real `Volt Cyclone` declaration | Global turn 4, Dusclops first, **zero** candidate attack declarations | global turn 5, Iron Thorns ex root ordinal **52** | Partner champion arm originally rejected a blocked action |
| `11:2:B:champion-reference` | global turn 2, ordinal **22**, genuine `PlayCardAction Boost Shake` | Global turn 3, Shadow Rider Calyrex VMAX first, **zero** candidate attack declarations | global turn 4, VS Seeker root ordinal **41** | An accepted Item; the original archive independently recorded next-turn equipped Garbodor |

All four retrospectively observed games report an engine terminal, without any new gameplay qualification. **Three source Volt Cyclones are now genuine attack declarations, whereas the rank11 Boost Shake is explicitly an accepted Item and must never be mislabeled as an attack.** The source action and the later candidate first/root attack are actor-bound to complete ordinalled Store events rather than a selective decision trace.

This evidence reveals a concrete rank6 response-policy asymmetry: the reference candidate actually declared Pale Moon-GX on the first turn after Volt Cyclone, while the New Moon first reply attached Telepathic Psychic Energy and did not declare an attack. It does **not** show that the fixed 60 difference caused the behavior, that the source attack's printed damage was applied correctly, or that either response was strategically optimal. It may motivate owner-visible decision-policy development on fresh prospectively registered deals.

## Scope of new read-only instrumentation

The additive [public-attack observer](../../simulation/twinleaf/headless.cjs) is **opt-in** and records face-up board snapshots immediately before and after actual Store actions that logged an attack declaration. The archive packet validates those snapshots against the root/declaration actor, preserves whether a prompt remains pending, and keeps `sourceEffectVerified:false` even when damage counters change. It never exports hidden hand, facedown deck order or Prize identities. **This public-delta extension requires separate compiled verification** from the baseline root-to-reply run cited above.

Read-only root snapshots cannot establish all prompt-resolved printed attack effects, correct rules semantics, game-clock outcomes, information-set-safe policy decisions, or human-grade bilateral play. Do not interpret a 6-Prize engine deck-out victory as defeating the source lock on merits.

## Decision

Do **not** advance either 60 on this evidence. The original 24 arms remain intact. The next useful target is independent verification of the immediate public attack delta and candidate reply on these four diagnostic seeds, then a **separately precommitted fresh-seed owner-information-safe bilateral policy** against both different hard archetypes. The already completed 64-arm rank11 narrow v1 zero-opportunity study needs no repeat.

**Full Aichi source field: 29/32 exact 60s (ranks 23/25/28 missing); competitively qualified games: zero; 99.5% target unproven.**
