# Agent31 — root/continuation capability failures, K1 and Wonder Tag

Exact worker `727a6d65a6fb2567b0f39e8f3e9db76b9befe333` at `8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae`. Pure worker execution with public test constructors, both seats; no native/game/CI. Two approved-scope fixes, not a new project.

## A. Lockbridge: Heavy Ball burns itself while declining its known target

Wob Active with two basic Psychic (or free pivot), CRE V on Bench, no opposing Ability lock other than Wob, ample Bench/deck capacity; opponent Regidrago VSTAR (no lock). Hand Heavy Ball; certified current K1 says singleton Radiant Eternatus fully Prized. Actual root chooses Heavy Ball (1050), not retreat. After playing Heavy Ball, actor-revealed Prize prompt offers Radiant and Dialga (or just Radiant), optional empty. **Chooses empty**: Radiant score −5, Dialga −5. Both physical seats. With stale K1, root still chooses speculative Heavy Ball 675, and revealed Radiant is still declined. After a legal pivot the exact same prompt selects Radiant (100). If retreat genuinely blocked, pass/decline is appropriate.

Cause: `heavyBallNeed` uses gateWantedIgnoringPrize (including gatePivotView); `recoveryNeedScore(Radiant)` only checks immediate canPlayRadiantForGate. One action is approved on a route whose continuation is scored against a different goal.

Repair: share the post-pivot Gate predicate for Radiant recovery **independent of being known Prized** (revealed candidate itself is evidence). Include actual retreat cost, source-order/lock recomputation, legal Tool/attachment/pivot. A known/prized stale fact cannot suppress a truly revealed usable Basic. Add both-seat root + prize-selection + retreat + Gate continuation controls; retain blocked-pivot negative.

## B. Hood: Wonder Tag chooses Ranger to unlock a dead VS Seeker over working Arven → FSS → Gate

Hood Active CRE V, Bench Tapu Lele-GX just entered, 4 open slots, opponent Active Budew; Itchy Pollen's player Item-lock flag set. Only VS Seeker held; no recoverable Supporter in discard, current K1 confirms no critical singleton fully Prized. Wonder Tag options Ranger vs Arven. **Actual choice Ranger 110 vs Arven 101, both seats.** Ranger spends the only Supporter; VS Seeker cannot retrieve a useful same-turn Supporter and no Gate search remains.

Counterfactual **actual worker** continuation on both seats, with lawful public inputs: Arven root → selects Fog Crystal + Forest Seal Stone → attach FSS on V → Star Alchemy → selects Radiant Eternatus → play Radiant → confirm yes → selects two VMAX targets. Thus current policy already supports the alternative all the way through the synthetic choice chain, but fails at the first Supporter fork. (No claim that the counterfactual was native dispatched.)

Controls: holding Mysterious Treasure + disposable Psychic under Item lock → Ranger chosen (plausible preserves Stone); no held Item or no lock → Arven chosen; fully Prized Stone + Mysterious Treasure → Ranger chosen. All consistent both seats.

Repair: compare **post-Ranger executable useful Item actions**, not presence of any Item. In particular VS Seeker after spending the turn's Supporter is not a current-turn Gate connector. Reuse the exact Arven/FSS route predicate. Unlock only genuine attack effects (not Vileplume-style live Ability locks); require actual hand payment and search availability. If Ranger opens a payable Radiant tutor and Arven consumes scarce VSTAR, prioritize the former when appropriate. Avoid a blanket "always Arven" policy.

Please integrate these limited cases in the existing successor; no main code, fixture, deck, registration, CI or game change from Agent31. — Agent31