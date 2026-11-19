# Rank-5 Mew / Genesect opponent policy — v3

**Author:** Agent20  
**Frozen:** 2026-11-19T13:56Z  
**Status:** diagnostic-only; not executed, not natively validated, not production-registered

## Scope and source binding

This work implements a deterministic actor-view-only opponent policy for the exact Aichi Open League 2026 rank-5 Yamato Nakano Mew / Genesect list. It does not modify that 60-card list or the Hood Shield v1 candidate.

- Source list: `results/aichi-2026/full-decklists.json`, roster blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Printed-60 SHA-256: `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`.
- Candidate: `results/aichi-2026/candidate-hood-shadow-rider.json`, fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`.
- Twinleaf submodule: `vendor/twinleaf`, pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No upstream or submodule files were changed.

The source list contains four Mew V, three Mew VMAX, four Genesect V, four Double Colorless Energy, and zero Basic Energy. This constrains standalone attack payment: the policy does not infer Psychic or Metal costs from DCE.

## Implementation

Entrypoint: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`

Policy version: `agent20-rank5-mew-genesect-opponent-v3`

The policy uses the Agent49 V3 request/decision protocol and returns only validated frontier tokens. It is deterministic, actor-seat-relative, and has no hidden-state fallback.

Implemented decision families:

1. Build Mew V and Genesect V board presence; evolve Mew V naturally or use Wally only for a same-turn Mew V.
2. Use Fusion Strike System only when hand size is below the visible Fusion Strike Pokémon count.
3. Attach DCE to Mew VMAX for Cross Fusion Strike; prefer a Benched Genesect Techno Blast donor when offered.
4. Handle copied Energy Mix as a Cross Fusion Strike choice, selecting DCE and a Fusion Strike target. Standalone typed-cost attacks are not assumed payable.
5. Recover two DCE with Special Charge; protect the last Mew VMAX and scarce DCE during discard-cost prompts.
6. Sequence own draw abilities before Path to the Peak, which suppresses Rule Box abilities on both sides.
7. Select Guzma targets using visible remaining HP, Prize liability, and a conservative damage estimate: 210 Techno Blast damage, plus 20 only when Muscle Band is visibly attached to the active Mew VMAX.
8. Enforce distinct supporter / item / tool / stadium categories for Secret Box. If the required actor-visible category metadata is absent, abstain.
9. Unknown prompt families abstain. No decision is made from opponent hidden hand, deck, or Prize identities.

The policy remains a heuristic decision layer, not a complete strategic player. In particular, unsupported prompts and ambiguous public metadata intentionally produce abstentions.

## Tests and challenge suite

Test source: `tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

- 26 Node tests are authored and import the existing Agent49 protocol validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- **Execution status: not run.** This invocation had no local repository checkout, and the Critic direction prohibited adding or dispatching a CI workflow. Do not interpret authored tests as passing tests.

Frozen challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v3.json`

- 19 development cases and 5 reserved held-out review cases.
- 24 scenarios are explicitly marked blocked; exact runtime actor-view digests, native acceptance receipts, and native traces are absent.
- All scenarios are synthetic. No game was run and no random seed was generated.
- The held-out cases include prize-conversion under actual 210 damage, Path-to-the-Peak future-draw self-lock, Energy Mix with no DCE available, missing Secret Box category metadata, and seat-one owner-relative prompt routing.

## Hash-bound artifacts

| Artifact | SHA-256 |
|---|---|
| Policy module | `0a9e72e8dd62b2a931d62971070b4856c2763cb4469cb4ae3be8ded33d32f82b` |
| Test file | `17a2335a2f4ee1a930c68fa3146d08aa877895e0fb2eb8df9a2d33b0d63696ec` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v3 | `36893b2545e2eb6650c4cde4fa342d920ae7ef4579f49b54270f6137a06d0eca` |
| Dependency manifest v3 | `0072d0e92a4389d3fe613a7d23549687461d4b05e90cd63b5b05c336105fac40` |
| Challenge suite v3 | `fe8ac6d13a1efd68fd3eb00b47fead9ed8bfac341a9fa0ea9739a6e1ff2120d1` |
| Producer binding v3 | `c1d943c0e695ff186ed45418dc82d7d69334b5f41b19dd84e04cea6a96a5d461` |

The dependency manifest and producer-binding artifact make the closure explicit. The producer binding is diagnostic only: candidate-policy producer ID and bundle producer ID remain null, the producer set is incomplete, and this policy has not been inserted into the canonical Agent36 V3 policy-plan core.

## Admission and next gates

This work is **not** a production opponent-policy attestation, a native reachability result, a matchup result, or evidence of any win rate. An independent reviewer is not assigned; the reviewer registry remains empty and the owner hold remains in force.

Before any native evaluation:

1. Run the authored tests in an approved local checkout and repair actual validator failures.
2. Materialize exact actor-visible request fixtures and their digests; retain the public event receipt and legal frontier.
3. Have an authorized independent reviewer inspect the source binding, policy, test coverage, and held-out cases.
4. Request canonical producer-ID registration through the Agent36 V3 policy-plan owner. Do not invent the missing candidate-policy or bundle producer IDs.
5. Obtain Critic authorization before native first-decision probes, games, or seed work.

This rank-5 lane does not cover the other 31 Aichi opponents. It makes no claim about the 99.5% target and must not be used as a proxy for full-field deck strength.
