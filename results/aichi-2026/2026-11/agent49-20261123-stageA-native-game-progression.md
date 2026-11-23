# Stage-A native-game progression: actor-only Underworld and Quick Ball fixes

**Author:** Agent49 · 2026-11-23 (normal research mode)  
**Scope:** paper Expanded research infrastructure, frozen registered Rank-1 fixture only; not a metagame strength result.

## Concrete accepted progression

| Accepted trial revision / GitHub Actions fixture | Candidate physical seat 0 | Candidate physical seat 1 |
|---|---|---|
| `2448d542`, run [45263456205](https://github.com/FlareZ123/experiment-01/actions/runs/45263456205) | 63 accepted actions; opponent abstained on Underworld Door `AttachEnergyPrompt` | 11 accepted actions; opponent root native failure |
| `85e2087a`, run [45266383646](https://github.com/FlareZ123/experiment-01/actions/runs/45266383646) | 63 accepted actions; `ERR_ASSERTION`, message length 85, at `AttachEnergyPrompt` | 21 accepted actions; native failure length 16 after Underworld Door `WaitPrompt` |
| `7fb4d039`, run [45269501931](https://github.com/FlareZ123/experiment-01/actions/runs/45269501931) | Same 63-action Underworld prompt assertion | 38 accepted actions; second Quick Ball `ChooseCardsPrompt` failed `PROMPT_SOURCE_PROVENANCE_MISSING` |
| **`c633afe8`**, run [45270701106](https://github.com/FlareZ123/experiment-01/actions/runs/45270701106) | Same 63-action Underworld prompt assertion | **Natural engine terminal**, candidate seat 1 won; 81/81 accepted actions across 17 turns |

The c633 terminal is `finished:true`, `endReason:engine-game-end`, `winnerSeat:1`, with zero role-worker abstentions/failures and zero policy RNG violations in that physical assignment. **It is not competitively qualified:** `competitiveGameQualified:false`, `admissionEligible:false`, and the reciprocal assignment did not finish. There is **no demonstrated win-rate estimate** from these diagnostic runs.

## Implemented remedies

1. Native cloned-Store Item frontier now applies explicit-false `canPlay` filters only for pinned, exact-printing Battle VIP Pass, VS Seeker, Unfair Stamp, Field Blower and Night Stretcher. Passive Dimension Valley use rejects the pinned `CANNOT_USE_STADIUM`. Agent30 contributed these patches; Agent49 integrated the matched accepted gates.
2. Agent49's opponent-role Underworld Door handler chooses exactly one actor-visible Basic Psychic Energy/Bench pair using typed `benchIndex`, never label parsing or hidden card data. This requires a matching closed prompt-protocol field and source-specific tests. The two-seat real Docker policy prompt audit passed at `7fb4d039`.
3. Agent30's exact `Shadow Rider Calyrex VMAX CRE` preflight excludes the Ability if no Bench or Basic Psychic in hand; its own pinned `WAS_POWER_USED` checks can otherwise throw after an asynchronous `WaitPrompt`.
4. Agent49's prompt-provenance hook propagates the originating card/effect via **host-only callback scope** across native continuation prompts (Quick Ball discard then search), restores nested effect precedence, and does not trust user-serializable `prompt.sourceCard`. Contracts and no-game witness passed at c633; the next fixture produced the first natural terminal.
5. The next accepted-branch revision `30877a95` additionally excludes an already-used Underworld Door marker for the same exact source and replaces the opaque driver audit assertion with typed fail-closed codes. Its gate/result must be inspected before inferring any impact.

## Remaining decisive blockers

- The candidate-seat-0 native `AttachEnergyPrompt` fails consistently at action ordinal 63, after 63 accepted actions, with sanitized `AssertionError` length 85. The host's `requirePolicyAudit` previously had an exactly 85-character assertion; **do not assume this is the origin without a typed repeat**. The production Docker worker returns the expected policy audit in a standalone two-seat prompt test. An exact-head tagged live fixture is the next discriminator.
- The original top-32 benchmark is *not* achieved: 29/32 exact opponent source lists are available; exact ranks 23/25/28 remain incomplete, and no 32-opponent paper-qualified performance distribution exists. Treat natural-terminal diagnostic wins separately from paper legality and competitive performance.
- Candidate, rank-1 opponent, frozen public seed, two-seat assignment, engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and trial registration were unchanged throughout this sequence.

**Relevant code:** `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`, `agent36-prompt-projection.cjs`, `agent36-prompt-provenance.cjs`, `agent6-rank1-shadow-rider-opponent-policy.cjs`, `agent36-v3-runner.cjs`; focused regressions under `tests/2026-11/`.

**No claim that this deck has a 99.5% win rate or that the single terminal is a qualified game.**

## Exact residual root: same-setup native clone decode mismatch (2026-11-23 21:53 UTC)

At frozen head `f8ee7891ea99374b0f9a6b0a36a45224b6d08f5c`, full [contract 45272799994](https://github.com/FlareZ123/experiment-01/actions/runs/45272799994) and [native witness 45273059092](https://github.com/FlareZ123/experiment-01/actions/runs/45273059092) **passed**. The unchanged [paired fixture 45273407207](https://github.com/FlareZ123/experiment-01/actions/runs/45273407207) confirms candidate seat1 again reaches a natural native terminal **winnerSeat 1, 81 accepted actions, 17 turns**; candidate seat0 stops after 63 accepted actions on ordinal63, opponent `Shadow Rider Calyrex VMAX CRE` `Underworld Door` `AttachEnergyPrompt`. This time the error is exactly **`PROMPT_CLONE_PROMPT_DECODE_ASSERTION`** (`stage:prompt-resolver-decode`), not the worker-policy audit. The typed stage label was added to `agent36-prompt-projection.cjs` `dispatchPromptChoice`.

**Tightly scoped next repair:** `projectAttachEnergyPrompt` has accepted a native choice via `validateRawPromptResult(prompt,rawResult,liveState)`; `dispatchPromptChoice` then re-registers detached prompts in `createIsolatedValidationPromptStore` and `validateRawPromptResult(clonedPrompt,rawResult,clonedState)` returns invalid. The pinned `AttachEnergyPrompt.decode` checks perspective player, card index, `Card` identity, `SuperType.ENERGY` and blocked index; `validate` checks count, target and type restrictions. Inspect which invariant loses equivalence across clone/re-registration and repair that exact contract, preserving no-op clone continuation, full original-state immutability, actor-only choices and mandatory clone validation. **Do not skip cloned validation** or treat this diagnostic one-off terminal as paper-qualified. The currently recorded runner still reports `competitiveGameQualified:false` and `admissionEligible:false`.


## Agent4 trace conversion review (2026-11-23)

The successful candidate-seat-1 terminal in run [45273407207](https://github.com/FlareZ123/experiment-01/actions/runs/45273407207) is analyzed in [Agent4's Max Geist conversion review](agent4-max-geist-conversion-review-20261123.md). It records 3 Psychic Energy on Active VMAX plus 2 on the Bench, 160 Max Geist damage on turns 15 and 17, and the final three-Prize knockout after 60 prior damage. No Underworld Door completed in that terminal seat; the reciprocal seat's Door prompt failed before dispatch. The artifact remains fixture-only, actor-only boundary invalid, and competitively unqualified.
