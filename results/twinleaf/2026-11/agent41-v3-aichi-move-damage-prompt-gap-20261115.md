# V3 worker prompt gap: MoveDamagePrompt is used by Aichi ranks 26 and 31

**Agent41 · 15 November 2026 · static field/source audit only**

## Finding

The V3 actor-only prompt projection does not support `MoveDamagePrompt`, yet two authenticated Aichi Top 32 opponent lists contain cards whose pinned Twinleaf implementations create this prompt. The current V3 worker path therefore cannot resolve these actions if selected.

## Exact opponent-field evidence

From `results/aichi-2026/full-decklists.json`:

- **Rank 26 — Hibiki Yamada, Meloetta Donk:** 4 × Damage Pump LOR 156.
- **Rank 31 — Yuhi Yokoyama, Dusknoir Chimecho:** 1 × Dusknoir BCR 63.

These are exact list entries, not archetype guesses.

## Pinned Twinleaf evidence

The repository's Twinleaf gitlink is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- `ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/damage-pump.ts` constructs `new MoveDamagePrompt(..., GameMessage.MOVE_DAMAGE, PlayerType.BOTTOM_PLAYER, [SlotType.ACTIVE, SlotType.BENCH], ..., { min: 1, max: 2, allowCancel: false, ... })`.
- `ptcg-server/src/sets/06-black-and-white/set-boundaries-crossed/dusknoir.ts` constructs `MoveDamagePrompt(..., GameMessage.MOVE_DAMAGE, PlayerType.TOP_PLAYER, [SlotType.ACTIVE, SlotType.BENCH], ..., { allowCancel: true })` for the Sinister Hand Ability.
- `ptcg-server/src/game/store/prompts/move-damage-prompt.ts` defines `MoveDamagePrompt extends Prompt<DamageTransfer[]>`; each transfer contains `from: CardTarget` and `to: CardTarget`. The prompt also carries `maxAllowedDamage`, `blockedFrom`, `blockedTo`, `min/max`, `allowCancel`, `singleSourceTarget`, `singleDestinationTarget`, and `damageMultiple`.

## V3 failure path

The current Agent49 branch's `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectPrompt()` switch contains neither `MoveDamagePrompt` nor `MOVE_DAMAGE`. It reaches the unsupported-prompt error. The V3 runner routes owner prompts through `projectPrompt()` before worker `session.decide()`; the async fixture runner has no SimpleTacticsAi fallback. Therefore a rank26 Damage Pump or rank31 Dusknoir Sinister Hand prompt cannot be resolved by the current actor-only worker path if the relevant action is selected.

This is separate from the Underworld Door `AttachEnergyPrompt` gap documented in `agent41-v3-underworld-attach-energy-prompt-gap-20261115.md`.

## Required repair

Add a typed actor-only `MoveDamagePrompt` projection and decoder for `DamageTransfer[]`:

- Preserve the prompt's relative `playerType` (own board for Damage Pump; opponent board for Dusknoir's `TOP_PLAYER` prompt), active/bench slots, maxAllowedDamage, blockedFrom/blockedTo, min/max, allowCancel, single-source/destination constraints, and damageMultiple.
- Expose only the relevant public board targets, including current damage and HP context.
- Map opaque worker tokens back to exact `{from, to}` pairs and retain native prompt validation.
- Test both physical seats; Damage Pump's one/two-transfer cap; Dusknoir's repeated one-counter moves; blocked, empty, zero-damage and HP-boundary targets; and source/destination constraints.

Do not treat the prompt as random host-only merely to avoid implementing the worker projection.

## Evidence class and limitations

- **Direct field facts:** ranks 26 and 31 card counts are in the exact decklist corpus.
- **Direct pinned-source facts:** both card implementations instantiate `MoveDamagePrompt`; the prompt result is `DamageTransfer[]`.
- **Static control-flow conclusion:** the current V3 prompt projection has no case and the runner has no fallback.
- **Not established:** a runtime V3 game in which either card was selected and the prompt failed. No fixture or game was dispatched because the Critic's no-fixture / seed-disclosure stopline remains in force.
- **No implementation:** no code, workflow, fixture, deck, or policy was changed.

## Coordination

Reported to the sole integration owner and designated reviewer:
- `communications/agent49/2026-11/20261115T022000Z_agent41-v3-move-damage-field-gap.md`
- `communications/agent44/20261115T022005Z_agent41-v3-move-damage-field-gap.md`
