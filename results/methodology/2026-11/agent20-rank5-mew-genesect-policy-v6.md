# Rank-5 Mew / Genesect opponent policy — v6

**Author:** Agent20  
**Frozen:** 2026-11-19T14:12:27.304Z  
**Status:** diagnostic-only; not executed, not natively validated, not production-registered

## Scope and source binding

This is a deterministic actor-view-only opponent policy for the exact Aichi Open League 2026 rank-5 Yamato Nakano Mew / Genesect list. It does not modify that 60-card list or the Hood Shield v1 candidate.

- Source list: `results/aichi-2026/full-decklists.json`, roster blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Printed-60 SHA-256: `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`.
- Candidate: `results/aichi-2026/candidate-hood-shadow-rider.json`, fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`.
- Twinleaf submodule: `vendor/twinleaf`, pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No upstream or submodule files were changed.

The source list contains four Mew V, three Mew VMAX, four Genesect V, four Double Colorless Energy, zero Basic Energy, and one Forest Seal Stone. Standalone Psychic/Metal attack costs are never inferred payable from DCE.

## Implementation

Entrypoint: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`

Policy version: `agent20-rank5-mew-genesect-opponent-v6`

The policy uses the Agent49 V3 request/decision protocol and returns only validated frontier tokens. It is deterministic, actor-seat-relative, and has no hidden-state fallback.

Implemented decision families:

1. Build Mew V and Genesect V board presence; evolve Mew V naturally or use Wally only for a same-turn Mew V.
2. Use Fusion Strike System only when hand size is below the visible Fusion Strike Pokémon count.
3. Attach DCE to Mew VMAX for Cross Fusion Strike; prefer a Benched Genesect Techno Blast donor when offered.
4. Handle copied Energy Mix as a Cross Fusion Strike choice, selecting DCE and a Fusion Strike target. Standalone typed-cost attacks are not assumed payable.
5. Use Forest Seal Stone on a Pokémon V (not Mew VMAX). Star Alchemy is available from whichever actor-owned Pokémon V carries the Tool, once per game, after useful draw abilities. Search Mew VMAX when Mew V is established, DCE when any Mew VMAX on the board (including the Bench) lacks it, then a second Genesect or a contextually useful card.
6. Recover two DCE with Special Charge; protect the last Mew VMAX and scarce DCE during discard-cost prompts.
7. Sequence own draw abilities before Path to the Peak, which suppresses Rule Box abilities on both sides.
8. Select Guzma targets using visible remaining HP and Prize liability. Damage is estimated as 210 for DCE-backed Cross Fusion Strike / Genesect Techno Blast, plus 20 only when Muscle Band is visibly attached to the active Mew VMAX.
9. Enforce distinct supporter / item / tool / stadium categories for Secret Box. If required actor-visible category metadata is absent, abstain.
10. Unknown prompt families abstain. No decision is made from opponent hidden hand, deck, or Prize identities.

The policy remains a heuristic decision layer, not a complete strategic player. Unsupported prompts and ambiguous public metadata intentionally produce abstentions.

## Tests and challenge suite

Test source: `tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

- 31 Node tests are authored and import the existing Agent49 protocol validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- **Execution status: not run.** This invocation has no local repository checkout, and the Critic direction prohibited adding or dispatching a CI workflow. Authored tests must not be described as passing tests.

Frozen challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v6.json`

- 24 development cases and 5 reserved held-out review cases (29 total scenarios).
- Every scenario is explicitly blocked: exact runtime actor-view digests, native acceptance receipts, and native traces are absent.
- All scenarios are synthetic. No game was run and no random seed was generated.
- Held-out cases include prize conversion under 210 damage, Path-to-the-Peak future-draw self-lock, Energy Mix with no DCE available, missing Secret Box category metadata, and seat-one owner-relative prompt routing.

## Hash-bound artifacts

| Artifact | SHA-256 |
|---|---|
| Policy module | `2d45fca8ddd8b1080fd4d8d14abf1fb26743d3fd1235ac5dd55cb4d674be0693` |
| Test file | `da243f8f7047f8dd41531f66ef2df3da1edf3890ef63eb0c27a3a61f2dec0f9d` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v6 | `40b719d7c4fb2b61c74c21dde185f0c4e020204be97ee3c42412c0735e662f64` |
| Dependency manifest v6 | `6839b2994b2349a46f763d4288c53743bf09d11a93fda375a29a7f631f221673` |
| Challenge suite v6 | `bdff3b48dfcf6401dd97d897bb56c02a6c6741b190dd771d6113fb5adac771fe` |
| Producer binding v6 | `0dd983417184152a11194b36c90184c78179de659b273b44762f0d15049e0f9a` |

The dependency manifest and producer-binding artifact make the closure explicit. The producer binding is diagnostic only: candidate-policy producer ID and bundle producer ID remain null, the producer set is incomplete, and this policy has not been inserted into the canonical Agent36 V3 policy-plan core.

## Admission and next gates

This is **not** a production opponent-policy attestation, native reachability result, matchup result, or evidence of any win rate. An independent reviewer is not assigned; the reviewer registry remains empty and the owner hold remains in force.

Before native evaluation:

1. Run the authored tests in an approved local checkout and repair actual validator failures.
2. Materialize exact actor-visible request fixtures and their digests; retain the public event receipt and legal frontier.
3. Have an authorized independent reviewer inspect source binding, policy, test coverage, and held-out cases.
4. Request canonical producer-ID registration through the Agent36 V3 policy-plan owner. Do not invent missing candidate-policy or bundle producer IDs.
5. Obtain Critic authorization before native first-decision probes, games, or seed work.

This rank-5 lane does not cover the other 31 Aichi opponents. It makes no claim about the 99.5% target and must not be used as a proxy for full-field deck strength.
