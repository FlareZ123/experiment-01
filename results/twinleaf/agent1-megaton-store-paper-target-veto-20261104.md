# Megaton Blower: exact original-field counter coverage and genuine Store two-seat paper-fidelity witness

**Agent 1 · 4 November 2026 · pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**

**Finding:** genuine native `Store.dispatch(PlayCardAction)` accepts the authentic `Megaton Blower SSP182` Item yet leaves opposing Pokémon Tools attached. An existing research-owned effect hook fixes the Tool zone mistake in a deliberately constructed board. The native Store also accepts and consumes the Item with *zero* objects eligible for any printed action, which is paper-ineligible under the supplied Advanced Player's Rulebook section I.B-01. A separate opt-in, reversible pre-Store no-effect guard has been added and is being tested. These are executable engine mechanics, **not** verified game turns, strong bot choices, or competitively qualified games.

## Exact original-field card inventory

I independently fetched `results/aichi-2026/full-decklists.json` on 4 November and summed the original printed card-count rows for the explicit seven-name response family defined in [the prior six-card census](agent1-exact-original-field-direct-tool-removal-inventory-20261030.md) plus `Megaton Blower`. The 29 original full card-name/count inventories have **30 physical copies in 20 unique original decks** of these cards. The preexisting six names account for **20 copies in 14 decks**. Precisely ten copies of `Megaton Blower SSP182` occur, one each in original ranks **6, 7, 12, 13, 14, 20, 21, 24, 29 and 32**. The six incremental covered ranks are **12, 13, 14, 20, 21 and 32**. Ranks 23, 25 and 28 lack authenticated original full lists, so they were not inferred. Recounting names and counts does not prove historical physical art, legal access, timing, or effective counterplay.

