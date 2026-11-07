# Mysterious Treasure FLI: pending prompts explain apparent Item non-discard

**Agent 46 | 7 November 2026 | paper Expanded, Black & White onward.**

## Verdict

**The earlier `itemDiscarded:false` was an incomplete native prompt observation, not a demonstrated paper-fidelity defect.** The same pinned Twinleaf Store physically moves original printed Mysterious Treasure FLI from the temporary `supporter` play zone to its owner's discard pile after the remaining native reveal, shuffle, and wait prompts settle. This was verified in **both owner seat orientations**, with all seven zone snapshots and no unresolved prompts.

This is a *staged Item-resolution correctness witness*, not a qualified full paper game, an assessment of decision quality, a deck ranking, or a win-rate estimate.

## Primary evidence and revisions

- Source card: supplied English card database `sm6-113`: discard one card from hand; if paid, search for Psychic/Dragon Pokémon, reveal, add to hand, then shuffle deck. The uploaded Advanced Player's Rulebook, section I.B-01, explains that used Items are discarded. This means the Item's destination must be judged after resolution, not during pending prompts.
- Original native engine pinned in the shared repository: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No vendor edits were made.
- Existing original probe: `simulation/twinleaf/agent49-mysterious-treasure-native-probe.cjs`, original stage with Mysterious Treasure FLI and two Psychic Energy SVE in hand; native optional search selects Regidrago V SIT from the owner deck.
- The existing 5 November native observer workflow [42115177540](https://github.com/FlareZ123/experiment-01/actions/runs/42115177540) succeeded, but its probe returned with outstanding `ShowCardsPrompt` and `ShuffleDeckPrompt`. The Item remained in the temporary `supporter` zone then. Thus the reported `itemDiscarded:false` was a prefix-state observation.
- Commit `63b6e846e420ed2a037d34c3cccf7d8886862ae2`: optional `runSeat(seat,{afterSearch:fn})` callback in Agent49's staged probe, preserving original ordinary call behavior.
- Commit `06b4f868b937a14412f87bd814b286c69c8c41af`: opt-in final native prompt continuation in `simulation/twinleaf/agent46-treasure-cleanup-native-observer.cjs`, with observation of real accepted Store dispatches and physical card identity.
- Actual compiled native regression: [GitHub Actions 42321230214](https://github.com/FlareZ123/experiment-01/actions/runs/42321230214), head `06b4f868`, workflow `.github/workflows/aichi-raichu-electro-rain.yml`, **SUCCESS**. The existing paper-portfolio payment test, original two-seat native payment/search test, and the completed Item-cleanup observer all passed. The observer outputs `AGENT46_MYSTERIOUS_TREASURE_ITEM_CLEANUP` schema v2.

## Physical native custody per tested seat

Identical zone outcomes in seats **0 and 1**:

| Accepted staged dispatch | Outstanding unresolved prompt(s) after dispatch | Mysterious Treasure owner zone |
| --- | --- | --- |
| Before Item root | none | Hand |
| `PlayCardAction` | `ChooseCardsPrompt` payment | Temporary `supporter` |
| `ResolvePromptAction` payment (one Psychic Energy) | `ChooseCardsPrompt` search | Temporary `supporter` |
| `ResolvePromptAction` deck search (Regidrago V SIT) | `ShowCardsPrompt`, `ShuffleDeckPrompt` | Temporary `supporter` |
| `ResolvePromptAction` reveal (`true`) | `ShuffleDeckPrompt` | Temporary `supporter` |
| `ResolvePromptAction` shuffle order | `WaitPrompt` | Temporary `supporter` |
| `ResolvePromptAction` wait (`null`) | none | **Owner discard pile** |

Each seat: **6 accepted fixture dispatches**, 7 snapshots including pre-root, two owner-Pokémon-card search/payment prompt resolves, three final reveal/shuffle/wait prompt resolves. Both ended `itemInOwnerDiscard:true`, `itemInTemporaryPlayZone:false`, `unresolvedPrompts:0`. One original Psychic Energy was physically discarded and Regidrago V SIT entered the owner's hand before continuation, as verified by the existing native probe. The later observer does not change source choices.

The `rootIndex` retained on the historical observer's snapshot rows means *fixture-relative dispatch index*, **not** a certified full-game root ordinal. The new v2 envelope marks `actualGameRootOrdinalsClaimed:false`.

## Scope and limitations

The continuation responds to genuine pinned native prompts, checked by each real native prompt validator. It supplies an identity permutation to `ShuffleDeckPrompt` for **deterministic cleanup isolation**; this is intentionally not a randomized paper shuffle and is marked `printedShufflePaperCertified:false`. No inference is made about the random distribution of subsequent draws. The original game-state staging is synthetic and the experiment does not demonstrate a natural original-source dealt game, opponent decision quality, turn-by-turn attack economy, or the official 25-minute match clock.

The evidence is narrow but decisive for the earlier claim: **do not label a Trainer's temporary play-zone residency as final retention while prompts remain unresolved**. A completed prompt chain is required before auditing post-effect Item discard.

## Implications for the full Aichi objective

The existing common paper-payment portfolio applies to Mysterious Treasure FLI, with **37 source copies across 10 of the 29 authenticated original name/count sixties** as counted in prior repository research. The present staged result removes an *unsupported* suspected Item-cleanup blocker for that card, without promoting any current deck or shared policy to game qualification.

The field still has 29/32 authenticated 60-card name/count inventories (ranks 23/25/28 missing), zero competitively qualified original-source games and no demonstrated 99.5% win rate. Reuse this completed-prompt classification on other Trainer-zone audits when it materially affects a release. Continue to preserve payment fidelity, real physical ownership, full-game prompt resolution, opponent replies, policy quality, and field-level uncertainty separately.
