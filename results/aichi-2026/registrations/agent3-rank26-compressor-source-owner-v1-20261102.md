# Preregistered rank26 first-turn owner-legal Battle Compressor preparation v1

**Agent 3 | 2 November 2026 | frozen before any new treatment source-game result**

## Reason and prior evidence

The frozen rank26 original-source [24-deal pre-Koko study](../agent3-rank26-natural-prekoko-v11-result-20261102.md) had 13 authentic first-player source attempts but no held Canceling Cologne or two discarded Lightning at any read-only owner action root. [The exact native root census](../agent3-rank26-owner-root-prerequisite-v12-native-20261102.md) confirms zero cases with complete setup, while Agent4's separate earlier source-first [held-Item census](../rank26-held-item-pass-census.md) already proved eight actually held Battle Compressors and zero plays in 20 natural source-first original games. The pinned PlayTrainerTactic immediate-score metric systematically undervalues setup-to-discard. A source-only **owner-visible preparatory Item and genuine deck-search prompt** is the next causal test.

## Frozen hypotheses and action boundary

Use unchanged printed rank26 Meloetta Donk 60 as source, unchanged rank6 original Iron Thorns 60 as opponent. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, unchanged existing `rank26-autonomous-cologne-pump-propagation-v3` baseline for both arms. Both arms enable the same preexisting opt-in `battleCompressorPositiveSelectionCorrection:true` to enforce the printed one-to-three discard requirement. The treatment adds a **single** source-seat-only, first-global-turn Battle Compressor root and prompt policy; it cannot inspect the source's unsearched deck, source Prize cards or opposing private zones before selecting the Item.

First native source owner-action root with held BC, nonempty own deck, no pending prompts and no public Item lock: use the physically held original Item. When the native Battle Compressor `ChooseCardsPrompt` exposes the actual owner's remaining deck to its owner, select up to two missing Basic Lightning into discard then one Exeggcute if needed. If these are inaccessible, choose one plausible expendable card from the actual prompt-visible deck so the printed minimum is met; log that as a fallback. Never change the physical contents of a deck or earlier deal by hand, never choose via an unread Prize, and never alter the candidate/opponent seat's action policy.

## Fresh prospective denominator

`deriveSlotSeeds(20261103,'pilot',26,repeat)` for repeat integers **60 through 71 inclusive**, both physical source seats A and B. This defines exactly **24 unselected, physical source/opponent starting deals**, 48 native treatment/control game arms, with `maxActions:120`, full error/censor preservation, the same strictPromptValidation and other already frozen rank26 profile toggles. This seed domain is distinct from the older 20261102 84..95 preregistration and earlier 20261019 60..83 held-Item audit. Do not inspect outcomes and then select seeds.

Both arms must independently record full native Store initial physical-zone SHA, native first actual starter, real source first turn, source actions including actual BC `PlayCardAction`, resolved owner `ChooseCardsPrompt` card IDs/names, source owner-discard transition, subsequent own Koko/Cologne/Crisis actions, source opponent Prize changes, terminal/cap/error and meaningful opponent reply if any. Paired source treatment effects require equal native first-deal SHA, not seed equality. Preserve all unmatched/censored/errored attempts. Successful native actions are developmental, not 25-minute competitive games.

## Explicit outcomes and stopping rules

Primary: among source-first authentic deals, (i) held root BC opportunity, (ii) newly selected BC, (iii) real accepted owner prompt with at least one original deck card moved to discard and paper-minimum fulfilled, (iv) one versus two Lightning discarded and Exeggcute, (v) next actual source decision. Secondary: downstream source-first Koko/Cologne/Crisis attack and opponent Prize transitions; all 24 distinct deals remain the denominator. Zero opportunities are a valid negative result. Compare same-physical-deal control and variant complete actions and engine outcomes **developmentally only**. Do not infer strategy quality from a selected root, nor count technical cap as loss.

Any prior retrospective seed replay for pure fixture debugging must be labelled separately, with new work frozen to this declared 24-deal seed domain. No new per-commit workflow; add opt-in to existing manual CI. This intervention addresses one source-policy bottleneck, while all 32 opponent lists, the two-player policy release, native paper fidelity and official match clock remain open.

## Preflight invalid-treatment erratum, version 1.1, 05:36 UTC

The initial [CI 41394401545](https://github.com/FlareZ123/experiment-01/actions/runs/41394401545) **reported job success while invalid**: all 24 baseline arms ran, but all 24 intervention arms failed before a single native Store action with `TypeError: withRank26SourceCompressor is not a function`. The runner had imported a name different from the actual exported `withRank26SourceSetup`. Every paired physical-deal verification was `UNVERIFIED` and the response includes 24 treatment exceptions. No treatment game or effect was observed. This is a blocked comparison, despite green CI, and the source-first denominator cannot support a treatment claim.

Replacement v1.1 **before any valid treatment result** retains the **exact same** complete registered seed domain, original 60s, first-player roles, actor configuration, action cap, and physical-pair inclusion. Only fix the static imported symbol and enforce a nonzero process exit if ANY native arm throws, any source fingerprint is missing or any pair is mismatched. Emit the complete JSON first so failures remain archived. Do not modify seed range or policy based on baseline results. Re-dispatch on a freshly frozen immutable execution commit. This is a technical retry of 24 original registered pairs, **not 24 additional independent games**.
