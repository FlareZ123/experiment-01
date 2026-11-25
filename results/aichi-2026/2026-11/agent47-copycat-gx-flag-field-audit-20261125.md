# Aichi field audit: GX attack flags missing from pinned Twinleaf metadata

**Agent47 · 25 November 2026**  
**Status:** confirmed source-metadata defect; Copycat tracker must remain disabled until corrected  
**Decision affected:** implementation gate and policy-competence disposition

## Question

Does the pinned Twinleaf `attack.gxAttack` boolean reliably identify every GX attack represented in the 29 authenticated Aichi Open League 2026 name/count lists? This matters because the research-owned Copycat tracker uses that boolean to decide whether an opponent's previous attack may be offered to Mimikyu.

## Method

1. Read the 29 available Aichi source inventories in `results/aichi-2026/full-decklists.json` and enumerated their distinct Pokémon identities containing “GX”.
2. Inspected each corresponding card implementation at pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
3. Compared each attack object's `gxAttack` property with the attack text's once-per-game GX restriction.
4. Checked the research-owned tracker and receipt path to determine whether an omitted flag becomes an eligible Copycat choice.

This is an engine metadata audit over the authenticated source-list name/count inventory and its current Twinleaf mappings. It does not certify physical Japanese printings.

## Findings

Four GX attacks in field-present card identities include the standard once-per-game GX restriction in their text but omit `gxAttack: true`:

| Aichi ranks | Mapped card | Twinleaf set / number | GX attack | Metadata |
|---|---|---|---|---|
| 1 | Trevenant & Dusknoir-GX | SMP 217 | Pale Moon-GX | Flag absent |
| 4, 5, 8, 9, 10, 12, 13, 14, 16, 18, 19, 20, 21, 22, 26, 27, 30, 32 | Dedenne-GX | UNB 57 | Tingly Return-GX | Flag absent |
| 14 | Oricorio-GX | CEC 95 | Strafe-GX | Flag absent |
| 19 | Arceus & Dialga & Palkia-GX | CEC 156 | Altered Creation-GX | Flag absent |

The affected-rank union is **19/29**: the 18 lists containing Dedenne-GX plus rank 1 containing Trevenant & Dusknoir-GX. Oricorio-GX and Arceus & Dialga & Palkia-GX occur within the Dedenne ranks.

This is also an internal Twinleaf inconsistency, not just a text-based inference: the corresponding card reducers enforce the GX once-per-game rule. Trevenant & Dusknoir-GX manually checks `player.usedGX` and sets it; Dedenne-GX, Oricorio-GX, and Arceus & Dialga & Palkia-GX each call `BLOCK_IF_GX_ATTACK_USED(player)` and set `player.usedGX = true` in the affected attack branch. The attack metadata flag is therefore missing even though the same pinned implementations enforce GX semantics.

Six other field-present GX attack implementations were positive controls and explicitly set the flag: Tapu Lele-GX / Tapu Cure-GX; Dialga-GX / Timeless-GX; Vileplume-GX / Allergic Explosion-GX; Articuno-GX / Cold Crush-GX; Electrode-GX / Crash and Burn-GX; Gengar & Mimikyu-GX / Horror House-GX.

## Why the current tracker misclassifies them

`simulation/twinleaf/copycat-multiattack-history.cjs` creates both ordinary attack rows and Ω Barrage follow-up rows with `gxAttack: attack.gxAttack === true`. Its `isMimikyuCopycatEligibleAttack` predicate accepts rows where `gxAttack === false`. Therefore each of the four omitted flags is serialized as **false** and the attack can pass the tracker's GX eligibility filter.

The receipt path preserves this boolean rather than repairing it: `simulation/twinleaf/agent7-copycat-history-root.cjs` maps the tracker value into the public receipt, and `simulation/twinleaf/agent8-public-event-receipt.cjs` serializes it. The schema is already boolean-shaped; the defect is at source classification.

Do not conflate this with the separate `copycatAttack` flag. Regidrago VSTAR SIT 136 / Apex Dragon sets `copycatAttack: true` but is a non-GX attack. The Mimikyu rule excludes GX attacks and another Mimikyu Copycat, not every attack that itself copies an attack. Apex Dragon must remain eligible; Mimikyu GRI / Copycat must remain ineligible.

## Proposed correction and tests

A research-owned `isGXAttack(attack)` predicate should treat an explicit native `gxAttack === true` as GX and use the standard once-per-game GX restriction in `attack.text` as a fallback. Exact-print overrides should be reserved for any source whose text and metadata are both incomplete. This is safer than inferring solely from an attack-name suffix.

Required regression coverage before enabling tracker-backed history:

- The four missing-flag attacks above are classified GX and excluded.
- The six positive-control GX attacks remain excluded.
- Regidrago VSTAR / Apex Dragon remains eligible despite `copycatAttack: true`.
- Mimikyu GRI / Copycat remains excluded.
- Tests exercise tracker-produced rows through Agent7 receipt attachment and the validated protocol, not only the helper.

**Current disposition:** this report does not authorize enabling the tracker, changing either policy branch, creating a workflow, or dispatching a fixture/game. Agent49 owns shared tracker/protocol coordination; Agent6 owns the rank-1 policy; both have received the bounded findings. The next action requires the separate scope decision already requested from Critic/owner.

## Evidence and limitations

- Aichi list membership/counts: `results/aichi-2026/full-decklists.json` (29 available lists; ranks 23, 25, 28 remain missing).
- Tracker: `simulation/twinleaf/copycat-multiattack-history.cjs`.
- Receipt attachment: `simulation/twinleaf/agent7-copycat-history-root.cjs`.
- Receipt serialization: `simulation/twinleaf/agent8-public-event-receipt.cjs`.
- Pinned source revision: `vendor/twinleaf` → `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Exact card implementations are in the pinned source paths:
  - `ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts`
  - `ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx.ts`
  - `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/oricorio-gx.ts`
  - `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/arceus-dialga-palkia-gx.ts`

The source-level omission is high-confidence. The 19/29 count applies only to the 29 available lists; the three missing ranks (23, 25, 28) could contain additional affected GX printings, so this is not a complete Top32 coverage figure. The actual frequency with which an opponent uses any affected GX attack, and the effect on game outcomes, are unmeasured. This is not a matchup result, paper-play observation, policy-competence result, or win-rate estimate.
