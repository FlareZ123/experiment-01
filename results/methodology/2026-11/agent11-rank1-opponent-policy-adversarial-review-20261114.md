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

The later Acerola prompt scorer ranks every damaged Pokémon by damage, with a Latias bonus. If another Pokémon is sufficiently more damaged, it can select that other Pokémon and leave the Pale Moon-threatened Active Latias in play.

The current single-Latias test at line 297 does not cover either case.

**Required correction:** bind the emergency branch to a damaged Active Latias and, when the decision is specifically to escape the observed Pale Moon threat, prioritize that Active Latias in the Acerola prompt. Preserve a separate general-healing heuristic for other situations. Add both counterexample tests.

### 4. Raihan and Underworld Door incorrectly share an energy-target priority

`scorePokemonChoice()` treats `mode === 'underworld' || mode === 'raihan'` as the same targeting problem and always scores Latias below two Psychic above Trevenant below three Psychic. That is correct for the later post-GX Underworld Door branch: the native owner-response fork attaches the two recovered Psychic to Benched Latias, enabling its future Eon Blade line.

It is **not** correct for the earlier original turn-18 Raihan line. The native continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` requires the Active Trevenant & Dusknoir-GX precondition and dispatches both the Raihan-recovered Energy and the ordinary hand attachment to `SlotType.ACTIVE`. Those two Psychic fund Pale Moon-GX. If Latias is also on the Bench with fewer than two Psychic, the current shared scoring branch will choose Latias first and divert the Raihan attachment away from the documented Active attack.

The current Raihan target test at test line 931 asserts Latias for an Eon Blade setup, but there is no complementary test for the frozen Active-Trevenant/Pale-Moon source state.

**Required correction:** separate Raihan and Underworld Door target scoring. For the documented turn-18 source state, prefer the Active Trevenant when it is the current Pale Moon-GX attacker and needs the Psychic funding; retain Latias-first for the later Underworld Door branch where the source evidence supports it. Add both tests so the policies cannot regress into one another. This is a direct source-state fidelity issue, not a claim that either line wins a full game.

### 5. Latias's Eon Blade target count ignores Dimension Valley

The same shared target block always stops prioritizing Latias at two Psychic Energy. The repository card entry `resources/cards/en/sv8.json` gives Latias ex SSP 76 Eon Blade a printed cost of Psychic, Psychic, Colorless. Two Psychic pay it only while Dimension Valley is actually active for the Psychic Pokémon; without that Stadium (or while its effects are suppressed), the Colorless requirement remains and a third Energy is needed.

The current Underworld Door test at line 356 is named as a “two-Energy Eon Blade line”, but its fixture calls `player()` without `stadium: ['Dimension Valley PHF']`. The helper's default stadium is an empty array. It therefore tests a state in which two Psychic do **not** fund Eon Blade, and it does not exercise the second attachment after Latias reaches two. The Raihan test at line 931 has the same omission: it labels Latias with one Psychic as “one Psychic Energy short of Eon Blade”, but its `ownPublic` fixture also has no Dimension Valley. Without the Stadium, the printed Psychic/Psychic/Colorless cost requires two additional Energy from that state, not one.

**Required correction:** compute Latias's Eon Blade funding threshold from the observed, actually active Dimension Valley state. Treat unknown stadium-effect suppression conservatively; do not assume the one-Colorless reduction when the public restriction fields are absent. Add a sequence regression for (a) active, unsuppressed Dimension Valley: stop at two; (b) absent or suppressed Dimension Valley: continue to three; and (c) unknown suppression: fail closed or conservatively require three. Fix the existing test fixture or rename it so its claimed cost condition matches its actual board.

## Source-faithful parts worth preserving

The current policy's first-order choices are consistent with my native rank-1 source-response report:

- In the observed post-GX response state, rank 1 had Active Girafarig, Benched Latias, three Psychic in its own discard, Tulip, two Shadow Rider Calyrex VMAX, Acerola and Unfair Stamp in hand. The policy's Tulip score correctly outranks the general Acerola fallback in this state.
- The native source-owned Tulip branch recovered all three Psychic, evolved both eligible Shadow Rider V, and used both Underworld Door Abilities to attach one Psychic each to Latias while drawing four cards total. The policy's Underworld Door priority (Latias until two Psychic, then other attack targets) is directionally consistent with this branch.
- The two isolated tests (Tulip action at line 252 and Underworld Door target at line 356) do not yet prove the complete sequence. Add a sequential regression that re-evaluates the observation after the first attachment and verifies the second Door still targets Latias until its two-Energy line is funded.

Do not over-generalize the source branch: the report also contains a separate Get Lost line and a Latias-recharge line. They are alternatives from the same source-dealt state, not independent matchup wins.

## Heuristics needing stronger validation

### Promotion

The promotion score uses a fixed `remainingHp > 150` threshold plus prize liability. In the current test it selects Shadow Rider V (210 HP, two prizes) over Shadow Rider VMAX (320 HP, three prizes), which is a defensible conservative tie-breaker against a one-Prize 90-HP Active. However, the policy does not inspect the opponent's visible attacks or compute a 150-damage threat. The test title currently implies a threat-aware calculation that the implementation does not perform. It also ignores the candidate's own attack payoff. In a Dragon matchup, Lillie's Clefairy ex is a possible alternative: its Full Moon Rondo can reach 280 damage with six total Benched Pokémon when Fairy Zone is explicitly active. That is only a conditional hypothesis until the Clefairy is actually funded and a complete legal promotion/attack line is tested, but it shows why a pure HP/prize score can miss matchup-specific conversion potential even after Full Moon Rondo damage is modeled.

Either label this as a static durable/low-prize heuristic or make the threat comparison depend on the actual public opponent attack/board information. Add cases where the visible threat is below and above the threshold, where weakness changes the threat, and where no promotion candidate survives.

### Raihan's third-Psychic search

My source-dealt report establishes a specific conditional resource route: after the prior Raihan attachment and ordinary hand attachment, the **third Psychic searched by Raihan** is needed to fund Trevenant & Dusknoir-GX's printed three-Psychic Night Watch on the returned turn. The current code can select Psychic when the higher-priority setup targets are already satisfied, but the existing Raihan search test only asserts that a VMAX is preferred over Psychic. It does not freeze the report's state and prove the third-Psychic choice.

Add a source-state regression where the VMAX count is already satisfied, Tulip is already held, no higher-priority search target is justified, and Psychic is the resource that completes the three-Psychic Night Watch line. This is a policy test, not evidence that Night Watch wins the game.

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

## Evidence boundary

Agent6's 51/51 result is reported as a direct V8 harness run using the actual worker validators. I did not independently execute that harness or an Actions run in this review. The tests are useful contract exercises, not native games, independent opponent-competence certification, matchup results, or deck-strength evidence. The full-game and 32-rank policy gates remain separate.

**Recommendation:** fix findings 1–3 before integrating this policy into the shared contract-only lane; add the sequence and source-state regressions before treating its rank-1 response coverage as adequate. Do not dispatch a fixture or make a matchup claim from these changes.
