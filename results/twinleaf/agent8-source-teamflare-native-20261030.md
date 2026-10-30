# Original rank-6 Team Flare Grunt: two-seat native denial and owner-only held/target evidence

**30 October 2026 | Agent 8 | evidence classes: original source deck inventory, genuine pinned Store fixture, read-only actor observation.**

## Printed source and problem

The published exact rank-6 Kazuma Kashi Iron Thorns 60 in [full-decklists.json](../aichi-2026/full-decklists.json) contains **two Team Flare Grunt XY 129**, four Plumeria, four Crushing Hammer, two Enhanced Hammer, and four Basic Iron Thorns ex. The frozen original 32-arm prospectively registered comparison had 16 rank-6 source-game arms and **zero accepted denial-card plays** (including Team Flare Grunt), as independently audited in [Agent8 original source control coverage](../aichi-2026/agent8-original-source-control-play-coverage-20261029.md). The earlier result proved no accepted action, but did not establish that Grunt was *held* at the native Pass, had a target, or was worth playing.

The existing actor-only root selector already has `play-team-flare-grunt-denial` as an opt-in late alternative. Its shared [owner-root contention census](../../simulation/twinleaf/agent16-owner-priority-contention.cjs) originally omitted it, which can hide a competing denial choice behind a higher-priority attack or different Supporter. The diagnostic was updated and versioned, with a synthetic owner-only regression. No real policy action was changed.

## Genuine compiled pinned-engine mechanics

Native fixture: [tests/agent8-team-flare-grunt-pinned-native.test.cjs](../../tests/agent8-team-flare-grunt-pinned-native.test.cjs). It loads the actual `Team Flare Grunt XY` printing and `Psychic Energy SVE` from the pinned CardManager. Its initial positive case now uses the exact **Iron Thorns ex TWM** source Active, **Shadow Rider Calyrex V CRE** opponent Active, and **Basic Psychic Energy MEE** matching the original rank-1 champion inventory. The opponent's Psychic Energy is attached in both the Pokémon card list and its physical Energy zone. Other deck zones use artificial test fillers and are not treated as original 60s. The acting player's Supporter quota starts unspent.

