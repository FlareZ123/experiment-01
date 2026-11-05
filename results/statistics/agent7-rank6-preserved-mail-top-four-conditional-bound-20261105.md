# Agent 7: original rank-6 preserved Trainers' Mail, exact conditional top-four category-hit lower bound

**5 November 2026.** Mathematical conditional bound using the authenticated rank-6 printed name/count 60. This is a resource-access calculation only. **Zero competitively qualified games, zero verified turn-five Mail settlements in this new continuation, no selected final fixed 60.**

## Reproducible source and state

- `results/aichi-2026/full-decklists.json`, original rank6 Iron Thorns (Kazuma Kashi): 60 cards, **48 Trainers**, including **3 Trainers' Mail ROS**, plus 4 Pokémon and 8 Energy. Accordingly 45 Trainers qualify under Mail's printed exclusion of another Trainers' Mail. The **15** nonhits comprise 4 Pokémon, 8 Energy and 3 Mail.
- `results/aichi-2026/2026-11/agent7-rank6-plumeria-payment-mail-vs-enhancedhammer-native-20261105.md`, compiled native CI [42084142754](https://github.com/FlareZ123/experiment-01/actions/runs/42084142754): historical exact initial trial `6:100:A:champion-reference` source turn3 real Plumeria discards Enhanced Hammer plus one Mail, removing candidate's attached Psychic. At source turn5, **42 owner deck cards** remain, another Mail is preserved in hand, and the source bot chooses Pass. The source was previously observed with Iron Thorns ex Active and a Speed Lightning attached. The prior report does not independently reveal the remaining deck's exact four top cards.

## Model and exact results

For `N` cards in the surviving deck, `B` cards ineligible for Mail's Trainer category, and a uniformly randomized unseen top-four order, the chance the top four contain **at least one** eligible Trainer is

`P(category hit | N, B) = 1 - C(B,4) / C(N,4)`.

A bound independent of specifically identifying outside-deck ineligibles uses `N=42`, `B<=15`:

`P >= 1 - C(15,4)/C(42,4) = 81/82 = 98.78048780487805%.`

The **stronger conditional** bound applies if all four previously observed nonhits are still physically outside the deck at the turn-five opportunity: one Active Iron Thorns ex, its Speed Lightning, the Mail paid to Plumeria in discard, and the distinct retained Mail in hand. Then `B<=11` and

`P >= 1 - C(11,4)/C(42,4) = 3720/3731 = 99.70517287590458%.`

Both percentages assume exchangeability of the residual deck order. They guarantee no particular good Trainer and no strategic payoff. A specific physical deck order can still produce a top-four miss; known hidden deck information or shuffle correlations can invalidate the uniform-order interpretation. These are conditional lower bounds on the **probability of a category hit**, rather than paper-playability, a useful search, a native resolution, an actual attack, or a competitive win.

## Proposed executable falsification

The new default-off `actorOwnerMailAfterPass` option delegates to the existing owner-visible `simulation/twinleaf/agent9-native-owner-mail-after-pass.cjs` using each actor's own original printed 60. `simulation/evaluation/agent7-preserved-mail-turn5-original48-aba.cjs` registers A/B/A across the steward's original eight rank6/rank11 trials, with the same Plumeria payment in all arms and the Mail continuation in B only. It asserts physical opening and starting-seat parity and repeated-control public-root equality, and preserves errors/caps. Native receipt fields include accepted Mail, genuine Mail prompt, selected Trainer actually moved into hand, paid Plumeria, and the next opposing root if observed. Tests: `tests/agent7-rank6-preserved-mail-hit-bound.test.cjs`, `tests/agent7-preserved-mail-original48-aba.test.cjs`, `tests/agent7-preserved-mail-original48-aba.native.test.cjs`. Existing manual `twinleaf-completion.yml` flag invokes the tests.

**Status at publication:** code and tests committed, **native test not dispatched or compiled** in this incarnation, so the source T5 Mail opportunity and result are still hypotheses requiring actual Store verification. The older compiled Plumeria witness alone does not establish that Mail will ever be played, find anything, or improve the real game outcome. No Aichi field-performance estimate is licensed by this bound.
