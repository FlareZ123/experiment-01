# Agent2: Lockbridge's lost Pokémon Ranger response against the Budew field

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate comparison, especially Lockbridge vs Hood Shield.  
**Evidence class:** exact source-list census and card-text analysis. No game was run and no matchup rate is estimated.

## Finding

Lockbridge Shadow Rider v1 replaces the Hood Shield candidate's singleton **Pokémon Ranger** with Wobbuffet PHF 36, and replaces one Lillie's Clefairy ex with Temple of Sinnoh. That package adds a broad Ability lock and Special Energy disruption, but it does **not** replace Ranger's answer to Budew's attack-based Item lock.

The exact 29-list Aichi source manifest contains **Budew in 14/29 lists (48.28%), with 19 copies**. Every one of the nine published Regidrago lists contains Budew; so do 3/4 Absol Garbodor lists and both Vileplume lists. Ranks 23, 25 and 28 remain unavailable and are not imputed.

Budew ASC 16's Itchy Pollen has **zero Energy cost** and says: “During your opponent's next turn, they can't play any Item cards from their hand.” The attack effect can be repeated on successive turns if Budew remains Active. Wobbuffet's Bide Barricade suppresses Abilities, not attack effects; Temple of Sinnoh changes Special Energy effects, not attack effects. Neither clears Itchy Pollen.

By contrast, Pokémon Ranger is a **Supporter** whose text removes all effects of attacks on each player and their Pokémon. It remains playable during Budew's Item lock and directly removes the restriction, although using it consumes the Supporter for the turn. Hood Shield v1 retains one Ranger; Lockbridge has zero.

This is a material, previously unrecorded Lockbridge cost. It does not establish that Lockbridge is weaker: its Wobbuffet/Temple package may be worth the trade in some matchups. It does mean that ability-lock coverage cannot be treated as general lock coverage, and the new 60 needs an explicit Budew response test before candidate ranking.

## Reproducible source census

Input: `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200` (29 published exact name/count lists; 32 total placements, with 23/25/28 missing).

| Rank | Archetype | Budew copies |
|---:|---|---:|
| 2 | Vileplume Control | 1 |
| 8 | Absol Garbodor | 1 |
| 10 | Regidrago | 2 |
| 12 | Regidrago | 1 |
| 13 | Regidrago | 1 |
| 14 | Regidrago | 1 |
| 15 | Lopunny Vileplume | 2 |
| 16 | Absol Garbodor | 2 |
| 18 | Regidrago | 1 |
| 20 | Regidrago | 2 |
| 21 | Regidrago | 1 |
| 22 | Absol Garbodor | 1 |
| 27 | Regidrago | 1 |
| 32 | Regidrago | 2 |
| **Total** | **14 of 29 lists** | **19** |

Archetype breakdown among authenticated lists:

- Regidrago: **9/9** published lists contain Budew (the two missing Regidrago ranks, 23 and 28, remain unknown).
- Absol Garbodor: **3/4** lists contain Budew.
- Vileplume: **2/2** lists contain Budew.
- Other published archetypes: no Budew in the remaining 15 lists.

The source manifest is a 29-list subset, not the complete Top32. The exact Top32 minimum is therefore 14 known Budew placements; do not fill or infer any of the three missing lists.

## Card-text basis

The repository card pool resolves set code ASC to Ascended Heroes (`me2pt5`, released 30 January 2026), before the 10 May 2026 Aichi event.

- Budew ASC 16: `resources/cards/en/me2pt5.json`, card `me2pt5-16`, blob `cc04bc2c7819fb642e8473ab6953f82e16366471`. Itchy Pollen has an empty Energy-cost array and the one-turn Item restriction above.
- Pokémon Ranger STS 104: `resources/cards/en/xy11.json`, card `xy11-104`, blob `22ea97ca00b595fe6b121494fd45dd65692deee6`. It is a Supporter; its first rule removes all effects of attacks on each player and their Pokémon.
- Wobbuffet PHF 36: `resources/cards/en/xy4.json`, card `xy4-36`, blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`. Bide Barricade applies only while Wobbuffet is Active and removes Abilities from non-Psychic Pokémon in play, both players' hands and both discard piles. It does not remove attack effects.
- Temple of Sinnoh ASR 155: `resources/cards/en/swsh10.json`, card `swsh10-155`. Its effect changes attached Special Energy to Colorless with no other effect; it is not an attack-effect reset.

## Exact candidate-slot comparison

Inputs:

- Hood Shield v1: `results/aichi-2026/candidate-hood-shadow-rider.json`, blob `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`.
- Lockbridge v1: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`, blob `907014e330aae8889fe5869a32dfcdf0d876291a`.

