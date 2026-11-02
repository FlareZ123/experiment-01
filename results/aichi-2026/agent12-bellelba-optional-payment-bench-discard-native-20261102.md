# Original Aichi Bellelba & Brycen-Man: zero-, one-, and two-card optional payments illegally discard Pokémon from both Benches

**Agent 12, 2 November 2026.** Experimental class: actual compiled pinned Twinleaf Store, deliberately prepared printed-card state, symmetric both physical source seats. **This is a paper-fidelity falsifier and local adapter repair, not a match win or an original 60-card game.** All field win-count evidence remains **0 competitively qualified games**.

## Printed-paper contract and original-field relevance

The official [Cosmic Eclipse 186 card text](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm12/186) states: base effect discards the top three cards of each player's deck. The additional Bench-reduction effect is explicitly conditional on the owner discarding **three other cards from hand**; the opponent chooses Bench removals first. The advanced player's rulebook section **E-20** requires `Do X. If you do, do Y` to be satisfied before its dependent effect.

The project original source roster `results/aichi-2026/full-decklists.json` contains this exact CEC 186 printing **once in each** of ranks **2 Takahiro Ando / Vileplume Control, 7 Hiroto Fuji / Snorlax Stall, and 24 Ryoya Fujii / Iron Thorns**. They are 3 of 29 recovered authentic source sixties. Missing ranks 23/25/28 cannot be assumed to lack it. Neither the number of hands that could actually use this Supporter nor the frequency of the optional mode in human games is known.

## Reproducible native test

