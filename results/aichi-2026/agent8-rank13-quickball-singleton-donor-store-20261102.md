# Rank-13 original Regidrago: singleton evolved-Dragon Quick Ball payment

**Agent 8 | 2 November 2026 | conditional real-Store six-scenario certificate; no match win evidence**

## Research question

The exact published Aichi rank-13 Hiromu Sasaki Regidrago 60 contains 3 Quick Ball FST, 4 Regidrago V SIT and one each of three evolved Dragon attack payloads: Salamence ex JTG, Dragapult ex TWM, Noivern ex PAL. The existing default-off `chooseQuickBallRootIntent` in `simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs` only offers the Item when another non-Quick-Ball hand printing is duplicated, a deliberately conservative discard-cost guard. This ignores a strategically plausible owner-hand circumstance: discarding an evolved Dragon payload can finance the search for the first Regidrago V and put that payload in the discard pile for a later Apex Dragon.

Agent 47 first identified and enumerated this exact exclusion in [direct mailbox](../../communications/agent8/20261102T0238Z_agent47_quickball_preboard_dragon_donor_gap.md), with further nine-source census in `agents/agent47/memory.md`. The selector is opt-in and its null answer does not prove that generic native fallback fails to play Quick Ball. Nor does payment alone establish that discarding a singleton Dragon is tactically best.

## Independently reproduced opening-seven opportunity denominator

For **the exact original rank-13 printed 60**, define the conservative exclusion event on a uniformly distributed seven-card opening hand as:

- No Regidrago V;
- at least one of the three singleton evolved Dragon donors;
- at least one Quick Ball;
- at least one other Basic Pokémon capable of making the initial seven valid;
- no repeated printing outside Quick Ball.

The registered list has 11 Basic Pokémon, so the count of seven-card hands containing a Basic is exactly `C(60,7) - C(49,7) = 300,306,336`.

I independently recomputed Agent 47's numerator from the exact rank-13 printed grouping with a degree-7 generating polynomial. Exclude Regidrago V, treat each non-Quick-Ball printing with multiplicity `n_i` as factor `(1+n_i*x)`, and use `((1+x)^3-1)` for the mandatory Quick Ball(s). Inclusion-exclusion requires at least one evolved donor and one other Basic. The resulting coefficient is exactly **10,392,235**, or **3.4605447019% of Basic-valid opening seven-card hands**. This independent numerical agreement replicates the preexisting Agent47 opportunity characterization. The event is a *selector exclusion condition* and does not account for prize distributions, native follow-through, alternate root actions, opponent counterplay or whether a copy of Regidrago V remains searchable.

## New pure owner-only decision component

[New development selector](../../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs) `chooseRegidragoDonorQuickBall(view)` reads only detached owner hand, public board, available Bench and public action locks. When no Regidrago V is in hand or already in play, Quick Ball and an evolved donor are held, and no redundant alternative card is present, it emits a root intent specifying the Item and the proposed donor. It leaves the preexisting duplicate-first selector untouched; it cannot inspect concealed Prize contents or owner deck order.

[Pure regression tests](../../tests/agent8-regidrago-quickball-donor-frontier.test.cjs) verify all three donor printings, already-held/board Regidrago veto, duplicate alternative priority, Item/Pokémon play locks, full Bench, empty deck and hidden-info perturbation invariance.

The selector currently remains **a development-only, unintegrated proposal**. The frozen two-seat decision profile and normal game policy do not invoke it. The captured donor intent must eventually be linked to an authenticated hand discard prompt and Basic search, with a real alternate-root comparison, before any native autonomous policy change.

## Six fully settled native chain fixtures

[Successful manually dispatched CI 41379657223](https://github.com/FlareZ123/experiment-01/actions/runs/41379657223), under pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compiled the actual native Store and passed the native [six-case certificate](../../tests/agent8-rank13-quickball-dragon-donor-native.test.cjs):

| Physical acting seat | Donor | Actual native outcome |
| --- | --- | --- |
| 0 | Salamence ex JTG | discard, search Regidrago V, Bench accepted |
| 0 | Dragapult ex TWM | discard, search Regidrago V, Bench accepted |
| 0 | Noivern ex PAL | discard, search Regidrago V, Bench accepted |
| 1 | Salamence ex JTG | discard, search Regidrago V, Bench accepted |
| 1 | Dragapult ex TWM | discard, search Regidrago V, Bench accepted |
| 1 | Noivern ex PAL | discard, search Regidrago V, Bench accepted |

In every case, the staged owner hand contains Quick Ball FST, that donor and one Grass Energy; the owner's native deck contains a physical Regidrago V SIT. The test first confirms the old duplicate-only selector returns `null` and the new owner-only intent identifies the proposed donor. It dispatches the actual `PlayCardAction`, resolves the genuine native `ChooseCardsPrompt` for the donor discard, resolves the native deck search for physical Regidrago V, satisfies the native `ShuffleDeckPrompt` with a complete index permutation, and accepts a real Bench `PlayCardAction` for the searched Basic. The donor and Quick Ball actually enter the discard pile. Both original and supplemental AOR Item-lock test steps passed in this manual job.

**Fixture limitation:** this constructed stage uses real printed cards and native reducer actions but does not reproduce a randomly dealt original source-60 game, an exact natural owner-turn opportunity, K0/K1 Prize inference, adversarial source continuation or the official paper tournament clock. Its shuffle is a valid deterministic permutation, not sampled gameplay randomness. Six passing fixtures are action-availability evidence, **zero qualified games**.

Two earlier CI attempts for this new code failed and were corrected: a newly authored test-string parse error in [41379152780](https://github.com/FlareZ123/experiment-01/actions/runs/41379152780), and a `ShuffleDeckPrompt` requiring an index permutation rather than `null` in [41379368483](https://github.com/FlareZ123/experiment-01/actions/runs/41379368483). The eventual passing test uses the pinned `CardList.applyOrder` contract. No vendor edits were made.

## Next discriminating experiment

Under a source-13-authenticated, both-seat original-game policy, observe naturally dealt source-hand opportunities without looking at Prize cards. Compare (a) actual owner-visible alternative connector uses and discard costs, (b) actual Store payment and owner deck-search result, and (c) whether Regidrago V can be benched and eventually empowered to attack, with an intervening competent opponent turn. Preregister fresh physical source deals before measuring, retain all unmatched setups, errors and capped games, and do not promote these fixtures to field-level win-rate evidence.

The project remains at **29/32 authentic original opposing 60s and zero competitive-qualified game results**. The 99.5% fixed-deck target is unverified.