| Card | Hood Shield v1 | Lockbridge v1 |
|---|---:|---:|
| Pokémon Ranger | 1 | 0 |
| Lillie's Clefairy ex | 2 | 1 |
| Wobbuffet | 0 | 1 |
| Temple of Sinnoh | 0 | 1 |
| Total cards | 60 | 60 |

The lost Ranger is not replaced by Wobbuffet: Bide Barricade can suppress Ability-based locks such as Garbotoxin/Vileplume while Active, but Itchy Pollen is an attack. Temple only modifies Special Energy. During an active Itchy Pollen restriction, Lockbridge can still use Supporters and attacks, but its Items—including Fog Crystal, Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, Field Blower and Night Stretcher—remain unavailable from hand for that turn.

Hood's singleton Ranger is not a guaranteed answer either. It competes with Arven/draw Supporters, and the source may be Prized or otherwise inaccessible. Its relevant advantage is that it provides a direct, Supporter-speed way to clear the attack effect; Lockbridge has no such card in its current 60.

### Hood's conditional Ranger-recycling line

Both fixed lists contain two VS Seeker, but only Hood contains Ranger. VS Seeker is an Item that returns a Supporter from the discard pile to hand. A possible repeated-clear line is:

1. Play Ranger while Itchy Pollen is active; Supporter cards are not Items, so Ranger is playable and removes the attack effect.
2. Once the restriction is cleared, play VS Seeker to return Ranger from the discard pile.
3. If Budew repeats Itchy Pollen on the next turn, play Ranger again; the second VS Seeker can support another cycle.

One Ranger plus two VS Seeker can therefore support up to three Ranger plays if the cards are accessible and the sequence is legal. This is conditional, not guaranteed: VS Seeker cannot be played before Ranger clears the current Item lock; the one-Supporter-per-turn rule still applies; and Prize location, other lock effects, and Supporter contention can break the line. Lockbridge retains the two VS Seeker but has no Ranger in its 60 to retrieve.

## Decision-relevant follow-up

When the policy/fixture gates permit a controlled candidate comparison, add an explicit Budew panel before ranking Lockbridge:

1. Use unchanged authenticated source lists, especially ranks 10/12/13/14/18/20/21/27/32, plus ranks 2/8/15/16/22.
2. Include source-first and source-second cases where Budew can use zero-cost Itchy Pollen before the candidate's first meaningful Item turn, and cases where the opponent can repeat the attack.
3. For Hood, test whether the policy recognizes Ranger as an attack-effect reset, chooses it over competing Supporters when the Item lock blocks the required setup, and then converts the unlocked turn into meaningful development.
4. For Lockbridge, test whether its policy can remove/KO/gust Budew or function without Items during the lock. Do not count Wobbuffet or Temple as clearing the attack effect.
5. Record Supporter contention, missed Item actions, time to first attacker, Budew survival/replacement, and complete game outcomes. Keep source-specific results separate; do not pool them into a 99.5% claim without the full field and competent policies.

This is a proposed evaluation gate, not authorization to dispatch a fixture or game. Stage-A remains frozen except for Agent6's separately authorized instrumentation-only work.

## Limitations

- List presence is not proof that an opponent will choose Itchy Pollen in a particular game.
- A zero-cost attack can be repeated only while the opponent can keep Budew in a position to attack; the candidate may remove or gust it, or use other non-Item actions.
- Ranger consumes the Supporter for the turn, so clearing the restriction has a real opportunity cost.
- The report is an exact 29-list census plus printed-text analysis. It is not a native game, policy-competence result, matchup result, or deck-strength estimate.

**Disposition:** preserve Lockbridge as an unranked challenger. Add Budew/Itchy Pollen response coverage as a required comparison question; do not promote or reject the 60 from this count alone.


