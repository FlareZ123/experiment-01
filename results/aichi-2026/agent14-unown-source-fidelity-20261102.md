# Original Unown AOR 30 owner-policy and native settlement evidence

Agent 14, 2 November 2026. This is developmental source-policy evidence, with **zero competitively qualified matches**.

The authenticated exact Aichi Top32 source inventory in `full-decklists.json` has Unown AOR 30 in ranks 9 (4), 17 (4), 26 (4), 30 (3), 31 (3), totalling 18 physical copies in five original opposing decks. Printed *Farewell Letter* allows a Benched Unown to discard itself and its attachments without a Knock Out, then draw one card.

## Native policy gap and repair

Before this study the common actor-only owner-root selector contained no native path to `Farewell Letter`. The experimental selector `simulation/twinleaf/agent14-owner-farewell-letter.cjs` uses a detached public board, exact printing and Ability identity, no attached resources, more than one owner deck card, and conservative public Ability-lock checks. It is opt-in only via `actorFarewellLetterRoot=true` in the bilateral runner and applies symmetrically to both physical seats. The actual native Store arbitrates its legality.

Twinleaf's `usePower` reducer installs an animation `WaitPrompt` **before** it executes `PowerEffect`. Therefore an accepted root can show no immediate board change. The reversible observer in `agent34-actor-only-root-policy.cjs` now waits for the native `ResolvePromptAction`, checking the exact Unown Bench departure, owner discard growth, owner deck -1, owner hand +1, and unchanged both Prize counts. Accepted, pending, and physically settled are separately attributed; the initial immediate root snapshot is insufficient as proof.

## Frozen retrospective source tests

- [Rank 9, 8 native arms and gate](https://github.com/FlareZ123/experiment-01/actions/runs/41388497550): four matched original physical deals; six source-owned Unown Ability actions, **all six physically settled after prompt resolution**, none unresolved. The six immediate snapshots were blocked by animation and would otherwise be mislabelled. Some native games were action-capped.
- [Ranks 26, 30, 31, 24 native arms](https://github.com/FlareZ123/experiment-01/actions/runs/41388930673): twelve baseline/treatment cases, nine matching original source deals. Rank 26 yielded five source Ability settlements and all four pairs matched. Rank 30 yielded five settlements, three exact pairs and one treatment `UNKNOWN_POWER` abort. Rank 31 yielded one settlement, two exact pairs and two pairs with source engine `CANNOT_USE_POWER` attack errors. All failures remain in the recorded denominator.
- Further original rank 17 source physical seeds were registered before attempts in `registrations/agent14-rank17-original-source-20261102.json`.

The 17 observed successful native self-discards/draws validate that narrowly scoped ability and the deferred accounting procedure. They do **not** validate the broader source policy, its lock sequencing, full 32-field coverage, the paper 25-minute clock, the ultimate fixed deck's tactical superiority, or the proposed 99.5% target. Match-level qualified wins remain zero.

## Reproduce

The manual existing `.github/workflows/agent41-flexible-special-originals.yml` supports `rank9_farewell_replay` and `unown_multirank_replay`. Raw artifacts preserve source-deal fingerprints, card-print provenance, errors, action caps, and per-root owner-public zone conservation. Registration tests: `tests/agent14-unown-original-registration.test.cjs`. Physical tests: `tests/agent14-farewell-physical-witness.test.cjs`. Pure root tests: `tests/agent14-owner-farewell-letter.test.cjs`, `tests/agent14-basic-ability-locks.test.cjs`.
