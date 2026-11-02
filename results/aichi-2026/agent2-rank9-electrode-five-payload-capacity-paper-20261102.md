# Original rank-9 Electrode-GX: seven-card inventory creates a **full-five payload** conflict, not an Ability ban

**Agent 2 | 2 November 2026 | direct printed-card / official Q&A finding plus reanalysis of archived genuine Store traces | zero qualified competitive games**

## Correction that changes the interpretation

The exact authenticated Shun Ito rank-9 Aichi printed 60 contains **seven physical Energy cards**: four Prism Energy ASC216, two Darkness Energy MEE15 and one Telepathic Psychic Energy POR88. Electrode-GX CES48's **Extra Energy Bomb** names five *Energy cards* from the discard pile. Five is the full intended payload, with one physical Special Energy counted as one card, regardless of how many units it provides.

**Authoritative paper exception:** The official [Japanese Pokémon card Q&A for マルマインGX / Extra Energy Bomb](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AB%E3%83%9E%E3%82%A4%E3%83%B3GX&regulation_faq_main_item1=all) explicitly answers **YES** when there are **four or fewer Energy cards** in the owner's discard pile: the effect attaches the cards present. A second answer explicitly rejects deliberately choosing **four when five are available**: with five there, all five must be attached. The provided *Advanced Player's Rulebook* v3.4, Section II-A, likewise requires the closest possible number when insufficient objects exist. The Q&A additionally forbids using the Ability when there are no eligible recipients, and disallows using Energy on the Electrode-GX itself that enters discard **because of its own Knock Out** in the same Ability.

Therefore **it would be wrong to call Extra Energy Bomb legally unplayable simply because fewer than five Energy remain in discard**. This report's capacity bound concerns only the **maximum obtainable immediate transfer count** while preserving previously attached physical cards. Its conclusions never veto a legal smaller positive transfer or justify feeding an underpaid prompt when five are actually in discard. The zero-discard boundary, legal targets, two-Prize self-KO, effect ordering and opponent response still demand their own checks.

The existing opt-in [Electrode Energy hook](../../simulation/twinleaf/electrode-gx-energy-hook.cjs) already sets its prompt's mandatory selection count to `Math.min(5, available.length)`; a prepared fixture with five Energy requiring five transfers is consistent with the official Q&A. No correction to that existing count rule is proposed.

## Exact seven-card resource bound

Let `a` be the count of **original owner's seven physical Energy cards currently attached to Pokémon**. Until a separate legal action releases one of those attached cards, no more than `7 - a` of that owner's Energy cards can be in discard, even granting perfect access to all unknown deck/hand/Prize cards. Consequently the **maximum possible full-packet size** is `min(5, 7 - a)`.

| Already attached physical Energy cards `a` | Optimistic maximum discard cards | Maximum Extra Energy Bomb cards transferable without first releasing attachments | Full five-card transfer possible? |
| ---: | ---: | ---: | --- |
| 0 | 7 | 5 | Yes |
| 1 | 6 | 5 | Yes |
| 2 | 5 | 5 | Yes |
| **3** | **4** | **4** | **No, but a partial transfer can be legal** |
| 4 | 3 | 3 | No |
| 5 | 2 | 2 | No |
| 6 | 1 | 1 | No |
| 7 | 0 | 0 | No; zero-transfer semantics separately unresolved |

Known Prized Energy, inaccessible deck contents or Energy retained in hand make the actual discard count lower. At a public `a = 2`, a third hand attachment reduces the optimistic full-Bomb potential from five to four. This is a **resource allocation opportunity cost**. It may be rational to make the attachment anyway when it establishes a payable Mega Absol attack and does not require gifting the opponent two Prizes through Electrode's self-KO.

The source has two genuinely different plans requiring comparison: **manually fund Mega Absol and Retreat into a charged attacker**, or **assemble a discard packet for Electrode acceleration** (possibly less than five when economically justified). Mechanically combining every superficially useful funding and Bomb action without a state-dependent objective risks lowering the available full-packet size. This is *not* proof that either line should dominate.

Reusable read-only owner-public calculator: [`agent2-rank9-bomb-capacity.cjs`](../../simulation/twinleaf/agent2-rank9-bomb-capacity.cjs). Five no-vendor pure tests: [`agent2-rank9-bomb-capacity.test.cjs`](../../tests/agent2-rank9-bomb-capacity.test.cjs). The calculator is an optimistic upper bound, not an activation legality oracle or policy hook. It does not read opponent hand, hidden Prize identities, or original owner's unseen deck.

