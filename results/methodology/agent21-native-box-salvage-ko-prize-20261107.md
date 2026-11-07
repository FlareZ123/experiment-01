# Agent21: full native physical Secret Box → recovery Item → Basic → Hidden Power KO and Prize

**7 November 2026 UTC | two Item printings, two physical acting seats | successful staged pinned-Twinleaf controls only.**

## Evidence provenance

- [GitHub Actions successful run **42348618094**](https://github.com/FlareZ123/experiment-01/actions/runs/42348618094), research commit `8b0676990b3cc8ab08060e20c603abbafe08f5b3`, actual pinned Twinleaf submodule Git revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Node20.19; `npm ci`, `npm run compile`, then native Node test with exactly four cases.
- [Complete owner-physical path test](../../tests/agent21-box-salvage-attack-native.test.cjs) runs real `Store.dispatch`, original `PlayCardAction`, `ChooseCardsPrompt.validate`, original `ResolvePromptAction`, `ShowCardsPrompt`, `ShuffleDeckPrompt`, `AttackAction`, original `ChoosePrizePrompt` and forced original opponent `ChoosePokemonPrompt`. The native test was **4/4 PASS, 0 fail, 0 skipped** in 2.78 seconds.
- [Workflow](../../.github/workflows/agent21-staged-native-energy-retrieval.yml) was deliberately capped at 12 minutes, triggers only on owned test source changes or manual dispatch, with artifact retention 14 days.
- CI artifact ID **13564646801**, `agent21-staged-native-recovery-item-panel-42348618094`, includes four complete Node-TAP logs including `agent21-box-salvage-attack-native.log` alongside independent Energy Retrieval, Night Stretcher and owner-deck search-whiff proofs. Downloaded ZIP SHA-256 `abc15a9a126884d4e60eda337d78bb0f3a65960789929443bfc09a836bd625bd`.

## Real native physical action, four symmetric cases

The stage has exactly the necessary **physical objects** in the owner hand: `Secret Box TWM`, **two distinct `Battle VIP Pass FST`** and one `Rescue Carrier EVS`. Owner has `Unown AOR` Active with zero Energy, and two original `Psychic Energy MEE` already in discard. The owner deck contains one specified native Item, either `Energy Retrieval SVI` or `Night Stretcher SFA`, plus ordinary non-target cards. Opposing Active `Trubbish FST` is at 60 damage of 70 HP; a real opposing Benched `Lunatone OBF` is available to promote afterward. Six owner face-down Prize cards remain, and the other seat has six. Both players have deliberately synthetic decks and hands: **these are not legal randomly dealt copies of the printed sixty, nor faithful source-replayed original root93 boards**.

For each Item and physical owner seat 0/1, the staged test requires:

1. Native Secret Box accepts a three-card payment, then those **three original physical cards** actually move to owner discard; Box native owner-deck search selects one original `Energy Retrieval SVI` or one original `Night Stretcher SFA` object and completes ShowCards and ShuffleDeck.
2. That retrieved Item is played from owner hand; its native **owner-discard** `ChooseCardsPrompt` selects the original first Basic Psychic object, after true `prompt.validate([basic])`; its native reveal resolves, the Item ends in discard, the other original Basic remains in discard.
3. Owner makes the ordinary Energy hand attachment onto the **same original Active Unown**, with the same physical Basic object leaving hand and appearing in the attacking Pokémon's `energies.cards`.
4. Native `AttackAction(owner.id,'Hidden Power')` produces the 10 damage needed to KO the **original opponent Trubbish**; it and its cards enter opponent discard. Native forced opponent Bench promotion and original owner `ChoosePrizePrompt` finish with **six → five actual Prize cards**. The opponent's six Prizes remain unchanged.

| Item printing retrieved via Secret Box | Acting owner seat | Physical Basic ID returned and attached | Original opponent Trubbish ID KO | Own Prize cards |
| --- | --- | ---: | ---: | --- |
| Energy Retrieval SVI | 0 | 850008 | 850005 | **6 → 5** |
| Night Stretcher SFA | 0 | 851008 | 851005 | **6 → 5** |
| Energy Retrieval SVI | 1 | 860008 | 860005 | **6 → 5** |
| Night Stretcher SFA | 1 | 861008 | 861005 | **6 → 5** |

All four branches have a complete actual native physical receipt, without changing vendor source or injecting a fake effect result. This settles the previously untested **entire connector/Item/attachment/attack/Prize tactical pipeline**, beyond merely showing Item accessibility.

## Boundaries

The staged state was chosen to make the line possible: the opponent was already at exactly 10 remaining HP, no Item-lock rule intervened, and the owner had a physically payable three-card Secret Box hand, an unspent Energy attachment, real Basic Psychic in discard and a known Item in deck. It is therefore a **mechanical possibility proof**, not an unconditional estimate of how often such a position arises with either registered hypothetical sixty.

The original real root93 New Moon deck has **four Fog Crystal and zero of either recovery Item**. These tests have no legitimate right to rescore that frozen historical root using a card not in its printed 60. The two alternative [Energy Retrieval](../als/agent21-energy-retrieval-slot-english-proxy-60.json) and [Night Stretcher](../als/agent21-night-stretcher-carrier-fork-english-proxy-60.json) printed inventories are proposals only. Their exact K0 conditional search-access comparison is a separate mathematical hypothesis; it cannot convert staged ability to hit for 10 into demonstrated fixed-list full-field strength.

The native paper-eligibility caveat remains: Night Stretcher's `canPlay` incorrectly reports true for a **Special-only** owner discard, then its real `PlayCardAction` throws `CANNOT_PLAY_THIS_CARD` in both seats; the [12/12 native negative+positive tests](agent21-pinned-native-box-fog-search-whiff-20261107.md) have already confirmed this. Natural seat policy must veto unpayable, ineligible Item routes from its owner-visible information.

**No natural games, opponent full-turn credible responses, 32/32 source list validation, matchup rates, decision-policy competence sample, or credible 99.5% claim** arise from these four controls. A useful next step is an owner-only wrapper that picks and pays either recovery Item in legitimate new source-shuffled games, subject to ordinary Item/search/Supporter contention, recorded K0/K1 knowledge, multi-Prize collapse, and source reply. Preserve all paid-but-whiffed failures.
