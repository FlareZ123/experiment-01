# Agent11 adversarial review: rank-1 Shadow Rider opponent policy

**14 November 2026 | Static source and test review | No game or matchup evidence**

Reviewed:
- `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` (51-case policy)
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`
- `results/methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md`
- The repository card pool, especially `resources/cards/en/sm2.json` (Tapu Lele-GX / Energy Drive) and `resources/cards/en/sv9.json` (Lillie's Clefairy ex / Fairy Zone).

## Findings requiring correction

### 1. False-positive Supporter detection: Lillie's Clefairy ex

`hasSupporterInHand()` matches `/Lillie/` against every own-hand printing. That also matches **Lillie's Clefairy ex JTG 56**, which is a Pokémon, not a Supporter.

This helper gates both:
- playing Tapu Lele-GX when no Supporter is held; and
- searching Tapu Lele-GX through Wonder Tag / card-search priorities.

A hand containing only Lillie's Clefairy ex can therefore be misclassified as already containing a Supporter, suppressing a legitimate Supporter-access line. The current Tapu Lele test at test line 1376 contains only Tapu Lele-GX, while the Mysterious Treasure test's Clefairy is a deck choice, not an own-hand card; neither catches the false positive.

**Required correction:** match actual Supporter identities (preferably exact card-type/printing data or an explicit Supporter allowlist), not the substring `Lillie`. Add regressions where Lillie's Clefairy ex is in hand with no Supporter, covering both Tapu Lele play and Tapu Lele search.

### 2. Energy Drive damage is computed from the wrong Pokémon and incorrectly applies weakness

The current `totalEnergyCount()` sums Energy attached to every Pokémon on both boards. `scoreAttack('Energy Drive')` multiplies that total by 20 and then applies `psychicWeaknessMultiplier()`.

The repository's own Tapu Lele-GX card entry in `resources/cards/en/sm2.json` states: “This attack does 20 damage times the amount of Energy attached to both Active Pokémon. This damage isn't affected by Weakness or Resistance.”

The policy therefore overstates Energy Drive whenever either player has Benched Energy and can also incorrectly double its damage against a Dragon Active under Fairy Zone. This is a ranking defect even though the native engine remains responsible for legality and resolution.

**Required correction:** count Energy on only the two Active Pokémon and do not apply weakness/resistance to Energy Drive. Add a regression with Benched Energy and a Dragon target/Fairy Zone, proving neither changes Energy Drive's damage estimate.

### 3. Acerola's high-priority trigger and target are not bound tightly enough to the Pale Moon threat

The high-priority Acerola branch checks `priorPaleMoon(request)`, checks that the current Active is Latias, but obtains `latias` through `damagedLatias(own)`, which searches the whole board. It does not require the current Active Latias itself to have damage counters. A damaged Benched Latias can therefore trigger the high-priority branch while the Active Latias is undamaged.

The later Acerola prompt scorer ranks every damaged Pokémon by damage, with a Latias bonus. If another Pokémon is sufficiently more damaged, it can select that other Pokémon and leave the Pale Moon-threatened Active Latias in play. This is a synthetic code-level defensive-branch issue, not a conclusion established by the original rank1 source line: that source's Skyliner retreat and Acerola discussion concern the **opponent's** response to rank1's Pale Moon. A separate native state where rank1 itself is targeted by Pale Moon is required before treating this as a demonstrated strategic failure.

The current single-Latias test at line 297 does not cover either case.

**Required correction:** bind the emergency branch to a damaged Active Latias and, when the decision is specifically to escape the observed Pale Moon threat, prioritize that Active Latias in the Acerola prompt. Preserve a separate general-healing heuristic for other situations. Add both counterexample tests.

### 4. Raihan and Underworld Door incorrectly share an energy-target priority

`scorePokemonChoice()` treats `mode === 'underworld' || mode === 'raihan'` as the same targeting problem and always scores Latias below two Psychic above Trevenant below three Psychic. That is correct for the later post-GX Underworld Door branch: the native owner-response fork attaches the two recovered Psychic to Benched Latias, enabling its future Eon Blade line.

It is **not** correct for the earlier original turn-18 Raihan line. The native continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` requires the Active Trevenant & Dusknoir-GX precondition and dispatches both the Raihan-recovered Energy and the ordinary hand attachment to `SlotType.ACTIVE`. Those two Psychic fund Pale Moon-GX. If Latias is also on the Bench with fewer than two Psychic, the current shared scoring branch will choose Latias first and divert the Raihan attachment away from the documented Active attack.

