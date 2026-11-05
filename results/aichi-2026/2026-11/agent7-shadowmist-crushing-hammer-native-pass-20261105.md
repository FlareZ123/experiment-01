# Agent 7: source-owned Crushing Hammer was held and natively playable during Shadow Mist, but the original rank-6 bot passed

**5 November 2026. Authentic pinned Store on original Aichi rank6, steward-selected v4 48-root eight-arm context. Independent read-only observation and fail-closed join. Zero paper-qualified games.**

## Question and result

The [independently replayed 96-root public action sequence](agent7-original-rank6-shadowmist-96root-lock-window-20261105.md) shows the original rank-6 Iron Thorns deck passing on ten consecutive turns after the reference opponent's Shadow Rider Calyrex V declared Shadow Mist. Shadow Mist prevents the opposing player from playing Special Energy or Stadium cards from hand for the next turn. Seven original Aichi 60s, including rank6, were already known to run only Special Energy; [Agent6's source exposure census](../agent6-shadow-mist-special-energy-exposure.md) covers that structural interaction.

A previously unresolved question was whether the opponent's **ten actual Passes** were all forced by Shadow Mist or instead included missed other legal decisions. This experiment reads the authentic **acting source player's own hand and public board**, after the original bot selected an action and immediately before the original native Store dispatches it. It adds **no card-play action and changes no turn, deal, policy or opponent decision**.

**New finding: the source did have a currently held Crushing Hammer POR with a real opposing attached Energy and the printed native card's `canPlay(store,state,owner)===true` on both its global turns 7 and 9. It selected Pass on both.** The Item and Supporter play-lock flags were false. Shadow Mist's Special Energy and Stadium restrictions were true. Native `canPlay` only establishes a preliminary viable card play; actual final Store acceptance, target prompt, coin outcome and tactical preference were not tested in this unchanged run.

## Unchanged registered physical source and exact audit

Frozen original trial: `6:100:A:champion-reference`; source original rank6, physical seat 1; candidate champion-reference, seat 0; source starting-deal SHA-256 `700f0f6e1fa884906c79cf2275741f036d212428fae01c8f2c132dc9ada086b2`. This is one previously selected historical opponent and seed, **not an unbiased held-out field sample**.

Pre-existing selected native policy: [Agent36 v4](../../../../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs). Original eight registered IDs, 48 Store root limit, normal actions and defaults all unchanged. Genuine pinned Twinleaf submodule commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; research job HEAD `ae68841e1474caaa881b8ad611d6d9df7987f715`.

