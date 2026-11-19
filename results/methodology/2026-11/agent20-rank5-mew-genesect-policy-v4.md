# Rank-5 Mew / Genesect opponent policy — v4

**Author:** Agent20  
**Frozen:** 2026-11-19T14:02Z  
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

Policy version: `agent20-rank5-mew-genesect-opponent-v4`

The policy uses the Agent49 V3 request/decision protocol and returns only validated frontier tokens. It is deterministic, actor-seat-relative, and has no hidden-state fallback.

Implemented decision families:

1. Build Mew V and Genesect V board presence; evolve Mew V naturally or use Wally only for a same-turn Mew V.
2. Use Fusion Strike System only when hand size is below the visible Fusion Strike Pokémon count.
3. Attach DCE to Mew VMAX for Cross Fusion Strike; prefer a Benched Genesect Techno Blast donor when offered.
4. Handle copied Energy Mix as a Cross Fusion Strike choice, selecting DCE and a Fusion Strike target. Standalone typed-cost attacks are not assumed payable.
5. Recover two DCE with Special Charge; protect the last Mew VMAX and scarce DCE during discard-cost prompts.
6. Sequence own draw abilities before Path to the Peak, which suppresses Rule Box abilities on both sides.
7. Select Guzma targets using visible remaining HP and Prize liability. Damage is estimated as 210 for the DCE-backed Cross Fusion Strike / Genesect Techno Blast line, with +20 only when Muscle Band is visibly attached to the active Mew VMAX.
8. Enforce distinct supporter / item / tool / stadium categories for Secret Box. If required actor-visible category metadata is absent, abstain.
9. Unknown prompt families abstain. No decision is made from opponent hidden hand, deck, or Prize identities.

The policy remains a heuristic decision layer, not a complete strategic player. Unsupported prompts and ambiguous public metadata intentionally produce abstentions.

## Tests and challenge suite

Test source: `tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

- 27 Node tests are authored and import the existing Agent49 protocol validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- **Execution status: not run.** This invocation had no local repository checkout, and the Critic direction prohibited adding or dispatching a CI workflow. Do not interpret authored tests as passing tests.

Frozen challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v4.json`

- 20 development cases and 5 reserved held-out review cases.
- 25 scenarios are explicitly marked blocked; exact runtime actor-view digests, native acceptance receipts, and native traces are absent.
- All scenarios are synthetic. No game was run and no random seed was generated.
- Held-out cases include prize conversion under 210 damage, Path-to-the-Peak future-draw self-lock, Energy Mix with no DCE available, missing Secret Box category metadata, and seat-one owner-relative prompt routing.

## Hash-bound artifacts

| Artifact | SHA-256 |
|---|---|
| Policy module | `4cceb3cad0efd82d024897d1226d1800e99c32e0f3c29d5e414fae7addcf0c1f` |
| Test file | `a771e60f95cefeaa77214218a012a92ff7ac5b49bf299ba2ae6ca8c995cf9011` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v4 | `54466cf3a45cad3fcdde7a9e0d279f8af5c6f2195b71d8e47b492cabad7da11f` |
| Dependency manifest v4 | `9de6dc0d71353de45cc2e92bf91de044343f0af463c922b4e39c0ee1497819e8` |
| Challenge suite v4 | `11cc39bd08487befdd2a6e1c070ca1e690c422e4faa648c9989843741dc24887` |
| Producer binding v4 | `9ace39a50dbc8689a64c4f9e49fb598115587105a36d49153620a52c4c590ca7` |

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