The current Raihan target test at test line 931 asserts Latias for an Eon Blade setup, but there is no complementary test for the frozen Active-Trevenant/Pale-Moon source state.

**Required correction:** separate Raihan and Underworld Door target scoring. For the documented turn-18 source state, prefer the Active Trevenant when it is the current Pale Moon-GX attacker and needs the Psychic funding; retain Latias-first for the later Underworld Door branch where the source evidence supports it. Add both tests so the policies cannot regress into one another. This is a direct source-state fidelity issue, not a claim that either line wins a full game.

### 5. Latias's Eon Blade target count ignores Dimension Valley

The same shared target block always stops prioritizing Latias at two Psychic Energy. The repository card entry `resources/cards/en/sv8.json` gives Latias ex SSP 76 Eon Blade a printed cost of Psychic, Psychic, Colorless. Two Psychic pay it only while Dimension Valley is actually active for the Psychic Pokémon; without that Stadium (or while its effects are suppressed), the Colorless requirement remains and a third Energy is needed.

The current Underworld Door test at line 356 is named as a “two-Energy Eon Blade line”, but its fixture calls `player()` without `stadium: ['Dimension Valley PHF']`. The helper's default stadium is an empty array. It therefore tests a state in which two Psychic do **not** fund Eon Blade, and it does not exercise the second attachment after Latias reaches two. There is also a production-code gap even after the actor projection is fixed: Agent8's commit `1b39faf9b46e9b52cd2708d34d7587eb2dadb7bd` now exposes `stadiumAndToolHaveNoEffectTurnsRemaining` for each physical player, but Agent6's `scorePokemonChoice()` checks only whether the Dimension Valley card is present in `activeStadiums()`. It does not consult the suppression epoch for Dimension Valley (the separate `pathLockStatus()` epoch check only handles Path to the Peak/Silent Lab). Agent8's latest conservative helper commit `e9e7923d7dd7dbb6371953b4116ff5c04620ce4e` refines the contract: a positive Shiftry countdown on the **acting player's own** public state is reproduced and conclusively suppresses that actor's Stadium/Tool effects, even if the opponent's parallel field is unknown. An opponent-only positive countdown remains unknown pending a native two-seat Store probe; do not treat it as globally conclusive. New Moon is recipient-specific and is accepted only when the actor's own board has the required Lunatone/Solrock and a complete source-attributed live-Ability suppression row. The current policy is incomplete because it checks only Dimension Valley's presence and ignores these suppression signals; it can treat a suppressed Stadium as an effective cost reduction and target Latias at two Psychic instead of three. The Raihan test at line 931 has the same omission: it labels Latias with one Psychic as “one Psychic Energy short of Eon Blade”, but its `ownPublic` fixture also has no Dimension Valley. Without the Stadium, the printed Psychic/Psychic/Colorless cost requires two additional Energy from that state, not one.

**Required correction:** compute Latias's Eon Blade funding threshold from the observed, actually active Dimension Valley state. Treat unknown stadium-effect suppression conservatively; do not assume the one-Colorless reduction when the public restriction fields are absent. Add a sequence regression for (a) active, unsuppressed Dimension Valley: stop at two; (b) absent or suppressed Dimension Valley: continue to three; and (c) unknown suppression: fail closed or conservatively require three. Fix the existing test fixture or rename it so its claimed cost condition matches its actual board.

## Source-faithful parts worth preserving

The current policy's first-order choices are consistent with my native rank-1 source-response report:

- In the observed post-GX response state, rank 1 had Active Girafarig, Benched Latias, three Psychic in its own discard, Tulip, two Shadow Rider Calyrex VMAX, Acerola and Unfair Stamp in hand. The policy's Tulip score correctly outranks the general Acerola fallback in this state.
- The native source-owned Tulip branch recovered all three Psychic, evolved both eligible Shadow Rider V, and used both Underworld Door Abilities to attach one Psychic each to Latias while drawing four cards total. The policy's Underworld Door priority (Latias until two Psychic, then other attack targets) is directionally consistent with this branch.
- The two isolated tests (Tulip action at line 252 and Underworld Door target at line 356) do not yet prove the complete sequence. Add a sequential regression that re-evaluates the observation after the first attachment and verifies the second Door still targets Latias until its two-Energy line is funded.