Both physical player seats were independently tested. The exact original matchup-board printing revision **PASSED the full canonical CI job**, including its native Grunt test step, in [run 40993142303](https://github.com/FlareZ123/experiment-01/actions/runs/40993142303) at commit `71ae4d7f7b8054dd81bd124ca4ba64a311b37370`. The actual native `canPlay(store,state,owner)` accepted this condition. The real `PlayCardAction` followed by native prompt resolution removed the Energy from the opponent Active, moved it into that opponent's discard pile, consumed the acting player's Supporter from the hand, and left no unresolved prompt. The real native `canPlay` returned false after setting `owner.supporterTurn=1` or removing the opponent Active Energy.

**CI evidence:** [existing canonical manual workflow 40992304019](https://github.com/FlareZ123/experiment-01/actions/runs/40992304019) **PASSED overall**, including both printed Grunt tests and every prior native step, at Git commit `36273eaf4d2adc55a197376640bcd3c00d18fbc4`, pinned to the repository's configured Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Earlier 40991870436](https://github.com/FlareZ123/experiment-01/actions/runs/40991870436) failed because the fixture mistakenly omitted `owner` in its direct `canPlay` call; this invocation error was corrected using the existing native Plumeria reference. Preserve the earlier failure for traceability.

This is **action-level native evidence**, not a reproduced complete rank-6 game decision or paper legality certification under every lock. The fixture uses an isolated artificial board, an ordinary Basic Energy target and a source-printed card, without claiming the original source 60 was shuffled. The desired follow-on includes natural owner-hand availability, actual source-owned target and turn quota, accepted Grunt, real settled opponent Energy loss and opponent continuation on the same immutable source physical deal.

## A first-turn paper-legality guard that native `canPlay` does not supply

[Full-pass canonical CI 40993888457](https://github.com/FlareZ123/experiment-01/actions/runs/40993888457) included a new native printed Grunt predicate check at `state.turn=1`, with the same artificially attached opposing Active Energy and unspent Supporter quota. In **both physical seats**, `TeamFlareGruntXY.canPlay(store,state,owner)` returned **`true`**, as the CI logs explicitly reported:

```text
TEAM_FLARE_FIRST_TURN_NATIVE_CANPLAY {"seat":0,"turn":1,"nativeCanPlay":true}
TEAM_FLARE_FIRST_TURN_NATIVE_CANPLAY {"seat":1,"turn":1,"nativeCanPlay":true}
```

Under the paper first-player ordinary Supporter restriction, **Team Flare Grunt has no first-turn-first-player permission**. This native per-card predicate is therefore **insufficient by itself** to certify a paper-legal Grunt action. The artificially preattached opponent Energy is not an ordinary initial-state scenario. The test does not establish whether the Store reducer independently rejects an actual first-turn `PlayCardAction`. The source actor's existing `chooseTeamFlareGruntDenial` correctly screens `globalTurn<=1`, while the post-Pass observer counts such roots as paper-timing-ineligible. Any later generalized native `canPlay` sampler must retain this separate paper screen and never promote a turn1 positive predicate into an unqualified legal opportunity.

## Post-Pass owner-visible evidence instrument

[simulation/evaluation/agent8-source-postpass-teamflare.cjs](../../simulation/evaluation/agent8-source-postpass-teamflare.cjs) exports pure `sourcePostPassTeamFlare(decisionTrace, nativeRoots, sourceSeat)`. It reads only **postdecision** genuine source-owned Pass records. For every accepted Pass, it requires the exact Store root ordinal and physical seat, the acting player's own-hand printings, and opposing public Active `energyCards`. It counts observed versus incomplete Passes, held Grunt, exposed opponent Active Energy, joint co-occurrence, first-player-first-turn restriction and previously observed same-turn printed Supporter plays. Bounded samples contain only source-owned Grunt count, opponent's public Energy *count*, time/ordinal and visible prerequisite flags. They exclude other hand names and all opponent concealed zones. Tests exercise physical source seats 0 and 1, synthetic joint positive/negative, unknown witness handling and no hidden-state access.

The five pure post-Pass regression tests and the printed native Grunt tests **passed together** in the [full existing canonical CI 40992661101](https://github.com/FlareZ123/experiment-01/actions/runs/40992661101) at source commit `90840848a60e6c87d2f21c578a899db2afa5772c`, with no added workflow or gameplay intervention. This CI run executes the synthetic observer tests and the staged both-seat card fixture, **without replaying the observer across all original physical source Pass roots**.

**Important:** this instrument does not query native `canPlay`, does not certify the current Supporter quota from printed previous-root history alone, does not use inferred Prize or deck composition and has not yet been attached to or executed against the canonical original 32-arm archive. It remains a reusable read-only observer; Agent41 owns canonical integration and prospective policy. Do not relabel an `observed` held/target event as an accepted legal opportunity until the native root is checked.

## Expected exposure calibration

Under uniform opening sampling, a seven-card original rank-6 opening conditional on containing an Iron Thorns Basic has a **22.9304%** chance of at least one Team Flare Grunt among its first eight naturally seen cards, or **25.8946%** among the first nine. Including all twelve named Energy-disruption cards produces **82.2968%** by eight, **86.3822%** by nine. The exact multivariate calculation and physical copy counts are in [Basic-valid rank6 card-location access](../statistics/agent8-rank6-teamflare-basicvalid-access-20261030.md). These are exposure priors rather than real-turn event rates or policy results. Opponent Energy state, locks, first-turn restriction, costs and source choices remain unmodelled.

## Competitive status

No new 60-card candidate is nominated by this mechanical test. **The full Aichi Top32 source collection remains 29/32 exact lists, ranks 23/25/28 absent, zero competitively qualified games, no demonstrated fixed-deck 99.5% win rate.** Player policy completeness, exact-source root exposure, native paper behavior and outcome quality remain distinct qualifications.
