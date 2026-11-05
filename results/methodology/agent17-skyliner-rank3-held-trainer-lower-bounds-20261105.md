# Skyliner winner-flip opponent: minimum held Trainer inventory at three unanswered Passes

**Agent 17 | 5 November 2026 | retrospective source-locked native archive and original source inventory.** This is a strict *hand-content category lower bound*. It is **not** evidence of a legal/beneficial alternative, qualified adversarial play, a tournament-valid win, or a deck ranking.

## Why this matters

The frozen original rank3 Snorlax Stall versus original rank1 Shadow Rider Calyrex A/B/A experiment [recorded one native winner reversal](agent2-original-skyliner-free-pivot-native-winner-reversal-20261105.md) after a single Store-accepted Skyliner free retreat at native turn58. In treatment B the rank1 seat subsequently declared six Night Watch attacks, while rank3 on turns59/61/63/65/67 passed after zero attacks and zero retreats. The [5 November Critic release veto](../../communications/broadcast/2026-11/20261105T224932Z_critic_native_winner_flip_opponent_frontier_release_veto.md) requests a source-owner-visible opportunity audit of these five opponent turns.

An independently verifiable fact in the **existing** archived sidecar changes the level of scrutiny warranted: three of those Pass turns have accepted card plays with *high zero-based indices into rank3's actual hand*. The original rank3 [authenticated fixed 60](../aichi-2026/full-decklists.json) contains **44 Trainers, 11 Pokémon and 5 Energy**.

## Immutable inputs and read-only method

- Registered actual [native A/B/A run 42095956147, artifact 13447532878](https://github.com/FlareZ123/experiment-01/actions/runs/42095956147/artifacts/13447532878): downloaded ZIP SHA256 **140ba95c81fd14bf2c501c839f979896f27553acfbfe340e44b3ff70427aa499**.
- Internal **agent2-original-skyliner-free-retreat-aba.json**, 1,391,059 bytes; SHA256 **9173b3146ff2f55f9fdb648604fb81249fff26e6039a7b203e906c0525eb95ca**.
- Select **seed3792360798, rank3 actual seat0, rank1 actual seat1, mode bilateral-skyliner-free-retreat**, one original B native terminal. Pinned vendor a9905a76a6c4103ba4b6cb9a49e86bad795c5c05; no Store reruns, game changes or new seeds.
- The archived \`nativeAcceptedTargetSidecar\` records \`rootOrdinalLinked=true\`, a \`storeAccepted=true\` receipt, \`declared.handIndex\`, and \`declared.ownerHandPrinting\`. The [native observer](../../simulation/twinleaf/native-accepted-target-sidecar.cjs) captures \`handIndex\` directly from the typed PlayCardAction and reads \`state.players[seat].hand.cards[action.handIndex]\` **before actual Store dispatch**. This is a true index into the actor's hand; the root ledger proves each observed non-Trainer play was followed immediately by Pass with no intervening action.
- [Reproduction script](../../scripts/agent17-skyliner-postpivot-pass-hand-bound.cjs) has fail-closed source-60 count, rank/seat/mode, unique accepted event/root linkage, non-Trainer card identity and intervening-root checks. [Three regression tests](../../tests/agent17-skyliner-postpivot-pass-hand-bound.test.cjs) passed locally under Node, including rejection of unaccepted/intervening events. The actual archived JSON was run locally with a rank3 source-count/three-print mirror checked against the published manifest; the script itself loads the real repository manifest for future exact checkout reproductions. Full-repository CI execution is not claimed.

The original 60 has only **16 total non-Trainers**. If an accepted non-Trainer card play cites hand index \`i\` (zero based), the hand held at least \`i+1\` cards immediately before. After that single card is played, at least \`i\` cards remain and no more than **15** can be non-Trainers, because that just-played card is no longer in hand. Therefore the hand at the immediately following Pass must have at least **max(0, i - 15) Trainer cards**. This proof uses no assumption about what was Prized, drawn, discarded on older turns or currently playable.

## Actual owner-hand category bounds

| Rank3 turn | Native root: accepted play → Pass | Store accepted printing | 0-based preplay hand index | Minimum cards still held at Pass | **Minimum Trainers still held at Pass** |
| --- | --- | --- | ---: | ---: | ---: |
| **59** | 226 → 227 | Water Energy MEE | 27 | 27 | **12** |
| **61** | 239 → 240 | Girafarig LOT | 20 | 20 | **5** |
| **63** | Pass 251 | No direct accepted-play index witness | — | Unknown | **Not independently bounded here** |
| **65** | Pass 263 | No direct accepted-play index witness | — | Unknown | **Not independently bounded here** |
| **67** | 281 → 282 | Mimikyu PAL | 21 | 21 | **6** |

The conservative values are **simultaneously consistent** with the 44-Trainer/16-non-Trainer fixed 60 and the archived native action receipts. The bounds deliberately do not assume that previously played Water Energy, Girafarig or other cards stayed outside the hand on subsequent turns. Those assumptions might tighten the bounds, but require additional physical custody evidence.

This same treatment game contains six actual rank1 **Night Watch** AttackAction roots and **six linked ChooseCardsPrompt** entries. Their existence is observable; the root ledger does not independently certify the two-card *random selection* required by the printed Night Watch effect. This creates another paper-fidelity question without proving that any individual selection or damage outcome was wrong.

## Qualification consequence and exact next audit requirement

These three Passes cannot be described as arising from **empty hands** or **absence of Trainer cards**. They **can** have been reasonable given current locks, timing, Supporter quotas, attached Tools, available targets, hand composition, discard costs or opponent strategy. The archived sidecar does not expose exact owner-hand contents at those Pass roots, full paper-payable alternatives, accepted/rejected proposal traces or evidence that any specific Trainer was useful. It therefore does **not** distinguish a legal no-op from a missed actionable opportunity.

To resolve Critic's five-turn opponent-response question, record for **each** rank3 Pass in a frozen prospective same-physical-deal replay: an independent observation of *that actor's own* hand, public Active/Bench, currently available quotas, locks, targets and paper-payment resources; the actual policy proposal and corresponding native Store reception/rejection; any better admissible action and its counterfactual consequence. The observer must not supply opposing concealed information to either decision policy. Maintain original A/B/A records and seed/physical deal provenance; leave all unobserved or uncertified alternatives labelled **not independently verified**.

**Decision state unchanged:** one genuine developmental native winner flip, **zero competitively qualified games**, no selected fixed 60, missing full Aichi rank23/25/28 historical inventories, and no demonstrated 99.5% field win rate.
