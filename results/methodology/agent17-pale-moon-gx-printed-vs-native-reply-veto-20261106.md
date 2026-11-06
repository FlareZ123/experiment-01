# Post-Team-Flare reply: printed Pale Moon-GX is funded but engine GX metadata is unresolved

**Agent17 | 6 November 2026 | source-card text and genuine native owner snapshots.** This is a targeted *uncertainty and qualification gate*. No actual new \`Pale Moon-GX\` Store attack has been observed in the original frozen game.

## Exact source text, arithmetic and own-board state

The provided complete English card pool's \`cards/en/smp.json\`, original \`smp-SM217\` Trevenant & Dusknoir-GX, gives:

- \`Night Watch\`: Psychic + Psychic + Psychic; 150 damage and two random opposing-hand cards returned to the deck.
- \`Pale Moon-GX\`: Psychic + Colorless, **zero printed attack damage**; at end of the *opponent's next turn* the Defending Pokémon is Knocked Out. Only if another Psychic Energy is attached **beyond the full two-Energy cost** does the attack additionally discard all Energy from the opponent's Active. GX attack limited to one per game.

In the exact owner-only [native source-replay](agent17-rank1-post-teamflare-owner-funding-and-gx-replies-20261105.md) from successful [CI42133243690](https://github.com/FlareZ123/experiment-01/actions/runs/42133243690), actual rank1 Active \`Trevenant & Dusknoir-GX SMP\` has **two Basic Psychic Energy cards** throughout genuine Pass roots 232 (turn60) to turn88; owner public \`gxUsed:false\`, \`cannotUseGXAttacks:false\`, \`attackLockTurnsRemaining:0\`. Thus a two-Psychic payment **appears to satisfy the printed two-Energy cost** (one Psychic fulfills Psychic, the second Psychic fulfills Colorless), but **cannot satisfy the extra-Psychic discard-all condition**. The printed-GX effect is a delayed KO with potential to be removed if Defending Pokémon leaves Active. This is much narrower than a direct immediate KO or Energy denial claim.

At the genuine first post-denial turn60, the opponent's Active rank3 \`Rotom V LOR\` was damaged for 150 of 190 HP; source rank3's own archived owner hand at turn61 retained \`Guzma BUS\`, and its Supporter quota was unused. The existing Rulebook section A-03 states moving Active to Bench removes effects of attacks on it, and C-03/C-04/C-05 also describe switching. Consequently a printed-GX attack does **not establish a forced two-Prize KO** against a competent source actor: an opposing Guzma response could move the targeted Rotom out of the Active Spot. The full live source root sequence has not tested whether that action would be selected or genuinely native-accepted.

## Distinct engine-fidelity caution

The authentic \`actorObservation\` of the pinned native card prints \`Pale Moon-GX\` with \`gxAttack:false\` on **all fifteen post-denial rank1 owner Pass snapshots**. This differs from other observed GX attacks on original public Bench such as \`Dialga-GX UPR\` \`Timeless-GX\` with \`gxAttack:true\`, and the source printed SM217 explicit GX restriction.

This **is not proof of actual native engine incorrectness**: an alternate native card model/attack-action branch may enforce GX-only-once even when this exposed field is false. It **is** a well-grounded unresolved engine metadata discrepancy that a print-correct adversarial reply test must address, especially if native Store were to accept the GX more than once in a longer case. Do not interpret successful native Store dispatch alone as paper-correct GX accounting without independent \`usedGX\` pre/post and second-GX veto checks.

## Unexecuted future-native registration and validation

An opt-in reversible owner-only selector that proposes \`AttackAction(ownerId,'Pale Moon-GX')\` at only the frozen rank1 turn60 after actual rank3 Team Flare turn59 has been committed at [agent17-targeted-rank1-pale-moon-native.cjs](../../simulation/twinleaf/agent17-targeted-rank1-pale-moon-native.cjs) with [synthetic tests](../../tests/agent17-targeted-rank1-pale-moon-native.test.cjs), optional common runArm integration, and predeclared [three-arm A/B/A runner](../../simulation/evaluation/agent17-skyliner-pale-moon-counterreply-aba.cjs). The [manual native workflow](../../.github/workflows/agent34-underworld-owner-prompt-native.yml) has boolean input \`agent17_pale_moon_counterreply\`.

**Status as of this report: unexecuted.** No compiled Store attack, prior-state continuity, resulting Prize, opponent reply or native winner can be claimed. A requested workflow dispatch returned an execution safety block; do not invent a queued workflow/run or silently treat these regressions as passed. Execution remains contingent on permitted tooling and independent review. The original successful Team Flare counterfactual, unchanged.

**Qualification:** Original source paper card legality/conditional attack cost may be analyzed, but actual current pinned native GX handling, delayed effect, turn61 Guzma reaction and full paper legality are unresolved. Field coverage remains 29/32 with ranks23/25/28 absent, zero competitively qualified games, no fixed final 60 and no demonstrated 99.5%.
