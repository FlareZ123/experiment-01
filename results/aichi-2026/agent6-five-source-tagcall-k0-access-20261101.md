# Five Aichi original 60s with Tag Call + Guzma & Hala: exact first-turn K0 accessibility

**Agent 6 | 1 November 2026 | exact combinatorial census, no gameplay win model.**

## Source basis

The [29 authenticated original Top32 sixties](full-decklists.json) contain exactly **five** paired Tag Call and Guzma & Hala decks: ranks **2, 6, 15, 24 and 29**. Their Basic counts come from the repository's printing-specific [stage census](../../scripts/aichi-field-mulligan-census.cjs), rather than species-name guesses.

The earlier [rank6 exact opening-seven, six-Prize, first-draw study](agent6-rank6-firstdraw-tagcall-prize-joint-20261101.md) established the mathematical event and independently tested its integer arithmetic. This extension evaluates that same physical condition in every recovered source deck with both cards.

| Rank | Archetype | Printed Basics | Tag Call | Guzma & Hala | Thunder Mountain |
| --- | --- | ---: | ---: | ---: | ---: |
| 2 | Vileplume Control | 14 | 4 | 4 | 0 |
| 6 | Iron Thorns | 4 | 2 | 2 | 1 |
| 15 | Lopunny Vileplume | 14 | 4 | 3 | 0 |
| 24 | Iron Thorns | 4 | 2 | 2 | 1 |
| 29 | Iron Thorns | 4 | 2 | 2 | 1 |

## Source-exact opening-location results

All rates condition on a Basic-valid random seven, six subsequent random Prizes, and one ordinary first-turn draw while going first. There are no opponent-mulligan bonus draws, search/draw effects, opponent interventions or extra action assumptions.

| Rank | Tag held | Tag held, no G&H held | Above, G&H deck-searchable and any singleton Thunder not Prized | Conditional success among Tag/no-G&H |
| --- | ---: | ---: | ---: | ---: |
| 2 | **43.04716350%** | **26.02982948%** | **26.02838725%** | **99.99445932%** |
| 6 | **22.93036105%** | **18.26681947%** | **16.19989649%** | **88.68482286%** |
| 15 | **43.04716350%** | **29.63351003%** | **29.60669237%** | **99.90950226%** |
| 24 | **22.93036105%** | **18.26681947%** | **16.19989649%** | **88.68482286%** |
| 29 | **22.93036105%** | **18.26681947%** | **16.19989649%** | **88.68482286%** |

Ranks 2 and 15 have zero Thunder Mountain, so their last availability condition tests G&H searchability alone. For the three Iron Thorns lists, the last condition also requires their singleton Thunder Mountain to be outside Prizes. The ranks 6, 24 and 29 share the same five-category physical quantities and hence have identical exact opening-location probabilities despite potentially different subsequent play decisions.

The four-Tag ranks hold Tag in 43.05% of valid first-turn hands, whereas the two-Tag ranks hold one in 22.93%. The rank2 source's four G&H copies make the all-G&H-Prized obstruction exceptionally rare. Rank15 has three copies and a larger but still small complete target Prize obstruction. The rank6/24/29 one-of Thunder is a much stronger additional blocker. The genuine earlier [rank6 native K1 Tag Call witness](agent6-source-first-tagcall-native-six-deal-20261030.md) identified one exactly Prized Thunder in a retrospectively selected source deal, which is a mechanics example rather than an independent prevalence estimate.

## Relevance to the shared decision system

The [owner-only actor-root Tag Call proposal and authenticated owner-deck search selector](../../simulation/twinleaf/agent6-owner-tagcall-hala-offer.cjs) provides a narrowly specified possible action. It checks the acting player's own registered 60, actual held Tag, G&H already held, Item lock and visible spent copies. Before an authenticated owner search, it never asserts that a particular deck card is accessible. Once a genuine Tag Call root-to-prompt native receipt is verified, the K1 component may choose a visible G&H target. These functions remain **standalone offers**, with native dispatch and same-root arbitration still to be integrated by Agent41.

The mathematical event is card-location feasibility, **not** a recommendation to play Tag Call immediately. A first-player turn-one G&H must be banked for later. Search competition, Supporter quota, two-card discard affordability, lock pressure, active-side win conditions, the opponent's reply and next-turn draw change the value. A successful G&H search can still fail the desired attacking or lock plan.

## Reproduction and qualification

The [source-locked five-deck census](../../scripts/aichi-tagcall-five-source-firstdraw.cjs) uses all 29 exact source 60s, their full printed Basic stage inventory, and the previously tested BigInt enumerator. The [five additional source/percentage tests](../../tests/aichi-tagcall-five-source-firstdraw.test.cjs) compare against separately calculated Python integer enumeration results. The existing manual statistics workflow includes these checks and was triggered at creation; report update will attach its final outcome. No new scheduled workflow or push trigger was created.

**Research strength status remains 29/32 exact source sixties, zero competitively qualified games, and no evidence establishing the 99.5% single-fixed-deck objective.**
