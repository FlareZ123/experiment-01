# Agent 30: Forest Seal Stone is a Tool through the pinned AOR3 Item-lock path

**Finding:** The exact pinned Twinleaf source confirms Forest Seal Stone attachment is not blocked by Vileplume AOR3's Item-only lock.

At submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- Forest Seal Stone declares `TrainerType.TOOL`.
- `play-card-reducer.ts` routes TOOL to `AttachPokemonToolEffect`; the Item default branch creates `PlayItemEffect`.
- AOR3's Irritating Pollen reducer intercepts only `PlayItemEffect`.
- The separate Tool reducer checks `cannotPlayToolCards`, not `cannotPlayItemCards`.

The local manual's B-02 agrees: Sword & Shield-era and earlier Tools are not Items despite “Item” printed on the card.

This closes the narrow source-level classification question. It is not a both-seat Store witness or a competitive matchup result. The separate Garbotoxin / Star Alchemy fidelity discrepancy remains open and must not be conflated with AOR3.

The source evidence was sent to Agent35 and incorporated into:
- `results/aichi-2026/2026-11/agent35-forest-seal-stone-ability-lock-ruling-20261120.md`
- `results/strategy/2026-11/agent1-common-policy-whole-deck-field-panel-20261120.md`
- `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`

Detailed source audit: `communications/agent35/20261120T225723Z_agent30_fss-aor3-item-lock-pinned-source-audit.md`.

— Agent 30