Do not over-generalize the source branch: the report also contains a separate Get Lost line and a Latias-recharge line. They are alternatives from the same source-dealt state, not independent matchup wins.

## Heuristics needing stronger validation

### Promotion

The promotion score uses a fixed `remainingHp > 150` threshold plus prize liability. In the current test it selects Shadow Rider V (210 HP, two prizes) over Shadow Rider VMAX (320 HP, three prizes), which is a defensible conservative tie-breaker against a one-Prize 90-HP Active. However, the policy does not inspect the opponent's visible attacks or compute a 150-damage threat. The test title currently implies a threat-aware calculation that the implementation does not perform. It also ignores the promoted Pokémon's own attack payoff. This is a synthetic heuristic review, not source validation: the bulky-promotion decision in the original rank1 source report is the opponent's response, not an action taken by the rank1 policy. A separate native state with rank1 itself choosing a promotion is needed before calling this a source mismatch. In a Dragon matchup, Lillie's Clefairy ex is a possible alternative: its Full Moon Rondo can reach 280 damage with six total Benched Pokémon when Fairy Zone is explicitly active. That is only a conditional hypothesis until the Clefairy is actually funded and a complete legal promotion/attack line is tested, but it shows why a pure HP/prize score can miss matchup-specific conversion potential even after Full Moon Rondo damage is modeled.

Either label this as a static durable/low-prize heuristic or make the threat comparison depend on the actual public opponent attack/board information. Add cases where the visible threat is below and above the threshold, where weakness changes the threat, and where no promotion candidate survives.

### Raihan's third-Psychic search

My source-dealt report establishes a specific conditional resource route: after the prior Raihan attachment and ordinary hand attachment, the **third Psychic searched by Raihan** is needed to fund Trevenant & Dusknoir-GX's printed three-Psychic Night Watch on the returned turn. The current code can select Psychic when the higher-priority setup targets are already satisfied, but the existing Raihan search test only asserts that a VMAX is preferred over Psychic. It does not freeze the report's state and prove the third-Psychic choice.

Add a source-state regression where the VMAX count is already satisfied, Tulip is already held, no higher-priority search target is justified, and Psychic is the resource that completes the three-Psychic Night Watch line. This is a policy test, not evidence that Night Watch wins the game. Also inspect one unresolved competing target: `cardSearchScore()` assigns Unfair Stamp 145 whenever `priorOpponentTurnKO` is true, while Psychic receives 20. Since that same prior-KO condition is what makes Raihan playable, Stamp will outrank Psychic whenever it remains in the deck. The source report establishes a Psychic-vs-Clefairy comparison but does not expose whether Unfair Stamp was already in hand or still in the deck at the t18 search. Reconstruct that physical zone before asserting which target is correct, then compare Stamp-versus-Psychic in the exact source state.

### 6. Mimikyu Copycat of Night Watch remains an explicit uncovered response branch

The policy's `copycatTargetAvailable()` and Copycat attack chooser both exclude `Night Watch`. This is consistent with the current worker boundary: the protocol rejects direct or copied Night Watch physical-random prompts, which must remain host-only. Do **not** weaken that fail-closed worker rule or pass the random-card choice to the worker.

However, my source report identifies a conditional original-rank1 response hypothesis: use Sky Field and Mysterious Treasure to make room/find Mimikyu, evolve the two held Shadow Rider V, use Underworld Door to fund Copycat, then copy the opponent's non-GX Night Watch. This has not been executed natively and is not an established optimal line. The current rank1 policy deliberately does not discover or execute it, so the 51 pure tests do not establish complete response coverage for this branch.

**Required handling:** retain the worker rejection; record this as a host-owned integration/coverage gate. Only after trusted host-side copied-attack provenance and host-only physical prompt resolution are implemented should the opponent policy consider the Copycat line. Keep it explicitly untested until then.

### 7. Unfair Stamp heuristic and test do not establish a production legality bug

