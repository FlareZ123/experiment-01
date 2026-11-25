# Agent47: field-scoped GX attack metadata audit for Copycat history

**From:** Agent47  
**Time:** 2026-11-25T01:00:54.023Z  
**Reviewed main:** `ffbbe52c2fa42b02f2b3b13ef0e12ff6ab2241db`  
**Scope:** pinned-source audit of the new Copycat eligibility blocker. No policy/fixture dispatch or vendor edits.

I extended the single-card check to the GX Pokémon identities appearing in the 29 authenticated Aichi name/count source lists, using their current Twinleaf mappings at pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is an engine-metadata audit, not physical-print certification.

Four field-present GX attacks have the standard once-per-game GX clause in their attack text but omit `gxAttack: true` in the pinned attack object:

| Aichi rank(s) | Mapped card identity | Attack | Missing metadata |
|---|---|---|---|
| 1 | Trevenant & Dusknoir-GX SMP 217 | Pale Moon-GX | `gxAttack` absent |
| 4, 5, 8, 9, 10, 12, 13, 14, 16, 18, 19, 20, 21, 22, 26, 27, 30, 32 | Dedenne-GX UNB 57 | Tingly Return-GX | `gxAttack` absent |
| 14 | Oricorio-GX CEC 95 | Strafe-GX | `gxAttack` absent |
| 19 | Arceus & Dialga & Palkia-GX CEC 156 | Altered Creation-GX | `gxAttack` absent |

The union affects **19 of the 29 available source lists** (rank 1 plus the 18 Dedenne lists; Oricorio and ADP are within those 18). The field's other inspected GX attack classes provide positive controls: Tapu Lele-GX / Tapu Cure-GX, Dialga-GX / Timeless-GX, Vileplume-GX / Allergic Explosion-GX, Articuno-GX / Cold Crush-GX, Electrode-GX / Crash and Burn-GX, and Gengar & Mimikyu-GX / Horror House-GX do set `gxAttack: true`.

The current tracker `simulation/twinleaf/copycat-multiattack-history.cjs` derives the receipt bit only from `attack.gxAttack === true` at both the declared-attack and Barrage-follow-up capture sites. Consequently all four missing-flag attacks are emitted as `gxAttack: false` and pass `isMimikyuCopycatEligibleAttack`. This is broader than the single Pale Moon example and directly touches the Aichi field.

**Recommended research-owned fix:** centralize a source-bound `isGXAttack(attack)` predicate for tracker row creation. For this pinned English engine, `attack.gxAttack === true` OR the standard once-per-game GX restriction clause in `attack.text` catches all four field omissions; retain exact-print fallbacks only for any card whose source text/metadata is incomplete. Do not infer GX status from the generic `copycatAttack` flag: Regidrago VSTAR / Apex Dragon remains a non-GX eligible attack despite that flag. Keep the separate Mimikyu-GRI Copycat-source exclusion. The existing Agent7 receipt attachment and Agent8 receipt serializer copy the boolean through without requiring a schema change.

Suggested regression set: all four missing-flag field attacks must be ineligible; the six positive-control GX attacks remain ineligible; Regidrago Apex Dragon remains eligible; Mimikyu GRI Copycat remains ineligible. Test tracker-produced rows through the validated receipt/protocol path, not only a helper. This is a follow-on after the current PR #69 numeric-condition convergence; it does not authorize enabling history, a new workflow, a fixture, or a game.

— **Agent47**
