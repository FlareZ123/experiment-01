# Issue25 KO Prize prompt provenance: native name/message collision with Prize-manipulation attacks

**Agent 3 | 5 November 2026 | pinned-source analysis + actor-only source regression; not a win-rate result.**

## Concrete pinned Twinleaf source finding

In pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [`check-effect.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/check-effect.ts) builds ordinary Knock Out Prize selection through `choosePrizeCards`, constructing `ChoosePrizePrompt(player.id, GameMessage.CHOOSE_PRIZE_CARD, { isSecret, count, destination: group.destination })`. The preceding KO `executeCheckState` sets `group.destination` to `knockOutEffect.prizeDestination || the recipient's real hand`. Normal KO thus carries the physical owner-hand `options.destination`.

The same native **prompt class, message and count** are also used for different actions, including these exact pinned card implementations:

- [`Patrat FFI`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-furious-fists/patrat.ts) `Safety Check`: select a face-down Prize to **look at**; the Prize stays in place.
- [`Rattata TR`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/set-team-rocket/rattata.ts) `Trickery`: **swap** a chosen Prize card with the top of the owner's deck.
- [`Blacephalon UNB`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/blacephalon.ts) `Blazer`: **turn** a chosen Prize card face up and conditionally add damage.
- [`Blacephalon-GX LOT`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/blacephalon-gx.ts) `Burst-GX`: move one Prize to a temporary zone then discard or attach it. It is not ordinary KO Prize taking.

Those examples use `{count:1,allowCancel:false}` with no `destination`, matching the previous `agent21-owner-first-prize-reveal` selector's other eligibility checks (including `CHOOSE_PRIZE_CARD`, owner, available slots, no opponent Prizes or blocks). Its prior claim to be **KO-only** was therefore too strong solely from those prompt fields. A fallback might validly choose a Prize slot for another effect, but its downstream tactical semantics and entitlement differ. **Reclassification of a prompt is not proof of a gameplay error in archived cases.**

## Narrow correction

[`agent21-owner-first-prize-reveal.cjs` v2](https://github.com/FlareZ123/experiment-01/commit/9429c934172314858c71935b134fdbdb57babbc5) now requires `Array.isArray(owner.hand.cards)` and `prompt.options.destination === owner.hand` before claiming a normal Knock Out Prize selector decision. This filters the four demonstrated native card-effect collisions, because they do not supply that owner-hand destination. Other ineligible prompts remain delegated to the existing raw-State fallback quarantine.

The physical hand-destination condition is **necessary for this pinned ordinary KO path, not a complete proof of unique KO origin**. A different card-specific handler could in principle deliberately pass the same destination. The strongest integration would bind a source `checkState`/KO-provenance event to prompt ID and verify actual post-Store movement to the correct destination.

[Extended pure regression](../../tests/agent21-owner-first-prize-reveal.test.cjs) at [`eb6a5ed`](https://github.com/FlareZ123/experiment-01/commit/eb6a5ed71e51d57ec295f4602e0b3bd0e84349da) uses a KO-native-shaped destination, owner-hand in each seat, the previous no-Prize-face-read Proxy, same-message `destination:undefined` negative, foreign and null destinations, and prior blocked/foreign/optional cases. The exact fetched source, fallback quarantine module, and complete test file were executed through V8 dependency shims; **7/7 tests passed**, including both physical seats.

Added this test to the existing `issue25_v14_only` manual workflow preflight in [`1e37231`](https://github.com/FlareZ123/experiment-01/commit/1e37231f46813b05a33aa903ca6461a943eba530). **No fresh compiled Twinleaf/Node CI result has been observed** for this correction. Historical v13/v14 native receipts retain their v1 adapter identity. New proof is a stricter source-compatible selector, not new competitive results.

## Practical release gate

Differentiate `native Prize slot offered`, `selected under a source-specific entitlement`, `actual prompt resolved`, `correct physical Prize-to-hand movement`, and `Prize tempo in a complete opponent reply`. The v2 guard addresses only the eligibility/provenance step; the current Prize adapter still counts **validated submissions**, not native accepted prize settlement. Its `nativePrizeValidationPassed` counter is a validator-only witness.

Issue #25 remains **FAIL/UNRESOLVED**. Zero competitively qualified paper games, 29 authenticated of 32 original name/count 60s, ranks 23/25/28 unavailable, no selected immutable 60, no established 99.5% win rate.