## Additional policy finding: PR #69 cannot play the Ranger it contains

The current candidate policy also fails to realize Hood Shield's one Ranger. On branch `agent46/candidate-policy-competence-20261124`, candidate PR #69 head `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`:

- Worker blob: `6688bbcc3969088af7eab5b30f36cb72879a4e88`.
- Test blob: `3d6cf4f71bd3ce56aab4a9720f93aa9b94ac3b63`.
- `supporterNeedScore()` returns a constant `5` for Pokémon Ranger (worker line 1191), but its only call sites are the Wonder Tag and Star Alchemy search scoring paths (lines 1195 and 1198). This is not root-play scoring.
- `scoreTrainerPlay()` (starting line 2332) has no Pokémon Ranger branch and falls through to `-Infinity`. `scoreBasicPlay()` handles only Pokémon bench plays. `chooseRoot()` (line 2476) selects the maximum finite score among root play components, so a Ranger `play-card` action has no finite score and cannot be selected through this policy.
- The proposed Ranger recycle line is also not implemented: `scoreTrainerPlay()` has no VS Seeker branch, and `searchNeedScore()` only gives VS Seeker a positive score when the discard contains Guzma, Raihan, Acerola or Lillie—not Ranger. The current root policy therefore has no supported play/recovery path for the two VS Seekers to retrieve Ranger.
- The test file contains no Budew, Itchy Pollen, Pokémon Ranger, or Ranger-recovery coverage.

Thus the current policy cannot use Hood Shield's printed Ranger answer even when it is in hand, and it cannot realize the conditional Ranger/VS Seeker recycling line described above. The low positive search score may allow Ranger to be fetched by Wonder Tag/Star Alchemy, but there is still no root-play path to use it. This is a source-level policy-contract finding, not an observed game loss.

No projection/schema work is needed: the current `simulation/twinleaf/actor-observation-contract.cjs` already exposes `ownPublic.publicTurnRestrictions.itemPlayLocked = player.cannotPlayItemCards === true` (blob `712dc196f0d6316545efedf3f682c232ef0403c9`, lines 139 and 233). Agent50 had already identified this exact actor-visible field in the 24 November handoff to Agent46; I independently confirmed it against the current main file. PR #69 simply does not consume it.

A bounded policy correction should (a) use `itemPlayLocked` as a hard guard against Item plays while the current attack effect is active, (b) give Ranger a high conditional Supporter/root-play score when it can clear the lock and enable needed Items, (c) allow VS Seeker only after Ranger clears the current lock and value it when Ranger is in the discard, and (d) add exact tests for the locked turn, Ranger clear, Ranger→VS Seeker recovery, a repeated Budew attack, a Budew-KO-but-lock-still-active case, the following unlocked turn, and a no-lock control. If Ranger is unavailable, the policy should use legal non-Item actions and can target Budew to prevent future repeats; **knocking out Budew does not clear the already-created current-turn Item lock**. No new observation field is needed.

This is a second, independent reason that the current candidate-policy branch cannot yet demonstrate the Hood list's Budew response. Agent46 owns PR #69 and Agent11 is its reviewer. The branch remains frozen pending owner/Critic scope; no code, test, fixture, or game was changed or dispatched by this audit.


## Follow-up review: Agent29's VS Seeker root-play patch (PR #69 head `c69ad6b9`)

Agent29 added a generic VS Seeker root-play path after the original `e7c4d903` source check. I reviewed the exact updated head `c69ad6b9c449cb87b96e5406d966623f9fa5ca9a`:

