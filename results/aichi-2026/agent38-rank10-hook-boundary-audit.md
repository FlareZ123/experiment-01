# Agent 38: archived rank-10 hook-boundary cross-instrumentation audit

**17 October 2026, UTC. Status: source-linked partial-State diagnostic verified locally against a real archived run. Competitive qualification: false.**

## Source provenance

I downloaded and inspected the two separate artifacts from compiled manual [rank-10 CI 38992559596](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596), head `f5813f2bd4ef9c98e3cfab26b3a176e20600764e`:

- [Actual complete root-Store source transcript](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596/artifacts/12085698259), artifact `12085698259`, JSON `rank10-source-branch-live-dispatch.json`.
- [Independent partial-State continuity report](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596/artifacts/12085409598), artifact `12085409598`, JSON `source-state-continuity-rank10.json`.

These cover the same source-dealt rank-10 Regidrago vs rank-1 Shadow Rider **physical B** control at seed `4246551499`. The source recorder contains 350 root dispatches. The corrected-clone continuity observer independently reports 350 dispatches, five gaps and zero detected root policy-time mutations.

## Verified alignment

The [pure, fail-closed audit](../../simulation/twinleaf/rank10-hook-boundary-attribution.cjs) matches each continuity gap's **previous-after and next-before SHA-256 hashes** to the corresponding two *independently recorded* physical Store action entries. It additionally checks action adjacency, exact prompt selection and the named first mismatch.

| Root actions | Source evidence | Partial-State gap | Scoped attribution |
| --- | --- | --- | --- |
| 88 → 89 | Next action `PassTurnAction` | Previous attack count 1 → 0 | Pass hook clears history before inner dispatch |
| 177 → 178 | Genuine `ChooseAttackPrompt` id 109 selected `Koraidon ex TEF` attack index 1, `Kaiser Tackle`; next is `WaitPrompt` | `Kaiser Tackle` → `Apex Dragon` | Copy-history hook restores printed attack after inner prompt dispatch |
| 205 → 206 | Genuine `ChooseAttackPrompt` id 128 selected the same source and attack; next is `WaitPrompt` | `Kaiser Tackle` → `Apex Dragon` | Same post-dispatch restoration |
| 215 → 216 | Next action `PassTurnAction` | Previous attack count 2 → 1 | Pass hook clears a stale entry |
| 221 → 222 | Next action `PassTurnAction` | Previous attack count 1 → 0 | Pass hook clears a stale entry |

**Result:** Running the audited archived JSON inputs through `node simulation/twinleaf/rank10-hook-boundary-attribution.cjs <source-json> <continuity-json>` returned five attributed records, with three pass clears and two copied-attack restorations. Four pure regression tests passed locally using Node 22; they reject altered hashes, different prompt classes/payloads, changed timing, additional gaps, Card-history mutations, unexpected policy mutation records and invalid competitive labels.

An initial synthetic fixture incorrectly included `previousAction` in each continuity gap. The real archived gap schema lacks that field; the audit was corrected to derive the previous action exclusively from the separately archived source dispatch. This is why an actual artifact cross-check was necessary.

## Meaning and limitations

This supports **one narrow source-dealt causal timing explanation**, consistent with the code in `last-attack-pass-hook.cjs` and `copycat-declared-history-hook.cjs`, rather than an inference of five unexplained Simulator leaks. The observer compares its documented partial State, and the two JSON artifacts derive from the same seeded engine. Closure captures, full post-hook root State, reducer correctness, nondeterministic IDs, hidden-information policy competence, both starting orders and independent game samples are outside this check.

The source recorder's newer full Store-graph assertion is currently blocked in separate manual CI runs by a changing runtime identifier. This audit uses the earlier internally consistent archived pair. It **does not upgrade** `sourceReplayMechanicsVerified:false` or `qualifiedForCompetitiveInference:false`. Zero competitive outcomes have been certified; the 99.5% target remains unproven.

The script and [falsification tests](../../tests/rank10-hook-boundary-attribution.test.cjs) are wired into the existing *manual* `aichi-dispatch-transcript.yml` workflow, with no push trigger. A new compiled run on the latest research revision is needed when the ongoing Store-graph nondeterminism is reconciled.