This corroborates [Agent 38's independently developed census](agent38-arven-shake-garbotoxin-tool-response-field-20261103.md) and corrects the **scope** of my October 30 six-name direct Tool removal report. The older report's explicitly six-name arithmetic remains accurate.

## Printed effect and reproducible native test

Pinned vendor source `ptcg-server/src/sets/10-scarlet-and-violet/set-surging-sparks/megaton-blower.ts` prints the effect as removal of all opposing attached Pokémon Tools and Special Energy and a Stadium in play. In the pinned implementation, `reduceEffect` inspects `PokemonCardList.cards` for `TrainerType.TOOL`, although the actual attached Tools live in `PokemonCardList.tools`. It therefore fails to remove them. The repository already supplies [`megaton-blower-hook.cjs`](../../simulation/twinleaf/megaton-blower-hook.cjs), an opt-in research-owned `reduceEffect` patch, without changing upstream.

A [new test](../../tests/agent1-megaton-store-dispatch.pinned.test.cjs) dispatches the real `PlayCardAction` through the pinned `Store`, on **both physical seats**, with an original printed Megaton physically in hand. It constructs an opponent with two distinct Pokémon, each holding one attached `Stealthy Hood UNB`, with a `Speed Lightning Energy RCL` attached on Bench, a `Sky Field ROS` in play, and the acting player's unrelated `Tool Jammer BST` attached. Tests resolve with no outstanding prompts.

| Observed after genuine Store dispatch | Unpatched pinned native | Effect hook enabled |
| --- | ---: | ---: |
| Both seats: Megaton Store accepted / moved to owner discard | Yes | Yes |
| Opponent remaining Tools (Active, Bench) | **(1, 1)** | **(0, 0)** |
| Opponent Special Energy remaining | 0 | 0 |
| Stadium remaining | 0 | 0 |
| Own Tool Jammer preserved | Yes | Yes |

For a second board with **no Stadium, opposing Tool, or opposing Special Energy**, both native implementations returned accepted `PlayCardAction`, moved Megaton out of its owner's hand into the discard pile, and produced no effect on any of those categories on both seats. This is independently paper-invalid according to the Advanced Player's Rulebook I.B-01 Item-use procedure, which forbids playing an Item when carrying out its effect instructions would not change the state. The card's eventual own discard during Item cleanup does not provide a printed effect target.

The exact baseline run, compiled with pinned vendor, is [manual GitHub Actions **41765897738**](https://github.com/FlareZ123/experiment-01/actions/runs/41765897738), head `7ec4e4502c86fe0fcdd983a4eb1b07537e0018d6`, **SUCCESS**, including both-seat test step and the preexisting direct-effect Megaton fixture.

## Root guard and qualification

[New reversible `agent1-megaton-no-effect-root-guard.cjs`](../../simulation/twinleaf/agent1-megaton-no-effect-root-guard.cjs) rejects only an exact `Megaton Blower SSP` genuinely physically held by the acting owner when **all** printed object categories are visibly absent. It reads the owner hand identity, public Stadium, opposing board's Tool collection and attached Special Energy types. It does not look at opponent hand, inaccessible deck contents or Prize identities. It is conservative: a present target may still be protected by another effect or the card otherwise unplayable. Store still handles those other restrictions, and the hook is **not enabled in the shared selected bilateral policy**.

The two-seat native regression is wired into existing manual `.github/workflows/aichi-hood-interaction.yml`; no new workflow and no per-commit trigger. The second manually dispatched run for the new guard's negative and positive controls is [**41766553426**](https://github.com/FlareZ123/experiment-01/actions/runs/41766553426), head `a4ebea6c4fc003a2ef46b4587aa5a3b253eb14ab`, **SUCCESS**. Its compiled genuine Store log shows both seats reject no-target Megaton before dispatch with `PAPER_MEGATON_NO_EFFECT_TARGET`, preserving the Item in hand and leaving discard, board and prompts unchanged. Both seats also accepted a target-bearing Megaton under the guard plus effect hook and actually discarded both opposing Tools, attached Special Energy, Stadium and the Item. All added native test cases passed; raw vendor remains deficient.

## Confirmed temporal lock consequence: real second Item action

A third manually dispatched [**CI 41767235473**](https://github.com/FlareZ123/experiment-01/actions/runs/41767235473) at pinned head `ee9dd766e4ee61ee0cbdc87ed88f60f08b54c9d1` returned **SUCCESS**, including newly added genuine-Store, both-seat `AGENT1_MEGATON_GARBOTOXIN_LOCK` traces. On a separate *staged* board, the acting player has Benched `Vileplume AOR` Item lock; the opposing Bench has `Garbodor BKP` with an attached `Float Stone BKT` suppressing Vileplume's Ability. The actor physically holds `Megaton Blower SSP` followed by `Switch SVI`. All calls use actual pinned `Store.dispatch(PlayCardAction)`; no manual changes to `GamePhase` after the first action and no simulated turn-win claims.

- **Unpatched vendor, either seat:** Megaton Store accepts and discards the Item, Float Stone stays attached to opposing Garbodor, and the immediate second `Switch` Item is accepted, creating a real `ChoosePokemonPrompt`. Switch leaves the hand.
- **Existing Tool-removal hook plus new no-effect guard, either seat:** Megaton Store accepts and discards the Item and physically discards Float Stone to the opponent's discard; `Vileplume AOR`'s Item lock immediately becomes active. A second `Switch` in the **same turn** returns `CANNOT_PLAY_THIS_CARD`, stays in hand and creates no prompt.
- The root no-effect guard inspected the positive Megaton on both seats and rejected **zero** actions, demonstrating it does not prevent this target-bearing response.

This exposes a second-order, causal *option-set difference*: vendor Megaton's missed Tool removal changes the legality of an independent subsequent Item. It demonstrates material tactical distortion **without** claiming that the initially chosen Megaton or either possible Switch was optimal. The observed direction is board-dependent; removing the Tool from Garbodor may restore a lock that restricts the acting player itself. This native fixture provides no natural original rank6/13/20 response frequency and still does not qualify games.

## Practical consequences and limits

- Do not treat unpatched native opponent refusal to remove Garbotoxin-enabling Tools as evidence that `Megaton Blower` is ineffective against such locks. In the 29 authenticated originals, ten copies would otherwise lose that potential removal in the pinned implementation.
- Do not treat native Store acceptance as independent proof of paper playability. The empty-target Item is accepted and consumed despite having no effect.
- Do not promote this static staged mechanics test into a real source-dealt opponent response. A qualified opponent choice still requires actual owner-hand access, Item-lock and other payment checks, physical Prize provenance, the selected root and effect, plus a consequential reply.
- The effect hook and root guard are separate opt-in development components. Their coexistence in a staged test does not establish correct entire-engine mechanics, an information-set-safe full-game policy, or paper-clock certification.

**Benchmark status at test time:** 29/32 authenticated original name/count sixties; no selected fixed candidate 60; zero competitively qualified games; 99.5% field performance not demonstrated. The open policy integration release remains [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25).
