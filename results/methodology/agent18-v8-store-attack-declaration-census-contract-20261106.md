# Agent18: distinguish real Store attacks from AttackAction roots in the prospective v8 archive

**6 November 2026 | 03:03 UTC | scope: read-only archival metric contract.** This is a developmental provenance correction. It creates no game, no attack, no new selected policy, and no competitive win-rate evidence.

## Problem and source of truth

The [Critic's 02:34 attack-declaration gate](../../communications/broadcast/2026-11/20261106T023420Z_critic_attack_declaration_measurement_gate.md) observed that accepted `AttackAction` root count does not generally equal actual attacks. [Agent42's compiled copied-attack fixture](agent42-perfection-copied-nightwatch-native-source-gate-20261106.md) verified Mewtwo & Mew-GX `Perfection` initiating from a `UseAbilityAction` and fully settling a copied Night Watch despite **zero AttackAction roots**. An additional [Critic 02:43 warning](../../communications/broadcast/2026-11/20261106T0243Z_critic_real_store_vs_speculative_telemetry_boundary.md) found prototype reducer hooks invoked during **speculative AI simulation**, emphasizing the need for provenance.

The existing prospective four-rank [Agent36 v8 independent archive audit](../../simulation/evaluation/agent36-v8-original-field-archive-audit.cjs) originally calculated `sourceAcceptedAttackDeclarations` by counting only source-owned `AttackAction` roots. The [real-Store settlement builder](../../simulation/evaluation/agent37-candidate-attack-settlement.cjs) already derives `attacks[]` from the headless `attackDeclarationTrace` and checks each against the accepted root ledger and real public attack-transition log, regardless of attack origin. This established mechanism is the correct native lineage for declaration counts in archived returned rows.

## Minimal change to the existing auditor

The read-only v8 inspector now retains `sourceAttackRoots[]` under its original per-row label, while its aggregate is explicitly **`sourceAcceptedAttackActionRoots`**. It additionally reports `sourceStoreAttackDeclarations[]` per row, with originating action ordinal, printed attack name, whether the prompt chain settled, and event source `real-Store attackDeclarationTrace`. The new aggregate is **`sourceRealStoreAttackDeclarationsKnown`**, and the **`sourceRealStoreAttackDeclarationsUnknownRows`** counter explicitly preserves absent or aborted `actualSourceAttackSettlement.attacks` as unknown. Existing `sourceSettledAttacksKnown`, `sourceSettledAttacksUnknownInAborted`, full public root digest checks, complete eight-arm registration, error/censor status and next-opponent receipts remain intact.

The ambiguous old aggregate `sourceAcceptedAttackDeclarations` was deliberately **retired**, so downstream consumers must adopt the explicit new name; this is a reporting schema correction and needs review before substituting a previously generated audit JSON into any release packet.

## Independent accepted-root attestation

The original [Agent37 Store declaration builder](../../simulation/evaluation/agent37-candidate-attack-settlement.cjs) already checks the emitting root, and the archival inspector now independently repeats the critical **source physical-seat, triggering-action and global-turn** checks. Every claimed real-Store attack declaration must have a valid integer `actionOrdinal`, a corresponding accepted root, `root.playerSlot===registeredOriginalSourceSeat`, `root.action===attack.triggerAction`, and `root.turnBefore===attack.turnBefore`. Its attack name must be a nonempty printed string. A copied Perfection attack with a `ResolvePromptAction` root passes when its real declaration identifies that action. Tampered archive JSON with a forged attack declaration whose trigger conflicts with the public accepted root now **fails closed**, even when the artifact checksum is recalculated. The strict check uses only public real-Store root fields and the source-return attack settlement; it neither reads hidden game zones nor changes any played action.

## Actual validation

[Four pure Node 22 regression tests](../../tests/agent18-v8-attack-declaration-provenance.test.cjs) passed locally against a faithful copy of the patched auditor and the same eight registered trial identities (the local fixture registration preserved the relevant ID/seat shape). Synthetic evidence:

| Synthetic v8 source arm | Accepted AttackAction roots | Real-Store-origin declarations represented by settlement input | Fully settled | Unknown? |
| --- | ---: | ---: | ---: | --- |
| UseAbility → ResolvePrompt copied Night Watch | 0 | 1 | 1 | No |
| AttackAction → unresolved ResolvePrompt Volt Cyclone | 1 | 1 | 0 | No |
| Engine abort after a PlayCardAction, settlement missing | 0 | unknown | unknown | **Yes** |
| Five uneventful registered arms | 0 | 0 | 0 | No |

The first test verified the resulting combined totals **1 root / 2 known declarations / 1 settled / 1 unknown row**, all eight registered IDs and exact accepted root digests. A second test intentionally corrupted one public root digest and verified a hard failure. Two additional negative tests rehashed synthetic archives with a fabricated trigger action or wrong declared source physical seat and verified that both are rejected. The original source and 2026 paper match provenance remain independent obligations. **These are synthetic archive-shape tests**, while the underlying copied-attack mechanism has a separate actual pinned Store verification by Agent42. A fresh v8 native archive, if available, must still be audited with this corrected inspector and reviewer signoff before reporting any real counts.

No pinned Twinleaf vendor files, game runners, optional policy layers, actor decisions, paper rules or Actions workflows were changed. Existing 128-root original-v8 registration is unchanged. The [original v7 five-settled-attack report](agent36-issue25-common-v7-native-volt-continuation-20261106.md) remains a **separate** developmental cohort and was not promoted into a competition sample.

## Acceptance consequence

Actual attack declarations and fully resolved public attack effects must be measured separately from Store action-root classes and from speculative simulator reducer calls. A `null` count on an error row must remain unknown; a complete zero-event returned row can be counted zero. Independent source information-set safety, legal card payment, paper-correct opponent counterplay, original Top32 inventory coverage and official 25-minute clock still veto competitive admission. **Zero competitively qualified games, no selected final 60, and no demonstrated 99.5% win rate.**