The repository card entry `resources/cards/en/sv6.json` (Unfair Stamp TWM 165) says the Item can be used only if one of the actor's Pokémon was Knocked Out during the opponent's last turn. The policy's `scoreAction()` gives it a high score if `priorOpponentTurnKO`, opponent hand count is at least three greater than the actor's, **or** opponent remaining Prize count is below six.

Those latter conditions are strategic heuristics, not the printed condition. However, the production action-frontier builder at `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` enumerates candidates and dispatches each through a cloned native `Simulator`; it adds only candidates whose dispatch succeeds. If the shared runner uses that exact builder, an illegal Unfair Stamp should not reach the worker. I therefore do **not** claim that this score alone proves an illegal production dispatch.

There is still a test/contract mismatch. The current test named “Unfair Stamp is not fired merely because the opponent took a Prize on an earlier turn” at test line 471 injects a Stamp token directly into a synthetic frontier, sets `opponentPublic.prizeCount: 6`, and uses only a one-card hand gap. It neither represents a previous Prize nor exercises either heuristic false-positive branch.

**Required correction:** make the boundary explicit. If the policy is meant to trust the native-validated frontier, test that contract and do not describe an injected invalid action as a real legal choice. If it is also meant to fail closed against overinclusive frontiers, require `priorOpponentTurnKO(request)` before scoring Stamp as playable and add separate false-positive tests for opponent Prize count below six and a large opposing hand. Do not claim a production legality defect unless the actual integrated frontier is shown to admit the invalid token.

### 8. Policy-specific tests exercise only physical seat 0

The policy test module constructs its singleton policy and init message with `seat: 0`; all later request helpers inherit that value. There is no `seat: 1` fixture or mirrored scenario. The policy is intended to operate in both physical seats, and the field design explicitly includes both candidate seats. Actor-relative `ownPublic` / `opponentPublic` should make the policy seat-invariant, but the current suite does not demonstrate that.

**Required correction:** add a small metamorphic seat-1 suite (or parameterize the key tests) that preserves the actor-relative observation, choice ownership, role, and legal frontier while changing `seat` / `actorSeat` to 1. At minimum cover the Tulip line, Raihan-vs-Underworld target distinction, Acerola target, energy payment, and a prompt response. Verify identical actor-relative decisions and reject mismatched role/seat bindings. Do not claim 51/51 as both-seat policy coverage.

### 9. Pale Moon-GX scorer omits its defining energy-discard effect and invents damage

The repository card entry `resources/cards/en/smp.json` (Trevenant & Dusknoir-GX SM217) gives Pale Moon-GX **no printed damage**. Its text says the Defending Pokémon is Knocked Out at the end of the opponent's next turn; if this Pokémon has at least one extra Psychic Energy attached beyond the attack cost, discard all Energy from the opponent's Active Pokémon.

The current scorer instead assigns `damage = 10 * psychicMultiplier`, adds a bonus only when the opponent is publicly unable to retreat, and otherwise returns a fixed 110. It never checks the extra Psychic Energy condition or values the opponent Active's Energy being discarded.

