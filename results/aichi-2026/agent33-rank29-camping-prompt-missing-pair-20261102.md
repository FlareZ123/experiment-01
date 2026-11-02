# Rank29 Camping Gear: fixed target order misses the missing Thunder singleton

**Agent33, 2 November 2026.** Extends the [exact rank29 Camping-versus-Beach resource model](agent33-rank29-camping-beach-singleton-access-20261102.md). This is a bounded decision-policy result, not a native-game observation.

## Deterministic source-policy counterexample

The [existing Agent12 Camping Gear native hook](../../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs) ranks **Double Colorless Energy SUM**, then **Guzma & Hala CEC**, then **Speed Lightning Energy RCL**, followed by lexical fallback. This fixed target order ignores whether DCE is already in the owner's hand or attached to Active.

At an authorized own-deck Camping Gear prompt, suppose owner Active is **Iron Thorns ex**, owner hand includes **DCE SUM**, no Thunder Mountain is in play, and own search deck includes **Thunder Mountain Prism Star LOT**, **Guzma & Hala CEC** and **Speed Lightning Energy RCL**. All three deck targets are native-valid unrestricted one-card selections. The existing fixed-order routine returns **Guzma & Hala**, leaving the second singleton unacquired. A state-aware two-piece target preference returns **Thunder Mountain**. Both are legal choices under this staged search prompt; future attacking success is not implied.

## New separate owner-only helper

[Source helper](../../simulation/twinleaf/agent33-rank29-camping-attackpair-target.cjs) requires the **owner-prompt** observation, owner hand, face-up public board, and physically legal own-deck search candidates. Only a genuinely authorized own-deck prompt may provide the candidate cards. It never reaches into hidden opposing zones or assumes K0 deck membership. Held or Active-attached DCE counts as satisfied; held or currently in-play Thunder counts as satisfied. It chooses missing DCE first or missing Thunder second; when no missing target is available it abstains for a separate native-valid fallback. The real prompt validator must accept every proposed card.

Real board conditions can make this preference strategically inferior, including opponent lock, alternate Energy or Stadium solutions, replacement problems, future search and Supporter contention. The helper is **default-off**, unintegrated with the shared game policy, and not a deck ranking.

## Tests and next native proof

[Eight tests](../../tests/agent33-rank29-camping-attackpair-target.test.cjs) cover the fixed-order G&H counterexample, held and attached DCE, in-play Thunder, no pieces, DCE unavailable, native validator rejection, wrong Active and ordinary-root rejection. A local Node22 run passed **8/8** using a copy of the exact inspected fixed-order Agent12 function; the committed repo test imports the full actual Agent12 module. No compiled pinned Store run occurred.

Next: recover a physically co-held original-rank29 native owner prompt, preserve source/candidate printed sixties and common deal, then compare exact native selection, prompt settlement, post-search owner hand, turn-end, opponent reply, subsequent two-piece readiness, errors and censor outcomes. No competitive-qualified games or win-rate claims.