New research-side reversible observer:
- [Native Store observer and source-only redaction](../../../../simulation/twinleaf/agent7-shadowmist-owner-lock-witness.cjs).
- [Five independent pure fail-closed tests](../../../../tests/agent7-shadowmist-owner-lock-witness.test.cjs).
- [Original eight-arm native join regression](../../../../tests/agent7-shadowmist-owner-lock-witness.native.test.cjs).
- [Successful manual compiled CI 42072396879](https://github.com/FlareZ123/experiment-01/actions/runs/42072396879); abort-custody job `127403543933`, step **Audit source-held Hammer counterplay at genuine Shadow Mist Pass in original eight** passed, alongside five pure tests. Exact machine-readable stdout line `AGENT7_SHADOWMIST_OWNER_LOCK_NATIVE` is in that job's log.

The observer hooks genuine `Store.prototype.dispatch` temporarily, authenticates each newly started native game, only reads the player who owns the active Pass, and restores the original method even after an exception. It records counts for restricted known source Special Energy and Stadium printings, counts for selected Trainer responses, actual native player-level lock flags, opponent's face-up attached Energy count, and a *preliminary* native `canPlay` result for held Crushing Hammer. It does not publish any complete hidden hand nor share hidden opponent cards with a bot. The analyzer fails if any accepted source Pass lacks one matching owner-state observation or the complete Store root timeline is inconsistent.

## Actual native observations

| Original source's turn | Candidate's immediately preceding Shadow Mist | Cards in source hand | Source Special Energy held | Source Crushing Hammer held | Opponent Energy attached | Hammer `canPlay` | Special Energy and Stadium locks | Chosen source action |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 3 | turn 2, root18 | 9 | 0 | 0 | 1 | false | both true | Pass root22 |
| 5 | turn 4, root25 | 10 | 0 | 0 | 1 | false | both true | Pass root29 |
| **7** | **turn 6, root32** | **11** | **0** | **1** | **1** | **true** | both true | **Pass root36** |
| **9** | **turn 8, root39** | **12** | **1** | **1** | **1** | **true** | both true | **Pass root43** |

All four have `nativeItemPlayLocked:false`, `nativeSupporterPlayLocked:false`, and `normalEnergyAttachmentUsed:false` at the Pass boundary. As expected, the source could not play Special Energy from hand under the active Shadow Mist restriction. The one Special Energy **held at turn 9** is direct owner-hand evidence that the prohibition actually excludes an ordinary attachment opportunity if the other ordinary conditions are met. At turns 3, 5 and 7 the source held **zero** of the four known rank6 Special Energy printings, so Shadow Mist's player flag is real but no actual held Energy attachment was lost in those particular states. The source's usual one Energy attachment had not been used on any of these turns.

The same unaltered run yielded all **eight** original registered outcomes: six capped 48-root attempts, two engine errors, no paper-qualified complete games. For the target rank6 arm, five accepted source Passes were seen (including turn1 before Shadow Mist), all five observed with owner-state custody, and four original candidate attack-to-next-source-Pass windows exactly joined. The other original rank6 source arms' outcome classifications and original-root decisions were retained.

## Interpretation and tactical counterfactual

The original rank6 60 carries four Crushing Hammer POR and two Enhanced Hammer TWM. The actual rank1 champion reference uses Basic Psychic Energy, so the source's Enhanced Hammer has no valid attached Special Energy target in that opponent deck under the given inventory. **Crushing Hammer is a separate live Item counterplay channel** when the candidate has attached Psychic Energy. A successful coin flip could remove it, potentially disrupting subsequent Shadow Mist funding; an unsuccessful flip still consumes the Item. Whether to play it immediately or preserve it for a more dangerous attack depends on other source options, known card access and the game objective.

The deterministic fact is **a bot Pass in the presence of a held native-playable preliminary Hammer target**. This falsifies treating those particular two Passes as evidence the source had no legal Trainer response whatsoever. It does **not** establish that Hammer would be strategically preferred, that every remaining source response is avoidable, or that a stronger original-source agent would win. Native `canPlay` is the card-specific preliminary permission check, not an executed target/coin/effect settlement. A high-quality source player may also use a different Item or Supporter.

Agent29 independently demonstrated real pinned Store Crushing Hammer selection and physical Psychic Energy discards in other original rank6 historical trials ([prior native report](../agent29-hammer-owner-after-pass-native-20261030.md) and [preregistered disposition audit](../agent29-fresh-hammer-32attempt-disposition-reconciliation-20261101.md)). Those independently seeded and different-position results support the existence of a native physical Hammer channel, while they do **not** certify the unplayed counterfactual on this exact shadow-locked turn.

## Next proof gate

A controlled **same initial physical-deal** A/B diagnostic could retain the frozen source/contender 60s, Shadow Mist effect, seed and actual 48-root original control, then use the already-written [both-seat actor-safe Hammer-after-Pass adapter](../../../../simulation/twinleaf/agent29-actor-hammer-after-pass.cjs) as a separately labelled treatment. At turn7, select the actually held Crushing Hammer under the native `canPlay` check, resolve the coin and real target prompts, then verify any physical Psychic Energy leaves the opponent and goes to discard. Continue through the opponent's subsequent paid attack or other consequential choice. Retain outcome divergence, simulator errors, independent seed effects and 48-root cap. This would test *whether a legal Hammer line executes*; policy optimality still needs comparison across opponent replies and a qualified full-game policy.

**Conclusion:** one original rank6 factual source weakness: at least two Shadow Mist-locked source Passes occurred despite held, preliminarily native-playable Crushing Hammer. This is development-only evidence, an opponent-competency veto for the 99.5% target, and **not** an achieved competitive win rate.
