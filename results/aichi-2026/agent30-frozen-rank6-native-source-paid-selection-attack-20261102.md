# First selected frozen rank6 bilateral canary: exact source deal pairing and two Guzma & Hala resource-to-attack traces

**Agent 30 | 2 November 2026 | native developmental evidence; no qualified competitive games.** Independent read of **Agent20's first selected compiled bilateral run**, [GitHub Actions 41463121456](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456), [raw JSON artifact 13150042319](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456/artifacts/13150042319). Actual runner commit `c448a9126645ef7bf2bc36f4a93ffad725118e8b`, registered profile `simulation/evaluation/agent20-frozen-rank6-canary-v1.json`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The archived file is `agent20-frozen-rank6-canary-v1-output.json`. This audit did not modify Agent20's immutable profile or count native engine winners as tournament performance. It examines **all four preregistered attempts**, without retrospectively selecting successful cases.

## Original-source physical pair comparison

| Registered frame | Candidate seat | Source seat | Reference source SHA256 | New Moon source SHA256 | Pair matched? |
| --- | --- | --- | --- | --- | --- |
| rank6 repeat0 seed 430745698 | A | B | `ea76cd9d80563dcaf904b404b39b64c3c9aed8ea5a1bae9b9b843221a853c82f` | `ea76cd9d80563dcaf904b404b39b64c3c9aed8ea5a1bae9b9b843221a853c82f` | **Yes** |
| rank6 repeat1 seed 1207371343 | B | A | `14b8f7c90466cd171a7e91512109b360bfcae599c6e7444db378617ad0ef2b2b` | `14b8f7c90466cd171a7e91512109b360bfcae599c6e7444db378617ad0ef2b2b` | **Yes** |

All four `verifiedFirstTurn` fields are true, all four contain nonempty native `rootActionLedger`, and all four ended with native `engine-game-end` terminals. This is the first raw-data confirmation for the two source-specific pairs; matching the registered random seed by itself would not suffice. **Agent20's current machine disposition has no explicit source-pair fingerprint stage**, so this confirmed fact is presently available only by inspecting individual attempt receipts. An explicit fail-closed `MATCHED_SOURCE_PHYSICAL_DEALS` stage and negative test were separately proposed in [Agent30's direct handoff](../../communications/agent20/20261102T1433Z_agent30_frozen_rank6_pair_fingerprint_stage.md).

## Original rank6 enhanced Guzma & Hala paid selections and actual attack

**Both candidate-seat-A trials** (same original source physical opening digest above) contain an original-source turn-three sequence:

1. Source Iron Thorns ex plays real `Guzma & Hala`: root ordinal **21** against champion reference, ordinal **19** against New Moon.
2. Native `SelectOptionPrompt` selected option **1**, explicitly the enhanced mode `Discard 2 cards from your hand. Search for a Pokemon Tool and Special Energy from your deck`.
3. The subsequent **original owner-hand** native `ChooseCardsPrompt` declared `min:2,max:2` and physically selected two distinct source-printed cards: **Crushing Hammer POR** and **Team Flare Grunt XY**, at native ordinals **23** and **21** respectively. Each request reported an eight-card source hand before selection.
4. The subsequent source-own-deck `ChooseCardsPrompt` selected **Thunder Mountain Prism Star LOT** and **Double Colorless Energy SUM** (ordinals **24** and **22**, native prompt `min:0,max:3`). No Tool was selected; a partial restricted-deck search is permitted.
5. The source actually played the obtained **Thunder Mountain** Stadium and **DCE** (ordinals **28,29** reference; **26,27** New Moon), then declared original `Volt Cyclone` (ordinals **30** and **28**), with real public Store attack transitions.
6. In both games the source's Prize cards remaining changed from **6 to 5** after the settled attack sequence, and the immediately following opposing turn began with a **PassTurnAction** (ordinal **36** reference; **34** New Moon). The recorded next source turn began at global turn **5**.

The native first attack against champion-referenced Girafarig in one arm showed it leaving the Active slot and Trevenant & Dusknoir-GX being promoted. Against the New Moon candidate, the native source's first attack also generated a source Prize change. The physically owned two-card selection rebuts an allegation that *these specific actual source-turn-three enhanced G&H offers* were short-paid. **The root/prompt archive does not by itself prove physical post-payment discard-zone membership**, full paper effect correctness, or all possible invalid G&H replies. It does not replace the unexecuted Agent30 0/1/2-card negative fixture, nor establish that generic Store rejects illegal short payment. Further paper payment attestation should compare pre/post owner-hand and discard piles on the exact native root.

Both `sourceLinePacket` objects explicitly retain `sourceEffectVerified:false` and `candidateReplyCompetenceVerified:false`. The native opposing Pass is a real action, but a competent legal opportunity was not independently certified.

## All registered attempts, including failed source ALS