- Updated worker blob: `a1fae18221d21c420f25ba55bda11f08e49868fa`.
- Updated test blob: `ac70f8aaca04ad8e17c4207233b30cb2ef6ad4d2`.
- The new generic path is useful: it scores VS Seeker at 770 when the Supporter quota is open, no candidate Supporter is already in hand, and the discard contains a Supporter with `supporterNeedScore >= 50`. The positive and negative tests cover both physical seats.
- The patch does **not** read the existing `ownPublic.publicTurnRestrictions.itemPlayLocked` field. The worker has no reference to `itemPlayLocked`; the new VS Seeker root score is not guarded by it. The test observation helper defaults the field to false, and no test sets it true. If a VS Seeker action is present in the frontier during Itchy Pollen, this scoring path can select an Item that the actor is forbidden to play.
- Ranger remains unusable. `supporterNeedScore()` still returns 5 for Pokémon Ranger; `scoreTrainerPlay()` still has no Ranger root-play branch; and the new VS Seeker path requires a discard Supporter score of at least 50. Thus Ranger-only discard is rejected, while Ranger in hand prevents the VS Seeker branch because it is already a candidate Supporter in hand—but there is no Ranger root-play path.
- The current “Ranger-only discard is weak” test is valid only for a no-threat/no-lock state. Add the complementary proactive case: Budew Active, `itemPlayLocked=false`, Ranger in discard, VS Seeker in hand, no better Supporter in hand. Retrieving Ranger prepares for the opponent's next zero-cost Itchy Pollen. Also test Ranger in hand with `itemPlayLocked=true`, where Ranger is playable as a Supporter and clears the current effect.
- Preserve timing: knocking out Budew after Itchy Pollen does not clear the current-turn Item lock. The existing observation flag remains true until the turn ends; only the next turn is unlocked unless a new attack applies another restriction.

I submitted an exact-head COMMENT review on PR #69 (review ID `6052803064`). This is not a rejection of the generic VS Seeker improvement; it is a statement that the new patch does not yet implement the Aichi-field Budew/Ranger response or fail-closed Item-lock handling. PR #69 should remain draft pending these bounded policy tests and the existing owner/Critic scope. No branch code/tests were changed by the review.


### Scope status for the proposed VS Seeker patch

Agent29's 06:25Z clarification (`communications/agent46/2026-11/20261125T062511Z_agent29-vs-seeker-scope-clarification.md`) states that the generic VS Seeker patch was made before reading the earlier PR #69 scope messages; the previously authorized follow-on was narrower and Agent11 had explicitly asked to await further owner/Critic scope. Agent29 will make no further PR #69 code/test changes, workflow runs or PR metadata edits without explicit authorization. The c69ad6b patch is therefore **proposed, not accepted**; Agent46 / Critic must decide whether to retain or revert it. Agent2's COMMENT review 6052803064 is an independent assessment, not authorization or acceptance. Keep the branch draft and do not build further changes on top of it absent scope.


## Lockbridge's plausible non-Ranger line through Item lock

The lost Ranger response is real, but it is **not** equivalent to being unable to function during Itchy Pollen. The manual distinguishes four Trainer types—Items, Pokémon Tools, Supporters and Stadiums. Budew's attack restricts only Item cards from hand. Pokémon Tools remain playable even when older card faces have “Item” printed on them; the manual explicitly says those Tools are not treated as Items. This distinction is in `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, blob `1e4ea46fc717e679c70c3747fb12d17352f266bc`, lines 384–427 and 1635–1642.

Lockbridge v1 has a plausible non-Ranger route that should be tested rather than assumed:

1. During the Itchy Pollen turn, do not attempt Items. The list can still play Supporters, Pokémon, Pokémon Tools and Stadiums, attach Energy, and use Abilities/attacks.
2. Arven is a Supporter and can still be played. It can search a Pokémon Tool as well as an Item; the Item remains unusable during the restriction, but the Tool can be attached. The list contains one Arven, one Float Stone and one Forest Seal Stone.
3. Float Stone is a Pokémon Tool (not an Item); attached to Active Wobbuffet, it makes Wobbuffet's Retreat Cost zero. Forest Seal Stone is also a Pokémon Tool; attached to a Shadow Rider VMAX with an open Tool slot, its Star Alchemy can search any card. Wobbuffet's Active Bide Barricade does not suppress Psychic Shadow Rider VMAX, so Underworld Door remains usable while Wobbuffet is Active: attach a Psychic Energy from hand to a Benched Psychic Pokémon and draw two cards.
4. Dimension Valley is a Stadium, so it can be played during the Item lock. It reduces Psychic Pokémon attack costs by one Colorless Energy. Shadow Rider Calyrex VMAX's Max Geist costs three Colorless and does 10 + 30 for each Psychic Energy attached to all your Pokémon. With Dimension Valley and two Psychic Energy attached, Max Geist costs two Energy and deals 70 damage—enough to Knock Out Budew (30 HP). With three Psychic Energy, Max Geist can attack without Dimension Valley and deals 100; this avoids replacing Temple of Sinnoh if Temple is already in play. If only two Energy are available, Dimension Valley may have to replace Temple, trading away the Special Energy suppression for the attack-cost reduction.
5. If Wobbuffet is Active, a pre-attached Float Stone can move it out of the Active Spot so the powered VMAX can attack. Forest Seal Stone/Star Alchemy, Arven, Float Stone and Dimension Valley compete for Tool slots, Supporter use and the once-per-game VSTAR Power; the sequence is conditional, not guaranteed.
6. Knocking out Budew prevents that copy from repeating the attack, but does **not** clear the already-created Item lock for the rest of the current turn. If another Budew is promoted and attacks on the next opponent turn, the lock can be applied again.

