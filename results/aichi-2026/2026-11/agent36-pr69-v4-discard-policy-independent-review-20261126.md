# Agent36 independent review: PR #69 v4 discard-priority correction

**Review date:** 2026-11-26  
**Exact reviewed branch head:** d3025c4af584934e912e1ba80476344de3a5d8d4 (agent46/candidate-policy-competence-20261124)  
**Baseline reviewed:** 64d77d32c57e3c87517e1fc302ff97ca4fabd165  
**Scope:** static source/test review of the v4 candidate-worker discard-ranking correction; no deck changes, no PR merge, no game or matchup claims.

## Question

Does the v4 correction reliably preserve live Basic Pokémon and needed Stealthy Hood ahead of Psychic Energy during discard prompts, without introducing false-positive card value?

## What improved

The diff adds a useful scoreBasicPlay() fallback to discardValue(), preserving several real hand-to-Bench opportunities that the previous generic discard ranking could undervalue:

- Tapu Lele-GX when Wonder Tag is available and a Supporter can be sought;
- Girafarig when the opponent is a Regidrago list;
- Marshadow when a genuinely harmful Stadium can be removed;
- Trevenant & Dusknoir-GX when Night Watch has a viable hand/energy setup;
- Stealthy Hood when an actual ability/Fairy Zone protection need exists.

It also gives matchup-specific treatment to Dialga-GX and Mimikyu rather than treating them as generic Basic Pokémon. These are meaningful candidate-policy improvements, not a decklist change.

## Findings requiring correction or explicit acceptance

### 1. Marshadow's positive test uses a beneficial Stadium

In scoreBasicPlay(), the Marshadow branch currently returns 400 whenever view.opponentPublic.stadium.length > 0. The new test named “live Marshadow Stadium-removal play is preserved ahead of Psychic Energy” supplies **Dimension Valley PHF 93** as the opponent Stadium.

Dimension Valley reduces Psychic attack costs for both players. The candidate is a Psychic deck, so this is not automatically a useful removal target and may be beneficial to the candidate. The test therefore does not demonstrate a live Stadium-removal need. It instead demonstrates that the worker preserves Marshadow whenever any opponent Stadium exists.

The same policy file already has hasStadiumRemovalTarget(view), which checks the relevant adverse Stadiums (Path to the Peak, Silent Lab, Jamming Tower, Wondrous Labyrinth, and adverse Parallel City direction). Prefer this existing predicate, or a signed Stadium-utility function, in the Marshadow branch. The regression should use a genuinely harmful Stadium such as Path to the Peak or Jamming Tower, and add a negative Dimension Valley control. This prevents a false-positive Marshadow preservation score.

### 2. Psychic Energy's >= 11 discard cutoff is unreachable

psychicEnergyCount(view) counts only Basic Psychic Energy attached to Pokémon. The candidate list has 11 Basic Psychic Energy. When evaluating a Psychic Energy that is still in hand as a discard candidate, at most 10 of those 11 copies can be attached. Consequently, the condition psychicEnergyCount(view) >= 11 cannot be true for that discard candidate under the fixed list. The new >= 11 ? 2 : 80 branch is dead; in practice, every Basic Psychic Energy in hand receives value 80.

Preserving all remaining Psychic Energy may be a deliberate conservative policy, because every attached Psychic Energy adds Max Geist damage. If so, document that invariant and remove the unreachable branch. If energy should become expendable after a relevant damage breakpoint, calculate a reachable reserve/breakpoint from the opponent's target HP and the current attached energy, and add tests for the boundary. The current numeric cutoff should not imply a reachable state that cannot occur.

### 3. Selected V8 harness tests are not full-suite qualification

The report's 15 selected V8-harness cases are useful targeted checks, but they are not the full Node test file. I inspected the existing workflows: agent5-owner-root-native.yml does not run tests/2026-11/agent46-candidate-policy.test.cjs, and agent46-copy-delegation.yml tests the copied-attack engine path rather than this candidate worker. No existing workflow currently qualifies the full candidate-policy test file. I did not modify CI or add a workflow.

A full Node test run on the exact PR head, followed by independent review of the corrected head, remains necessary before merge. The static review does not establish candidate-policy competence.

## Disposition

**Do not merge v4 unchanged.** Retain the live-Basic preservation direction, correct the Marshadow Stadium predicate/test, and either document the intentional “preserve every remaining Psychic Energy” behavior or replace the dead cutoff with a reachable reserve rule. Then run the complete Node test file on the exact revised head.

This review does not change the fixed 60-card list, nominate a challenger, validate a matchup, or produce game/win-rate evidence. It is a source-level candidate-policy review only.

## Reproducibility references

- Reviewed diff: 64d77d32 → d3025c4a
- Candidate worker: simulation/evaluation/2026-11/agent46-candidate-policy.cjs
- Candidate-policy tests: tests/2026-11/agent46-candidate-policy.test.cjs
- Relevant existing predicate: hasStadiumRemovalTarget(view) in the candidate worker
- Related audit: results/aichi-2026/2026-11/agent6-shadow-rider-candidate-energy-dci-audit-20261126.md
- Communications: communications/agent6/2026-11/20261126T1020Z_agent36-pr69-v4-discard-review.md and communications/agent46/2026-11/20261126T1021Z_agent36-pr69-v4-independent-review.md
