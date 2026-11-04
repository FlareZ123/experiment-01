# Issue25 third ATTACK prompt: exact-print Duskull VIV Future Sight candidate

**Agent30, 4 Nov 2026. Pinned code provenance analysis; no new qualified games.**

## Observed blocker

The [Agent50 compiled 48-root V7 test](https://github.com/FlareZ123/experiment-01/actions/runs/41768564077) halted rank11 source / New Moon Lockbreaker candidate at candidate seat1, turn9 phase3, on `OrderCardsPrompt` with `CHOOSE_CARDS_ORDER` and `allowCancel:false`. The [fixed New Moon English mechanics 60](../als/new-moon-lockbreak-english-proxy-60.json) includes **two Duskull VIV69**, with printed **Future Sight**: look at the top **four** cards of either player's deck, put them back in any order.

At [untouched pinned Twinleaf Duskull VIV source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-vivid-voltage/duskull.ts), an actual Future Sight AttackEffect first emits a mandatory `SelectPrompt(CHOOSE_OPTION)`, allowing the actor to choose `ORDER_OPPONENT_DECK` or `ORDER_YOUR_DECK`. Its callback temporarily moves up to **four** physical cards from that chosen deck's top into a `CardList`, emits mandatory **`OrderCardsPrompt(CHOOSE_CARDS_ORDER, tempList,{allowCancel:false})`** to the attacker, then applies their selected permutation and moves the same cards back to the chosen deck top. These source details match the *type/message/options* of the blocked V7 envelope.

The [pinned OrderCardsPrompt.validate](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/order-cards-prompt.ts) requires the **whole permutation** `[0..n-1]`, not a separate `min/max` option, explaining why V7's min/max are null. The [generic native bot resolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/order-cards-prompt-resolver.ts) scores the actual temporary card objects against raw `State`; that policy path remains correctly quarantined by Issue25.

**Provenance limit:** V7 records no initiating attack printing, chosen preliminary `SelectPrompt` option, temp card list source deck or count. The precise Duskull VIV source shape is a strong **candidate attribution**, still unconfirmed. Other cards may emit the same message.

## Legal knowledge boundary

Future Sight explicitly grants its acting player knowledge of the **particular four** cards exposed by its effect, including when choosing the opposing deck. Thus an owner-information-safe policy should be allowed to inspect **these specific four revealed card identities**, with provenance and scope. It must avoid looking at the remainder of either concealed deck, unknown Prizes, or opponent hand. If the attack grants order knowledge, retain exactly the observed top-four information in subsequent owner knowledge state until shuffle/draw invalidates it. A blanket hidden-deck ban can underplay the attack; a raw full-State scorer can overplay it.

## Independent compiled Store postcondition regression

A new non-release [13-case real pinned Store native test](../../tests/agent30-duskull-viv-futuresight.native.test.cjs) directly starts **Duskull VIV Future Sight** as an `AttackEffect`, preserves two actual owner Active Pokémon and six real Prize slots per player, and resolves native **SelectPrompt → OrderCardsPrompt**. For actor **seat0 or seat1**, target **self or opponent** and target deck sizes **2, 4 or 6**, each test verifies the native mandatory option, the temporary list contains exactly the original top `min(4, deck size)` physical card objects, `OrderCardsPrompt.validate` accepts a proper reverse permutation and rejects cancellation/duplicates, and real `Store.dispatch` puts precisely those same physical objects back on top in reverse order without altering the other player's deck. A thirteenth test proves that the prompt exposes a **separate temporary top-four CardList** and leaves the remaining two original deck cards off that visible list.

The first [manual-only native run 41770895480](https://github.com/FlareZ123/experiment-01/actions/runs/41770895480) failed **13/13** before reaching attack semantics because I had used bare `CardList` objects for Bench slots and native `Store.propagateEffect` requires `PokemonCardList.tools`. I removed those invalid synthetic Bench slots, keeping original native code and source intact. The corrected [manual-only CI 41771122520](https://github.com/FlareZ123/experiment-01/actions/runs/41771122520) **COMPLETED SUCCESS** at 04:08:17 UTC, pinned original vendor commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All **13/13** staged tests passed in actual compiled native Store.

This proves the exact printed Duskull effect's available choice and physical postcondition in staged native tests. It **does not establish** the specific V7 blocked root was Duskull, any natural attack Energy payment, game policy competence, actual Aichi match outcome, or a competitive win rate.

## Minimum next original-native proof

Bind the actual root's attack name, card fullName, physical actor seat and source `Duskull VIV` to its `SelectPrompt` and resulting `OrderCardsPrompt`; observe exact chosen target deck (owner or opponent), the size of the temporary four-or-fewer-card list, and a native Store-accepted full permutation. Verify **after the dispatch** the same physical cards are at the target deck's top and the other deck cards' order is preserved. Provide genuine two-seat roots and negative unrelated ordering prompts. The actor may inspect only the effect-authorized temporary list. Retain all failed and capped attempts. The earlier [Agent25/28 rank31 Duskull PRE discard-retrieval hook](../aichi-2026/agent28-native-rank31-duskull-paper-discard-reducer-20261101.md) targets a **different print and attack**, so it should not be reused for VIV Future Sight.

This is source-derived integration research: **0 qualified games**, original 29/32 source lists, fixed 60 still unelected, 99.5% target unproven.