[Pinned GitHub Actions run 41477902022](https://github.com/FlareZ123/experiment-01/actions/runs/41477902022) passed the [10-case native test](../../tests/agent12-bellelba-optional-payment-native.test.cjs) using the [actual Store driver](../../simulation/twinleaf/agent12-bellelba-optional-payment-native.cjs) at pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research test commit `779aea1c608ff75eaa77edc615ee1a17f2f5a31f`.

For each physical seat 0 and 1, the owner had real `Snorlax PGO` Active, four genuine original-rank7 printed Basic Pokémon on its Bench and ordinary source Trainer hand pieces. The opposite physical player had `Shadow Rider Calyrex V CRE` Active and four physical Benched Shadow Rider V. Both native decks started with seven actual Energy objects. The source played the genuine `Bellelba & Brycen-Man CEC` from its hand through `Store.dispatch(new PlayCardAction(...))` and accepted its `ConfirmPrompt` branch. The native cost `ChooseCardsPrompt` declared `min:3,max:3`. Its reply was a subset of zero, one, two or three **actual source-hand card objects**. The supplied cost prompt's `validate(reply,state)` and the subsequent real `Store.dispatch(new ResolvePromptAction(...))` were evaluated separately. All subsequent native opponent-first `ChoosePokemonPrompt` decisions were physically resolved. Before/after hand, both decks, Bench slots and discard piles were checked by identity.

| Other hand cards physically submitted | Native cost prompt validates | Native cost-resolution error | Owner paid physical cards | Source Bench | Opposing Bench | Outcome |
| ---: | --- | --- | ---: | --- | --- | --- |
| 0 | false | none | 0 | 4 to **3** | 4 to **3** | **Illegal free Bench discard** |
| 1 | false | none | 1 | 4 to **3** | 4 to **3** | **Illegal underpaid Bench discard** |
| 2 | false | none | 2 | 4 to **3** | 4 to **3** | **Illegal underpaid Bench discard** |
| 3 | true | none | 3 | 4 to **3** | 4 to **3** | Legal cost branch |
| 2 from hand containing only 2 other cards | false | none | 2 | 4 to **3** | 4 to **3** | **Unaffordable branch incorrectly offered and taken** |

**Every row was independently executed in both physical seats.** All ten native attempts passed their explicit expected engine-witness tests. In each, original-hand cost card references ended in their proper destination for the actual offered count; one genuine Pokémon object on each Bench ended in its owner's discard; both decks went 7 to 4; all prompt chains completed and had zero remaining pending prompts. The positive control is especially important: the card's legal branch was genuinely executable, and native payment-length validator correctly differentiated three from fewer. This is a **silent acceptance problem beyond validation**, rather than a malformed test selector.

### Mechanism in pinned source code

The pinned `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/bellelba-and-brycen-man.ts` reduces `ChooseCardsPrompt` for `min:3,max:3`, but its prompt callback uses `cards = cards || []`, moves `cards` to the owner's discard, and directly proceeds to the Bench-discard prompts, **without checking `cards.length === 3`**. Native Store accepts even a prompt result rejected by the prompt's standalone validator.

A separate source-level eligibility error exists: `cannotDiscardFromHand` is computed as `player.hand.cards.length <= 2` while the Supporter itself is still in the hand. The code then moves the Supporter out before opening its three-other-card prompt, so a starting hand of **only the Supporter plus two cards** incorrectly enables the optional branch. The real Store two-card-hand controls reproduced this second bug in both seats.

These engine failures can remove strategically protected Bench Pokémon without the discard cost that paper play requires, so any candidate/opponent simulations letting such outcomes through cannot certify paper match strength.

## Adapter-level remediation, separated from the fixture

[Default-off reversible guard](../../simulation/twinleaf/agent12-bellelba-paper-optional-payment-guard.cjs) checks that a `true` optional confirmation has at least three *other* cards after the Supporter leaves hand, and that payment `ResolvePromptAction` submits exactly three distinct physical owner-hand cards offered in its original pending prompt. It targets the genuine Bellelba owner Supporter zone, `ConfirmPrompt` and `ChooseCardsPrompt` signatures. Other card effects are left untouched. [Pure test](../../tests/agent12-bellelba-paper-optional-payment-guard.test.cjs) covers 0/1/2, alien, duplicate and valid references and reinstatement of the original Store method. [Native guard test](../../tests/agent12-bellelba-optional-guarded-native.test.cjs) covers both physical seats. **Compiled guard certification:** [manual Actions run 41478578460](https://github.com/FlareZ123/experiment-01/actions/runs/41478578460) **SUCCESS**, pinned vendor unchanged. Three pure guard regression tests and three native test cases passed with no test failures. The ten additional guarded native staged variants consisted of six submitted 0/1/2-card payments (all vetoed before physical Bench movement; both Benches stayed 4), two exact 3-card valid payments (both accepted, both Benches became 3), and two unaffordable two-other-card confirmations (both vetoed before cost prompt, both Benches stayed 4). Each tested both real owner seats, while the three-card top-deck mill settled regardless. Invalid attempts intentionally leave their original native prompt pending; a paper-valid owner policy must decline the optional branch or supply three eligible cards instead of retrying the same invalid answer. The guard restores the original Store dispatch descriptor after each fixture.

Do not silently enable this hook in the existing immutable first common-policy four-arm source profiles. A new release requires per-card paper payment witness, full physical post-state, owner-only selection, opponent continuation, original source deal and a paper-clock context. The [broadcast](../../communications/broadcast/20261102T1610Z_agent12_bellelba-bench-cost-native-two-seat-veto.md) communicates the defect to source-policy integration owners.

## Qualification and next falsifier

This experiment constructs a legal partial game state with original printed card identities and uses true pinned Store payment, effect and physical-zone transitions. It does not draw and evolve two actual competing full-sixties independently, establish the natural incidence of Bellelba underpayment, model competent two-player choices, certify every card interaction, or resolve the official 25-minute paper clock. Sample denominator is **ten constructed native cases**, not ten competitive attempts. The complete-field total remains **29/32 exact opponent lists, zero competitively qualified games**.

A meaningful next test uses a newly registered real original-rank2/rank7/rank24 source-dealt hand, selects the conditional optional root under owner-visible policy only when three cards are disposable, and audits actual three owner-hand discards plus genuine opponent choice and continuation. Alternate paper-valid responses must remain available; no tactical value or win-rate estimate follows from the constructed deficit alone.
