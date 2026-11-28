# Rank-27 Regidrago: Temple of Sinnoh invalidated the source policy's GG+F funding estimate

**Agent 2, 28 November 2026, 13:36 UTC.** Source-bound policy correction on current main, no native game, no CI dispatch, no candidate-60, engine, owner gate or fixture change.

## Decision and consequence

The existing rank-27 source-bound Regidrago worker computed Double Dragon Energy ROS97 as two flexible color units toward Regidrago VSTAR's Apex Dragon printed G/G/F cost. This is correct without suppression, but **false while Temple of Sinnoh ASR155 is in play**: that Stadium makes every Special Energy provide a single Colorless and have no other effect. A Double Dragon + Grass attachment was therefore misread as full 3/3 colored funding when its real colored coverage is 1/3. The defect propagated into the policy's conditional endgame gust valuation, Crispin urgency, Energy attachment decisions and the value of a Stadium replacement. An apparent endgame gust could be prioritized without a payable attacker.

The authenticated original Aichi source ledger `results/aichi-2026/full-decklists.json` contains Temple of Sinnoh in **rank 3 (one), ranks 8, 11, 16, 22 (two each)**. Thus this is relevant to five actual field source inventories, not an invented generic opponent. It does **not** establish that Temple was in play in a game or that any matchup outcome changed.

## Committed correction

- `simulation/evaluation/2026-11/agent2-rank27-regidrago-opponent-policy.cjs`, commit [d878eaa](https://github.com/FlareZ123/experiment-01/commit/d878eaafa813499fe0f7943295a5b30190ceb047).
- `energyCoverage(energyPrintings, temple)`: while the visible Temple is active, Double Dragon supplies **zero units toward the colored G/G/F requirement**; ordinary Grass and Fire contributions remain. Without Temple the prior two-flexible-unit model remains.
- `templeIsActive(obs)` recognizes the precise ASR155 source printing and pinned native numberless label only; forged explicit ASR999 does not qualify.
- `templeUnlocksApex(obs)` recognizes a concrete conversion: the **active** VSTAR already has a discard-pile Dragon donor and enough attachments to become G/G/F-funded when Temple is replaced, but cannot fund that attack under the current Temple. A playable **Parallel City** replacement gets higher root priority than a competing Quick Ball; **Path to the Peak** replacement is scored lower when unused Legacy Star remains because it may disable that power. These root preferences still depend on the host's genuinely playable action frontier.
- Corrected the conditional `finalPrizePrimeTarget`, the forced-switch target ranking, the basic Energy attachment valuation, and Crispin valuation to use current Stadium semantics. Under Temple an additional Double Dragon attachment to a Dragon target is not scored as an immediate increase in colored funding; it retains only modest future value rather than being categorically forbidden.
- No vendor/Twinleaf code changed; the model is actor-visible and source-bound.

The source cards' relevant text is available in the supplied complete card database: Temple of Sinnoh ASR155 states all Special Energy supply Colorless and lose their other effects; Double Dragon Energy ROS97 ordinarily provides every type, two at a time while attached to a Dragon Pokémon; Regidrago VSTAR SIT136's Apex Dragon cost is Grass, Grass, Fire.

## Reproduction and boundaries

`tests/2026-11/agent2-rank27-regidrago-opponent-policy.test.cjs` regression append, commit [e34bd9a](https://github.com/FlareZ123/experiment-01/commit/e34bd9a79db20bcb49179e13d843be4ae0cd9e1f):

- Both physical seats; Double Dragon + Grass has 3 colored cost units without Temple and **1** under Temple.
- Three appropriate Basic Energy still satisfy the printed cost under Temple.
- A future final-Prize gust is not treated as immediately funded while Temple blocks the Bench attacker.
- A playable Parallel City replaces Temple before a competing Quick Ball when it concretely unlocks a powered active Regidrago VSTAR; without Temple, Quick Ball remains preferred in the same constructed observation.
- Suppression is fail-closed to the actual Stadium printing; a wrong explicit collector number is rejected; the pinned native numberless label is accepted.

Executed all 32 rank-27 policy test groups in an isolated V8 CommonJS harness with the actual current GitHub policy, base scorer, Apex helper, Phantom Dive helper, protocol and test sources. **32/32 pass, 416 assertions, both seats.** The harness replaces Node's test/assert entry points with equivalent in-process checks; this is not a Node test-runner or compiled pinned-Twinleaf receipt. No actual native Store, uninterrupted game, opponent-policy qualification, sampled field mean or 99.5% achievement was measured.

## Remaining first-order constraint

The rank-27 policy is still developmental. It is not admitted as a competitive opponent policy; its separate opt-in KO/Prize continuation and Celestial Roar native prompt bridge remain branch-only and unvalidated in a complete game. This correction improves decision semantics under a source-backed Stadium, but does not remove current owner/Critic no-game and independent-review gates. The field remains **29/32 exact source lists, 0/32 qualified matchups, no final fixed sixty**.

The same Temple suppression deserves source-bound adoption in any other Regidrago-family policy that scores Double Dragon or attacks from card counts, *after checking its own specific source and action semantics*; no blanket inference about other policy correctness is made here.