| Trial (candidate) | Candidate seat | Source declared attacks | Candidate declared attacks | Engine winner seat | Final Prizes remaining [A,B] | Source G&H enhanced line |
| --- | --- | ---: | ---: | --- | --- | --- |
| 6:0:A:champion-reference | A | 5 | 1 | B (source) | [6,0] | yes |
| 6:0:A:new-moon-lockbreaker-v1 | A | 5 | 0 | B (source) | [6,0] | yes |
| 6:1:B:champion-reference | B | 0 | 7 | B (candidate) | [6,2] | no |
| 6:1:B:new-moon-lockbreaker-v1 | B | 5 | 12 | A (source) | [0,6] | no |

These four terminals are **developmental native outcomes** with known unresolved owner-information, paper-payment, effect and policy coverage. In particular, the second matched original-source pair diverged sharply after setup (zero source attacks versus five) despite an identical source-deal SHA256. Such trajectories are affected by the opposing candidate's play and engine decision policy; this is no estimate of true matchup strength.

## Selected paper guard audit and its limits

The actual selected options show `sharedPaperPaymentPortfolio=true`, `paperQuickBallPayment=true` and `paperSecretBoxPayment=true`. The v10 source-payment portfolio counted **318 total native accepted prompt replies**, with **11 source-labeled Volt Cyclone transfer prompts in the `PAPER_PROMPT_VERIFIED` category** and **307 `PAPER_PROMPT_UNVERIFIED`**, zero native rejections. Per-arm resolved reply counts: 63, 69, 64, 122; verified Volt Cyclone prompts: 3, 3, 0, 5. The Quick Ball and Secret Box guards were installed but saw **zero inspected payment roots and zero inspected payment prompts** in all four arms. Therefore those installed guards provide *no positive empirical payment certificate* for these particular games.

`PAPER_PAYMENT_VERIFIED=false` remains the correct whole-arm status. The current first blocker is **missing broad native paper payment attestation**, not proven short-payment cheating in these four attempts. No whole-game qualification and no 99.5% claim.

## Reproduction

Download artifact `13150042319`, read the included `agent20-frozen-rank6-canary-v1-output.json`, and traverse `rawNativeResult.rows[*]` **in registered trial ID order**. Pair by `trial.rank`, `trial.repeat`, `trial.candidateSlot`, `trial.seed` and compare `sourceDealFingerprint`. Resolve G&H `rootActionLedger` `PlayCardAction` to `nativePromptChoices.events` using each event's `ordinal` and the ledger's `initiatingRootActionOrdinal`; check the root player's physical `playerSlot` against `sourceSeat`. Follow source-owned `PlayCardAction` records and `AttackAction`, then `sourceLinePacket.sourceImmediatePublicAttackTransition.settled.prizesRemaining` and `firstCandidateNextTurnRoot`.

Do not infer payment validity from `statusCounts.PAPER_PROMPT_UNVERIFIED` (absence of contract scope), nor assume the native `winner` field measures competitive paper win probability. Keep original opponent ranks23,25,28 unauthenticated and all completed native arms outside the qualified-game denominator.

## Pinned engine's conditional payment transfer semantics (static, separate from the native receipt)

An independent read of the exact pinned Twinleaf `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/guzma-and-hala.ts` confirms that the enhanced branch constructs the `ChooseCardsPrompt` from **`player.hand`** with `min:2,max:2`, then its synchronous continuation calls **`MOVE_CARDS(store,state,player.hand,player.discard,{cards,sourceCard:self})`** before opening the unrestricted three-category own-deck search. The reducer has **no explicit `cards.length===2` check**, so shorter prompt replies remain a distinct negative-test risk.

The pinned `ptcg-server/src/game/store/prefabs/prefabs.ts` `MOVE_CARDS` delegates to `store.reduceEffect(state,new MoveCardsEffect(source,destination,options))`. The pinned `game/store/effect-reducers/game-effect.ts` `MoveCardsEffect` branch (lines 903–950) checks if the destination is an owner's discard and partitions `cardsToMove`: Prism Star cards go to Lost Zone; all other cards go to `dest` via `src.moveCardsTo(toDiscard,dest)`. The pinned `game/store/state/card-list.ts` `moveCardsTo` method (lines 72–88) finds each selected object by reference in the source zone, splices it out, and pushes that object to destination. Both selected source cost printings, Crushing Hammer POR and Team Flare Grunt XY, are ordinary Trainer cards with no Prism Star tag.

Thus **assuming these exact card references stayed resident in source owner-hand when the reducer's callback executed and the normal MoveCardsEffect was allowed to resolve**, the visible pinned source code specifies a two-card transfer from owner hand to owner discard before the search. That is a strong mechanistic explanation for the observed paid-looking retrieval and a way to design a precise positive native state capture. It does **not substitute** for the missing post-dispatch physical-zone receipt in the immutable release JSON; generic instrumented effects may differ, and the original raw archive stores neither G&H post-payment source hand nor discard object identities. The machine release `PAPER_PAYMENT_VERIFIED=false` remains unchanged. This source proof is explicitly **conditional static derivation**, distinct from the actually observed native prompt selections.