## Historical native-state check, with exact provenance

Reanalyzed the **unchanged** 16-game native [Agent10 four-arm rank-9 funding × Retreat factorial](agent10-rank9-funding-retreat-factorial-native-20261102.md), [compiled run 41484853603](https://github.com/FlareZ123/experiment-01/actions/runs/41484853603), [raw artifact 13161291631](https://github.com/FlareZ123/experiment-01/actions/runs/41484853603/artifacts/13161291631), inner JSON SHA-256 `281baf5b862f35a2237cad9172d376e3275fa5f1572c0795f7f4519938890049`. Across the four exact physical pairings under each of four policies, **0/16 source games recorded an accepted Battle Compressor card root and 0/16 an accepted Extra Energy Bomb Ability root**. These are historical, correlated developmental attempts and do not establish source optimality or overall prevalence.

The affected original-source seat-B versus New Moon candidate seat-A **interaction** arm on seed `3060075246` contains genuine Store accepted owner-public target sidecar receipts:

- Global turn **2**, ordinal **16**: one physical Prism Energy attached to source Active Voltorb.
- Turn **4**, ordinal **30**: Telepathic Psychic Energy attached to source Benched Mega Absol. Two original Energy cards now attached across source board, leaving an optimistic five-card full-Bomb discard window.
- Turn **14**, ordinal **68**: a second physical Prism Energy attached to Mega Absol, while the original Active line still has one Prism. At least **three** original Energy cards are attached, so a full five-card Bomb transfer is now impossible until a card leaves an attachment.
- Turn **32**, ordinal **143**: a third physical Energy (Darkness) attached to Mega Absol. The source Active Electrode still holds one Prism, giving **four attached** immediately before the next action; a potential full Bomb packet is capped at three.
- Turn **32**, ordinal **144**: source pays a real ordinary Retreat from Electrode to Mega Absol, moving Electrode to Bench with zero attached Energy and Mega Absol to Active with three attached. That permits at most four other physical Energy cards in discard, still less than five. The exact physical discard destination of the retreat payment was not independently certified.
- Turn **32**, ordinal **145** and subsequent prompt: source genuinely attacks with Claw of Darkness, takes a Prize, and the next opponent turn begins. This is the already-reported developmental payoff; no revised engine winner claim follows.

Separately reanalyzed Agent10's original [passive owner-only four-deal Bomb frontier](../../simulation/twinleaf/agent10-rank9-extra-energy-bomb-owner-frontier.cjs), [compiled run 41443205730](https://github.com/FlareZ123/experiment-01/actions/runs/41443205730), [artifact 13140534230](https://github.com/FlareZ123/experiment-01/actions/runs/41443205730/artifacts/13140534230). **27 correlated original-source first owner-root snapshots** had both Electrode-GX and the eligible modern Mega Absol ex physically in play. All 27 showed **zero discarded Energy**. Nineteen of those snapshots held Battle Compressor, and all 27 held Secret Box. This describes **unexercised resource-discard access**, not proof that their current hand could pay the necessary Item discard, access five immediate discard Energy, or justify a two-Prize self-KO. The separate factorial traces did not exercise Battle Compressor at all.

## Concrete next falsifiable integration test

In a fresh externally registered symmetric two-seat rank-9 comparison, preserve identical physical deals and candidate/opponent 60s while testing **a mutually exclusive manual-attachment/Retreat plan versus discard-packet/Ability plan**. For each actual owner decision, log all physical Energy card zones (including Prizes once knowledge is legitimate), printed Energy recipients, held Item payments and competing connector uses, native root and all prompts, card-count transfers of `min(5, actual discard availability)`, the self-KO two-Prize cost, subsequent Claw or alternative attack, and a competent opponent's continuation. Prevent any score from treating full-five as possible with three existing attachments, or treating a legal **one-to-four** transfer as an automatic paper violation. If zero Energy is in discard, handle that as a separate exact ruling and effect-state case.

This finding constrains **strategy representation and paper legality**. It does **not** supply an independent native comparison, new source-qualified outcome, selected final 60 or competitive win rate. Repository field status remains **29/32 authenticated original source lists and zero qualified paper games**.
