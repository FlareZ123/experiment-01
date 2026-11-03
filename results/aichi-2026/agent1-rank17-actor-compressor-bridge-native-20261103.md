# Original rank-17 actor-only Pass shadowing: native Battle Compressor recovery

**Agent 1 | 3 November 2026 | fixed original printed sixty, real paired Store replays.**

## Structural cause

In `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, the default live-owner intent is `pass` and the wrapper returns `PassTurnAction`. It never reaches the underlying `SimpleTacticsAi.decodeNextAction` on a genuine owner root, so adding a `Rank4RaichuCompressorTactic` inside the headless native bot options alone cannot play the Item. The identical root ledgers in the earlier [rank17 null trial](agent1-rank17-compressor-native-negative-20261103.md) are consistent with this mechanism.

The subsequent [read-only owner census](https://github.com/FlareZ123/experiment-01/actions/runs/41590060324) found three authentic early root snapshots where the original rank17 owner held Battle Compressor, had a recognized public setup predecessor, a nonempty deck, no Item lock or pending prompt, and satisfied `shouldPrepareRaichu`; all three selected Pass. This is a direct missing actor-root offer, subject to native Item legality verification.

## Frozen corrective test

[Preregistered original source, native version, separate seed cohorts and modes](registrations/agent1-rank17-actor-compressor-bridge-prospective-20261103.json) **before corrective native outcomes**. The original rank17 printed 60 and the rank1 printed reference 60 remain unchanged, with original printing fingerprint `49ec5104403de2bc176cd59b1d58861636a5b72d759e42ce36bd115f539f6401` and Twinleaf pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Both arms enable the same native rank17 Battle Compressor prompt resolver and minimum-one selection paper hook, natural evolution actor root, corrected Electrode-GX and Electro Rain mechanics, 180-action cap and root trace. The treatment additionally wraps *after* the actor selection: if an actual source-owner Pass is selected on global turn 1/2, the owner hand holds the printed Compressor, a valid setup predecessor is in play, and the Item's **real native canPlay** succeeds, it substitutes a real `PlayCardAction` on the native Store. Its pending deck-selection and shuffle prompts are delegated to the same ordinary prompt resolver. The control preserves actor Pass.

The preregistered cohorts were (a) three *already-seen* positive contexts, explicitly retrospective and useful only as mechanism tests, and (b) eight new 32-bit seeded groups with rank17 in each physical seat, 16 additional prospective contexts. No native win-rate qualifier was preregistered.

## Native results

**[Successful CI 41591371975](https://github.com/FlareZ123/experiment-01/actions/runs/41591371975)**, head `8036a7bd6bb2a10bfcdfcb770e5dff7ab3bdc76f`. Nine pure regressions passed. The [complete 38-arm outcome artifact 13209864119](https://github.com/FlareZ123/experiment-01/actions/runs/41591371975/artifacts/13209864119) has ZIP SHA-256 `1e3d96feb88d30a04234e7f4f35eb87a317a27fc5c822460f1b45b9c36ed8c20`.

| Cohort | Original rank17 source seat/seed | Native Store-accepted Battle Compressor plays | Native follow-up |
| --- | --- | ---: | --- |
| Known-positive, selected retrospectively | 0 / 2443530385 | 1 | Owner ChooseCards → ShuffleDeck prompts |
| Known-positive, selected retrospectively | 0 / 1246820961 | 2 | Two genuine Item/prompt sequences |
| Known-positive, selected retrospectively | 0 / 3029174418 | 1 | Owner ChooseCards → ShuffleDeck prompts |
| Fresh preregistered | 1 / 2208314832 | 1 | Owner ChooseCards → ShuffleDeck prompts |
| Fresh preregistered | 1 / 4010383176 | 1 | Owner ChooseCards → ShuffleDeck prompts |
| Other fourteen fresh seat/seed contexts | Both seats | 0 | No observed source prerequisite opportunity |

All **38 attempts completed** as **19 physically matched pairs** with no native engine or bridge rejection. Five physical pairs had divergent native action traces; the other fourteen remained identical. Control arms played zero source Compressors. Treatment arms had **six real native Store-accepted Item roots in five pairs**, with all six creating a genuine ChooseCardsPrompt, followed by a matching same-lineage shuffle and native prompt resolution. The native Item's `canPlay` returned true in all six cases.

The source player used **zero actual AttackAction roots and zero UseAbilityAction roots in both modes across these contexts**. Neither the engine terminal/winner fields nor action-cap status changed within any pair. These facts establish action-access recovery while showing that the current original source policy is still far from competent game execution. A successful native engine terminal is not a qualified competitive win.

## Payment and qualification boundaries

**Post-prompt custody confirmed:** The initial Store receipt records `genuineOwnerDiscardObserved=false` only because the owner ChooseCardsPrompt is still pending at the Item root. I [registered a transparent read-only custody extension](registrations/agent1-rank17-compressor-payment-custody-addendum-20261103.json) after the positive outcome, then replayed all the identical original deals under [successful CI 41592173354](https://github.com/FlareZ123/experiment-01/actions/runs/41592173354), artifact [13210837476](https://github.com/FlareZ123/experiment-01/actions/runs/41592173354/artifacts/13210837476), ZIP SHA-256 `bffd5960e61a3e1b9ad1ec2268e158dfdb8bd5084609e6027f901e2077f0abab`.

**All six genuine source-owned ChooseCardsPrompt resolutions selected these three exact printed physical cards:** `Reversal Energy PAL`, `Counter Energy CIN` and `Unit Energy LPM UPR`. Immediately after every native selection response, the same original owner's *actual discard pile contained all three selected cards*. The second Compressor in seed 1246820961 (source seat 0) selected a second physically distinct copy of each, and the observed discard grew accordingly. Across the six accepted Item uses the native Store resolved **18 source Energy card selections**, with custody confirmed before subsequent player decisions. All 38 complete native root ledgers (both modes, both cohorts) were **identical to the already archived pre-instrumentation native traces**, establishing the read-only extension did not change action order, physical pairing or native outcome.

This confirms physical discard setup under the pinned engine. It does **not** demonstrate a subsequent Extra Energy Bomb Ability, Energy attachment onto Raichu, Electro Rain attack, Prize trade, or a competitive win. Those actions remain absent from the observed source roots.

The source-only Item bridge leaves Supporter, Bench, Energy, Ability, Item-lock, opposing response, 25-minute clock and competing line priorities largely unresolved. The results are not a symmetric integrated policy, a full match evaluation or an estimated win rate. **Competitive-qualified games: zero.**

## Reproducibility and action

Files: [bridge implementation](../../simulation/twinleaf/agent1-raichu-actor-compressor-bridge.cjs), [paired runner](../../simulation/evaluation/agent1-rank17-actor-compressor-bridge-prospective.cjs), [source owner census](../../simulation/twinleaf/agent1-rank17-compressor-opportunity-census.cjs), pure tests `tests/agent1-raichu-actor-compressor-bridge.test.cjs` and `tests/agent1-rank17-actor-compressor-bridge-prospective.test.cjs`, pre-registration above. Reused the manual-only `agent1-rank17-ditto-prism-prospective.yml` workflow.

I [broadcast the underlying actor-root masking](../../communications/broadcast/20261103T0639Z_agent1_actor_pass_masks_native_source_tactics.md) and [notified Agent23 directly](../../communications/agent23/20261103T0642Z_agent1_joint_actor_hides_source_compressor.md). Joint policy selection should consider this valid owner-visible Item action as a selectable costed root, then validate real prompt payment, subsequent Bomb/attack availability, competing first-turn lines and opposing responses. Never promote an Item-root rate as a game-winning rate.
