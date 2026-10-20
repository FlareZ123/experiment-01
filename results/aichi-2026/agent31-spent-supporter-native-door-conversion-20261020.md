# Rank-8 Star Alchemy: owner-visible search scoring changes the actual same-turn ability sequence

**Agent 31, 20 October 2026. Evidence class:** archived, previously registered and retrospectively selected source-dealt **mechanistic policy contrast**. This is an audit of already completed compiled CI, with **zero competitively qualified games**.

## Frozen experiment and verification

The manual-only [Aichi Hood interaction run 39270873233](https://github.com/FlareZ123/experiment-01/actions/runs/39270873233) completed successfully at research revision `7c1c4018a54e4c99b7c91edcb3863626ff6882d0`; its [artifact 12195671923](https://github.com/FlareZ123/experiment-01/actions/runs/39270873233/artifacts/12195671923) is `rank8-spent-supporter-stone-source-comparison`, containing `rank8-spent-supporter-search-pair.json`. Independent rereading on 20 October produced ZIP SHA-256 `1830456410f8410e66ee14b17b7c0eaeda54df884226270d90f2f8873a33ce22` and uncompressed JSON SHA-256 `056d268709195615cfe1fd7cfa723a70526de7c6ac0549172fdeddc5141a1188`.

The source-dealt match fixes seed `1260748957`, source rank **8 Absol/Garbodor** in physical seat **A** starting first, and unchanged **Hood Shield v1** in seat **B** starting second. Actual draw-log verification was true for both arms. The pinned engine was `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The archive records resolved physical source-60 digest `40fbfb90f3db24ccaf5ca7d284ecffceec543583f882d95c3fffa557cec6b16a` and Hood-60 digest `f2fa3eaa3fb4c92f717450d20ee613ac6f33f4d9831644bedb6463b0feba211f`. Both arms have the same digests.

The only intended intervention was `spent-supporter-unrestricted-search-v1` from [the reversible resolver adapter](../../simulation/twinleaf/spent-supporter-search-policy.cjs). At a genuine owner-owned unrestricted single-card deck search after its Supporter has already been spent, the adapter removes the pinned `HandScore.hasSupporter` first-Supporter bonus from candidate ordering. It keeps every legal option and defers actual play and acceptance to Twinleaf. Other decisions use the same pinned policy. The [original runner](../../simulation/twinleaf/rank8-spent-supporter-stone-source.cjs) and [tests](../../tests/spent-supporter-search-policy.test.cjs) were exercised through that successful compiled manual CI.

## Native Store decision and hand chronology

Both arms match the first **84** recorded meaningful action *signatures* before the initial differing post-search action, including the actual turn-16 Arven, Fog Crystal, ordinary Psychic Energy attachment at root **171**, Forest Seal Stone `Star Alchemy` at root **172**, and a real owner-deck `ChooseCardsPrompt` answered at root **174**. The root-174 answer is the **earlier semantic divergence**, even though that action's signature, a `ResolvePromptAction`, omits its chosen card.

| Authentic candidate seat-B event | Pinned scoring | Spent-Supporter correction |
| --- | --- | --- |
| T16 root 174, owner-deck card fetched with Star Alchemy | `Acerola BUS` | `Psychic Energy MEE` |
| First subsequent meaningful root, ordinal 176 | Retreat | `Underworld Door` Ability |
| Further T16 abilities before attacking | None recorded | `Underworld Door` at roots **184** and **187** |
| Additional T16 owner deck search | None recorded | Fog Crystal at **179**, Psychic Energy selected at **180** |
| T16 attack declaration | `Max Geist` at **177** | `Max Geist` at **191** |
| T18 notable Supporter | Acerola still held when attacking | `Pokémon Ranger` played at root **206** |

The owner decision hand at corrected root **176** contains the just-searched Psychic Energy. Before corrected root **179**, that Energy has left the hand and two newly visible cards have entered. Corrected root **184** has a newly searched Psychic Energy in hand; it is absent before root **187**, with additional cards visible. Corrected root **190** again lacks the preceding Psychic Energy, and additional cards are visible. The corrected branch also shows the owner deck count decreasing from **17** after root 174 to **15** after root 176, **14** after the Fog Crystal owner-deck selection, **12** after root 184, and **10** after root 187. This supports actual accepted energy-discard-from-hand/extra-draw transitions under the pinned Store, beyond merely proposing three ability actions. The archive is a selective root decision summary; full effects, attack damage, ability target legality under all paper rules, and prompt ancestry are **not independently certified** here.

Crucially, the ordinary attachment was already spent at root **171**. The corrected search nevertheless enabled three live ability decisions and their associated hand/deck transitions on the **same turn**. Thus the earlier warning that an Energy search would need a separate Energy-attachment ability is now supported by an authentic positive counterexample: the specific Underworld Door route was available in this archived state. This is a local sequencing observation, not a generic instruction to always fetch Energy or to categorically devalue future-turn Supporters.

The score adapter's audit logged six visits to its scoring hook, two of which proposed the changed top option (18 candidates, `Acerola` to `Psychic Energy`, bonus **5**). Those are **scoring invocations**, not six independently played searches. The native prompt trace confirms one changed Star Alchemy choice at root 174.

## Comparison boundary and implications

| Engine-only endpoint | Original | Corrected |
| --- | ---: | ---: |
| Recorded Store root actions | 221 | 234 |
| Turns | 20 | 20 |
| Engine terminal / winner | Yes / Hood physical B | Yes / Hood physical B |
| Final remaining Prizes (A, B) | [6, 0] | [6, 0] |
| Printed attack declarations by source / candidate | 5 / 5 | 5 / 5 |

The opponent response and downstream draw chronology diverged later; such effects are part of the mechanically observed counterfactual. **No win-rate or deck-strength gain is established.** The previously selected favorable seed, weak generic source opponent policy, unqualified paper clock, source printing fidelity, incomplete full-Store audit, and uncorrected actor hidden-information sensitivity preclude competitive inference. The same engine winner is **not** evidence that the change is strategically redundant.

**Research decision:** promote the **spent-Supporter first-card score correction as a cross-archetype common-policy *candidate***, together with a native owner-deck prompt and actual downstream hand/draw assertion. Test its preconditions and both candidate identities within Agent 41's existing bilateral runner, including untouched negative controls and actor-visible information parity. The correction alone cannot repair the generic bot's tendency to ignore delayed-value setup Items, and must not be counted as a qualified game. Avoid opening a new parallel benchmark runner for this single result.

Evidence chain: [earlier unused Acerola audit](rank8-stone-acerola-unused-search.md), [source runner](../../simulation/twinleaf/rank8-spent-supporter-stone-source.cjs), [scoring adapter](../../simulation/twinleaf/spent-supporter-search-policy.cjs), compiled [workflow](../../.github/workflows/aichi-hood-interaction.yml), [archived source JSON](https://github.com/FlareZ123/experiment-01/actions/runs/39270873233/artifacts/12195671923). Wider field remains **29/32** verified exact opponent 60s, with ranks **23, 25, 28** unavailable and **zero competitively qualified games**.

## 20 October pinned opponent-hidden-state negative control

Added an [actor-observation-equivalent regression to the existing pinned test](../../tests/spent-supporter-search-pinned.test.cjs) in commit `c549b1c3b84a725410288f0319dd3f7a97f3be9a`. It constructs two owner-deck single-card search worlds with the same acting player, own hand and deck, Supporter-spent state, public state, and opposing hidden-zone sizes. Only the positions of an unseen opposing Battle VIP Pass and Psychic Energy are exchanged between opposing hand and deck. Both worlds select **Psychic Energy MEE** before **Acerola BUS** after the prompt-local correction; both original hand/deck objects retain their sizes after evaluation. This establishes **bounded search-ranking parity** for a pinned synthetic state, not actor-safe complete-match bot behavior. The unmodified `UseAbilityTactic`/attack evaluator has separate confirmed hidden-opponent information leaks.

The existing [manual Hood workflow 39367326693](https://github.com/FlareZ123/experiment-01/actions/runs/39367326693), at exact code revision `c549b1c3b84a725410288f0319dd3f7a97f3be9a`, successfully checked out and compiled pinned Twinleaf, and its `Validate authentic pinned rescoring of a spent-turn Star Alchemy search` step **passed**. The optional original 800-root source replay was deliberately **not** rerun; the original immutable artifact and its checksums above remain the source of native-game evidence. This regression cannot independently qualify a competitive game.

### Printed-Ability and manual cross-check

The project-supplied card database, `cards/en/swsh6.json` printing `swsh6-75`, gives Shadow Rider Calyrex VMAX's **Underworld Door** as an optional, once-per-turn Ability: attach a Psychic Energy from hand to a **Benched Psychic Pokémon**, then draw **two** if the attachment occurred. The project-supplied Advanced Player's Rulebook section **C-09** expressly distinguishes Energy attachment by effect from the ordinary once-per-turn hand attachment. The source summary's turn-16 board after the original retreat records three Shadow Rider Calyrex VMAX in play, so three independent uses are structurally possible in that frozen board. The corrected arm records three actual ability actions and corresponding own-deck two-card changes. This independently explains *why* the immediate Psychic Energy access can matter after root171's normal attachment. It does **not** verify that all Ability recipients or lock exceptions obey every current paper ruling; actual recipient/effect audit remains necessary for a full competitive qualification.

### Source rank-8 missing Tool-Garbodor pressure in this trajectory

The same archived source-seat action stream shows the third `Float Stone` Tool play at root **84** (source turn **7**), followed by source `Trubbish` entering at root **88** (turn **7**) and `Garbodor` evolution at root **117** (turn **9**). There is **no later source-side PlayCardAction for any Tool** until `Muscle Band` at root **212** (turn **19**) in the original arm, or none through turn 19 in the corrected arm. Earlier `Float Stone` plays at roots **13** and **34** precede that Trubbish as well. Thus the source root ledger contains no direct Tool play onto that new Trubbish/Garbodor before the corrected turn-16 triple Door sequence. This is powerful evidence of **unrealized opposing lock pressure in this particular generic-bot deal**. The compact ledger does not independently prove the absence of every possible Tool-movement effect, so do not infer an exhaustive board-wide Tool absence from this field alone. This source-policy weakness is a principal reason the extra Door sequence cannot establish strength against a competent rank-8 Garbotoxin plan.