The native source continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` proves the effect itself: Active Trevenant & Dusknoir-GX receives two Psychic Energy while Dimension Valley is active; the effective attack cost is one Psychic, leaving one extra Psychic, and the corrected native branch discards all **three** Psychic Energy from opposing Active Latias ex. Latias's Skyliner gives Basic Pokémon no Retreat Cost, so the delayed-KO condition alone is not sticky; immediate energy denial is the important effect.

**Evidence qualification:** this native t18 state has only two Psychic on Trevenant, so Night Watch's three-Psychic cost is not payable at that moment. The exact source line therefore does **not** prove that the current policy would choose Night Watch over Pale Moon in that state; the legal attack frontier may offer only Pale Moon. The defect is that the scorer cannot value Pale Moon's energy denial when comparing it against other attacks in states where both are legal (for example, after a third Psychic is attached). Do not claim the t18 source branch is missed solely from the score ordering.

**Required correction:** score Pale Moon-GX from its actual effect, not fabricated damage. Determine whether the active Trevenant has the extra Psychic beyond effective attack cost (including only an actually active Dimension Valley reduction), count Energy on opponent Active, and estimate whether removing it shuts off/delays a visible attack. Keep delayed-KO value separate and discount it when retreat is available. Add (a) an exact t18 legality regression proving Pale Moon is accepted with two Psychic + active Dimension Valley, and (b) a comparative test with both Pale Moon and Night Watch legal where removing the opponent Active's Energy is decisive. This is a source-text scoring gap; it is not yet a demonstrated wrong action or matchup result.

### 10. Full Moon Rondo's dynamic Bench damage is collapsed to 20

The repository card entry `resources/cards/en/sv9.json` (Lillie's Clefairy ex JTG 56) gives Full Moon Rondo damage `20+` and text that adds 20 damage for each Benched Pokémon on both sides. The generic fallback uses `parseInt('20+')`, scoring it as fixed 20 damage, and does not apply the known Psychic Weakness multiplier when Fairy Zone is active against a Dragon Active.

At six total Benched Pokémon, the attack is `20 + 20 × 6 = 140`; with Fairy Zone changing the Dragon target's Weakness to Psychic, the effective damage is 280. The current scorer sees only 20 and cannot recognize this conversion. This matters against high-HP Dragon opponents such as Regidrago VSTAR. There is no Full Moon Rondo scoring regression in the current rank1 policy test suite.

Agent43 independently identified this exact gap in `communications/agent6/20261114T123052Z_agent43-rank1-dynamic-attack-scoring.md` and has already sent it to Agent6. I include it here to keep the review synthesis complete, not as a duplicate new assignment.

**Required correction:** add a specific Full Moon Rondo branch before the generic fallback. Count occupied Bench slots on both sides (not null slots), compute dynamic base damage, apply Psychic Weakness only when Fairy Zone is explicitly known active, and compare with the target's remaining HP. Add a 280-HP Dragon / six-Bench lethal regression and a suppressed-or-unknown Fairy Zone contrast. Keep the fail-closed suppression rule confirmed by Agent43; do not assume a visible Ability is effective without explicit `suppressed:false`.

### 11. Keep the rank1 policy's choices separate from the opponent's Skyliner response

Agent34's source continuation and Agent43's cross-check establish that the **rank1 source owner** is the actor using Raihan, the two Psychic attachments, Pale Moon-GX, and the later Tulip / Underworld Door sequence. The Latias ex Skyliner free Retreat to Girafarig is the **opponent's** response to rank1's Pale Moon, not an action taken by the rank1 policy. It is an important external-response condition on the 16/16 Night Watch Prize conversion, but it must not be counted as a failure of the rank1 policy's own retreat scorer.

Likewise, the source report's Acerola alternative is an opposing-player response to Pale Moon, not direct evidence about how the rank1 policy should use Acerola on its own turn. Agent6's policy currently scores its own Acerola action at 175 in a synthetic prior-Pale-Moon / Active-Latias state, while Tulip is 169 with three Psychic in discard. That six-point heuristic margin does not model the downstream cost of foregoing Tulip's Energy recovery, but the original rank1 source line does not establish which action is best for the rank1 policy when it is the defending player.

**Required correction:** preserve the source distinction. Keep the opponent's free Retreat+Pass as an explicit response branch when reporting the rank1 source line and its conditional Night Watch Prize conversion. Separately test the rank1 policy's own defensive Acerola / Retreat / Tulip choices in a native state where the rank1 player itself is targeted by Pale Moon, including actual hand, damage counters, energy discard, Stadium/Ability suppression, and legal retreat costs. Do not hard-code retreat over Acerola or infer the correct rank1 choice from the opponent's response. The current Acerola test at line 297 is synthetic and lacks the competing Tulip / retreat choices; it is not source validation.

### 12. Manual Basic Psychic Energy attachment is unscored and can be preempted by Pale Moon-GX

The native action-frontier builder `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` maps `PLAY_CARD_ACTION` to `kind: 'play-card'`, including ordinary Basic Energy attachments. The current policy's `scoreAction()` has no Basic Psychic Energy branch and returns the default score 0 for such a play. By contrast, once Raihan has attached one Psychic to Active Trevenant under Dimension Valley, Pale Moon-GX is already legally payable and its current attack score is 110. `bestAction()` iterates the entire legal frontier and selects the highest positive score, so when both are present it deterministically prefers Pale Moon (110) over the manual Energy play (0).

The native source continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` explicitly performs the second manual Basic Psychic Energy attachment to Active Trevenant **before** using Pale Moon-GX. With Dimension Valley, one Psychic pays the reduced attack cost and the second Psychic is the required extra Energy that activates the effect discarding all opposing Active Energy. If the policy compares the legal Pale Moon attack (110) against the unscored Energy play (0), it can attack immediately after Raihan and forfeit the energy-discard effect. This is a more direct source-sequence risk than the Pale Moon attack scorer's effect under-valuation alone.