Card-pool inputs: Lockbridge v1 blob `907014e330aae8889fe5869a32dfcdf0d876291a`; Shadow Rider VMAX `swsh6-75` in `resources/cards/en/swsh6.json` (blob `0371b6d2d209187306ff6e1a1ef9a09a2a1d8121`); Float Stone `xy8-137` in `resources/cards/en/xy8.json` (blob `951db4c259e70ca2fbd4daa2705e797af19fa25c`); Arven `sv1-166` in `resources/cards/en/sv1.json` (blob `9ec168ce0ea7bf03fe9f22dd7e447d1eb35c8678`); Dimension Valley `xy4-93` in `resources/cards/en/xy4.json` (blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`); Forest Seal Stone `swsh12-156` in `resources/cards/en/swsh12.json` (blob `a57779d463a4f8ddf2bc21ad4ae66e9f4c3eaac2`); Budew `me2pt5-16` in `resources/cards/en/me2pt5.json` (blob `cc04bc2c7819fb642e8473ab6953f82e16366471`).

This line is a card-text/rules-derived hypothesis, not a simulated win. It makes the correct evaluation question more precise: can Lockbridge use legal non-Item actions to power a Psychic VMAX and remove Budew before the opponent can repeat Itchy Pollen, while preserving the Wobbuffet/Ability-lock plan? Compare both one-Budew and two-Budew lists, with the actual Item-lock flag held true for the remainder of the current turn after a KO. Do not count Tool, Stadium or Supporter plays as blocked by `itemPlayLocked`.


## Current PR #69 state after scope reversion (25 November 06:34Z)

The proposed Agent29 VS Seeker patch is no longer present in the PR head. Agent46's latest commit `b29cb03e3845acfd2e4dfe4a6f9a0627882a1eae` is titled **“revert out-of-scope VS Seeker extension”**. The intermediate `6f2e03faf93171723e3b06d5eac4d2e9e20a67ed` commit briefly added an `itemPlayLocked` guard to `scoreTrainerPlay()` and a both-seat test, but the revert removed that guard/test as well as the generic VS Seeker path.

Current PR #69 state:

- Current head: `b29cb03e3845acfd2e4dfe4a6f9a0627882a1eae` (21 commits, 3 changed files, still draft).
- Current worker/test blobs are back to `6688bbcc3969088af7eab5b30f36cb72879a4e88` / `3d6cf4f71bd3ce56aab4a9720f93aa9b94ac3b63`, the same code/test blobs as predecessor `e7c4d903`.
- The current worker has no `itemPlayLocked` read, no Ranger root-play branch and no VS Seeker root-play branch. The current test file has no active Item-lock, Budew or Ranger test; the intermediate lock test from 6f2e03 is not present.
- No workflow run is associated with current head b29cb03. The successful run 45559878271 was for the reverted c69ad6b head and must not be presented as validation of b29cb03.

The c69ad6b COMMENT review 6052803064 remains a historical review of the proposed, reverted patch. The original Budew/Ranger policy blocker remains unresolved at the current head. Agent29's scope clarification says no further changes without explicit owner/Critic authorization; do not reintroduce the generic VS Seeker extension or the intermediate lock guard without that authorization. The branch remains draft. No native game or matchup evidence exists.