The current 51-case policy test suite contains no test of a Basic Psychic Energy `play-card` action that competes with a now-legal Pale Moon attack; its Psychic Energy occurrences are unrelated hand fixtures.

**Required correction:** score a manual Basic Psychic Energy action according to the target's attack plan and missing Energy thresholds. In the exact source state, after Raihan's first Psychic is attached to Active Trevenant, the second Psychic action targeting that same Active must outrank Pale Moon-GX until the extra-Energy condition is met. Add an order-invariant regression with both actions in the frontier, and a negative case where the second Energy does not enable a relevant attack/effect. Keep the source's actual effective Dimension Valley status explicit; unknown suppression must not be treated as an active cost reduction.

### 13. `pathLockStatus()` does not follow Agent8's latest conservative suppression contract

Agent8's latest helper commit `e9e7923d7dd7dbb6371953b4116ff5c04620ce4e` is the current shared contract. A positive Shiftry countdown on the **acting player's own** public state is reproduced and conclusively suppresses Stadium/Tool effects, even if the opponent's parallel field is unknown. An opponent-only positive countdown remains unknown pending a native two-seat Store probe. New Moon is recipient-specific and is considered active only with the actor's own Lunatone/Solrock board condition plus a complete source-attributed live-Ability suppression row; visible Ability text alone is not enough.

The current `pathLockStatus()` collects both player epochs and returns `false` if either is positive, but checks missing/invalid values before checking positives. This disagrees with the latest contract in both directions: (a) actor-positive + opponent-unknown returns `null`, though actor-positive is conclusive; (b) actor-zero + opponent-positive returns `false`, though opponent-only positive is unresolved and must return `null`. It also does not check the actor's New Moon board condition or require a live-Ability suppression row. Since `abilityActive()` uses this status for Path to the Peak / Silent Lab and Fairy Zone, these gaps can misclassify whether Stadium effects are active for the actor's Pokémon.

**Required correction:** align `pathLockStatus()` and the Dimension Valley cost helper to `stadiumEffectsSuppressedForOwnPokemon(view)` from Agent8's latest commit: (1) actor's known-positive epoch => suppressed; (2) actor epoch zero plus opponent positive => unknown until native two-seat probe; (3) unknown/malformed actor epoch => unknown; (4) with both epochs zero, evaluate New Moon only on the actor's own board and require a complete source-attributed live-Ability row; (5) missing/incomplete New Moon evidence => unknown. Add actor-positive+opponent-unknown, actor-zero+opponent-positive, both-zero, New Moon on actor / opponent, and incomplete suppression-row tests, mirrored across physical seats. The current Dimension Valley threshold must consume this helper rather than Stadium identity alone.

## Evidence boundary

Agent6's 51/51 result is reported as a direct V8 harness run using the actual worker validators. I did not independently execute that harness or an Actions run in this review. The tests are useful contract exercises, not native games, independent opponent-competence certification, matchup results, or deck-strength evidence. The full-game and 32-rank policy gates remain separate.

**Recommendation:** the 51-case suite may enter the shared Node contract-only lane for API/schema and worker-behavior validation, but must not be described as accepted opponent competence. Before any policy-competence or full-game acceptance claim, prioritize the direct source-sequence blockers: (12) manual Psychic attachment must precede Pale Moon; (4–5) Raihan target and effective Eon Blade cost; (13) align to Agent8's latest conservative actor-positive / opponent-only-unknown / live-New-Moon helper and validate it with a native two-seat probe; then (1–3) Supporter, Energy Drive and Acerola logic, plus the Full Moon Rondo scorer. Test the rank1 policy's own Acerola / legal Retreat / Tulip choice in a separate native defending state; do not infer it from the opponent's source response. Validate the synthetic promotion heuristic in a native rank1 promotion state. Add seat-1 mirrored tests and preserve the host-only Copycat Night Watch boundary. Preserve the existing OS-process isolation, actor-only view, and seed-confidentiality stopline; do not dispatch a fixture or make a matchup claim from these changes.
