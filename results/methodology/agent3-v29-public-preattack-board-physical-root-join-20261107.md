# Agent 3: public native pre-attack board to accepted KO root join (7 November 2026)

**Status:** The v2 pure helper suite and eight-victim native v29 integration both passed, including pure run 42364129705 and native run 42364148824. The v3 declaration-root timing extension and expanded pure/integration assertions are committed but **pending fresh manual validation**. **Zero paper-qualified full games; no competitive win rate.**

## Motivation

The prior [printed nominal attack-source audit](agent3-v28-printed-roster-attack-nominal-cumulative-ko-audit-20261107.md) joins eight native KO victims to their attack names and uses the original rank-1, rank-6 and rank-11 60s to determine independently printed nominal attack damage. It finds native KO counters of 180, 360 and 400, although matching base attack text nominally produces 20, 130 and 200. This distinction is important: native victim damage at knockout is cumulative. Differences must not automatically be attributed to earlier attacks or attack boosts without the public board before the attack and relevant modifiers.

Existing [`headless.cjs`](../../simulation/twinleaf/headless.cjs) already captures `publicAttackTransitions` before real Store attack declarations, including face-up Active printing, attached Energy and Tools, damage counters and a public board per seat. The existing [`candidateAttackSettlement`](../../simulation/evaluation/agent37-candidate-attack-settlement.cjs) projects each settled native attack's `publicBoardBefore`, exact accepted root, actual actor seat and prompt-completion ordinal. The native v8 source trial rows already retain the full `sourceAttackSettlement` and `candidateAttackSettlement` objects. Previous compact green v27 [artifact 13559912077](https://github.com/FlareZ123/experiment-01/actions/runs/42336993396) preserves summary disposition and complete attack-to-Prize root joins but **omits** the full pre-attack board per row. The gap therefore requires **emitting** that data in a fresh selected-v8 native receipt, while leaving gameplay unchanged.

## New strict read-only join

The [helper](../../simulation/evaluation/agent3-native-pre-attack-public-board-join.cjs) ties each accepted KO Prize exit to precisely one actual logged settled attack using registration ID, actor seat and role, declaration root ordinal, completion root ordinal, attack name and same real turn; rejects cross-epoch settlements and duplicate root use. It verifies the public pre-attack opponent Active matches the independently witnessed KO victim printing. It separately requires that the *actual physical attacking Active* be a printing in that rank's registered original 60. It retains that Active's attached Energy names, Tools, public printed attack menu and target's pre-attack damage, without inspecting any private hand, Prize face or deck.

**Important copying distinction:** a printed card carrying attack text in the original roster does not necessarily equal the physical Pokémon using a copied or granted attack. The helper reports `sourceAttackPrintEqualsPhysicalActive` and `attackNamePrintedOnPhysicalActive`, retaining an unresolved donor-origin flag when those differ. It does not silently relabel the Active as the source text card and never certifies attacking Energy payment from the observed generic public attachment list.

The helper derives `incrementalNativeDamageSincePreAttack = nativeCumulativeDamageAtKO - actualDefenderDamageBeforeAttack`, and records `nativeDeltaEqualsPrintedNominal` as a strict *observation*, retaining possible uncertainty about modifiers and card effects. It does not assert that the match must hold, because previous damage, attack boosts, effects and special case text could explain differences. A positive comparison is not proof of a complete legal game.

## Tests, integration and current actual evidence

The [four pure tests](../../tests/agent3-native-pre-attack-public-board-join.test.cjs) cover direct print/board matching, old damage counters, distinct actual Active versus text source, and eight false-join mutations (wrong actor, print, KO victim, duplicate root, clock reset, attack ordinal, non-settlement and zero incremental damage). The [bounded CI](../../.github/workflows/agent3-native-pre-attack-pure.yml) triggers only when the new helper, test or workflow changes, uses a Node 22 checkout without the Twinleaf submodule, and passed green at [42349590966](https://github.com/FlareZ123/experiment-01/actions/runs/42349590966). The four tests use *synthetic* detached public boards, not the original game board states.

The existing manual-only [`v29 native receipt`](../../tests/agent3-issue25-v29-printed-prize-owner-reply.native.test.cjs) now invokes this new join over `selected.rawDevelopment.rows` and the same eight accepted Prize-root joins, checks all attacker names and registered printings, and writes `actualPreAttackBoardJoins` to the reproducible native JSON plus an `AGENT3_V29_ACTUAL_PRE_ATTACK_BOARD_KO_JOIN` console line. It preserves native v8 source decks and policies and attaches the helper version/hash. **A fresh successful v29 CI replay has not been observed.** There is therefore **no measured real pre-attack damage delta for the eight original KOs yet**, and no verified attacking Energy payments.

## Extension: native visible attached Energy against the printed cost

The original independent attacker print screen now emits its validated attacker Pokémon Stage and types from the original resource card database, alongside each exact attack's printed Energy cost. For attacks where the physical Active has the same source-roster name/set as the card carrying attack text, the native public-board join reuses the pre-existing `simulation/twinleaf/agent30-source-attack-energy-reachability.cjs` `assessDirectEnergy` over actual attached public Energy **cards**. It records `POSSIBLE`, `IMPOSSIBLE` or `UNVERIFIED` as an *unmodified printed-cost envelope*. Other cost changes from Stadiums, Abilities, special game effects and prior attack-copying remain unverified. When the native Active differs from the roster text source, the print-cost assessment is **null**, rather than applying the donor's printed cost to a different Pokémon. No result certifies successful paper payment.

The existing Board telemetry emits the Active's `name` and `fullName` (which gives the English card name and set abbreviation). It does **not** independently show a collector number in that public snapshot. The helper matches that name/set to exactly one printing row in the authenticated original 60. This is a *registered-roster inference* of the collector identity, while the actual visible board attests only name and set. Two explicit result flags preserve that narrower scope: `publicActiveNameAndSetObserved:true` and `publicActiveCollectorNumberObserved:false`.

The suite was expanded with tests of Double Colorless plus Basic Lightning payability, missing Lightning, unknown Energy providers and stage/type extraction from the source cards. A new combined pure CI run under the bounded GitHub Actions workflow was requested. The last independently observed successful run remains the original four-case [42349590966](https://github.com/FlareZ123/experiment-01/actions/runs/42349590966); do not claim a green combined run before its conclusion is checked.

## Next evidence gate

1. Manually dispatch the existing native v29 workflow with its established v14-only control in a pinned checkout, then inspect the new accepted pre-attack rows and check whether actual native incremental damage agrees with printed nominal damage after accounting for modifiers.
2. Independently validate the exact physical attacker and its Energy attachments against its printed attack cost, including DCE and any attack-copy cases, without promoting an ambiguous attack-name match to a paper-payable attack.
3. Only then revisit genuine opponent turn responses and official tournament-clock adjudication. Maintain zero qualified competitive full games and 29/32 exact original field inventories.


## 7 November 2026: successful v29 replay and Copycat scope correction

A fresh manual v14 native integration run, **42354520604**, completed successfully on commit e473eb120acfda7b94d5d4bc1b625f57811dc04e. Its receipt artifact was ID 13566744223, 94,936 bytes, SHA256 2d3fb50c5d0ada628f96e2eb4c0a628ceac285222a422beaa460becd00a1252c. This is a successful replay of the v29 pre-attack board integration and its existing assertions. It does not certify a complete paper game.

A first attempt to attach a Mimikyu Copycat audit to the eight Prize-exit joins was incorrectly scoped. Manual run **42355921734** failed at the new Copycat assertion, after the v29 board-join assertions had passed. The failed log shows that the three fixed-contender Eon Blade Prize-exit rows were **direct Latias ex SSP attacks**, not Mimikyu Copycat attacks:

| Candidate turn | Physical Active | Attached Energy before attack | Native declaration |
|---:|---|---|---|
| 13 | Latias ex SSP | 3 Psychic Energy | Direct AttackAction |
| 17 | Latias ex SSP | 3 Psychic Energy | Direct AttackAction |
| 25 | Latias ex SSP | 3 Psychic Energy | Direct AttackAction |

Each row had delegatedCopy=false; the physical Active printed Eon Blade itself. The first Copycat audit mistakenly tried to treat these three direct attacks as Mimikyu events and returned zero supported Copycat rows out of three. This is an audit-scope error, not evidence of an illegal native attack or a failure of the v29 pre-attack board join. The failed-run workflow artifact is ID 13567577455, 66,352 bytes, SHA256 3f7167e771989db78af82f0b32861cb500ed3d6c11de1960f0800b561739dc85; inspection shows it contains only the prior v19-v28 JSONs, because the v29 receipt was not written after the assertion aborted. The three direct-attack rows above were printed in the failed job log, not recovered from that ZIP. The successful run116 ZIP was downloaded and its SHA256 verified against the artifact metadata; its v29 receipt contains eight actualPreAttackBoardJoins rows and eight printedNativeAttackNominals rows, with the three Eon Blade Prize-exit rows matching the direct Latias ex / three-Psychic observations above.

This correction agrees with Agent37's independent archive audit, which identifies four direct Latias ex Eon Blade declarations on turns 13, 17, 21 and 25; turn 21 did not produce a Prize exit and therefore is absent from the three-row Prize-exit join. See [Agent37's Eon Blade turn-restriction archive audit](agent37-v8-latias-eonblade-turnrestriction-archive-audit-20261107.md).

The replacement helper, simulation/evaluation/agent3-mimikyu-copycat-eon-blade-eligibility.cjs v2, scans both source-seat and candidate-seat full attack settlements. It only emits a row when the actual physical Active is Mimikyu GRI 58 and the accepted attack declaration is a delegated Eon Blade copy. Direct Latias ex attacks are excluded. It joins the current Copycat AttackAction and donor choice to a settled Eon Blade by the opponent on the immediately preceding global turn, checks the non-GX donor, and checks the physical Mimikyu's own printed [Psychic, Colorless] cost against attached Energy.

The cost check is deliberately conservative. It does not automatically apply Dimension Valley's Colorless reduction: Agent44's native cost probes show that Stadium suppression and Lunatone OBF + Solrock CES New Moon can prevent the apparent reduction, while the detached public board does not expose all of that state. If the full printed Copycat cost is directly funded, the helper reports POSSIBLE; if Dimension Valley is visible and the base cost is not funded, it reports UNVERIFIED. See [Agent44's Copycat Stadium-cost frontier](agent44-copycat-stadium-suppression-cost-frontier-20261107.md) and [Agent44's native Mimikyu payment probe](agent44-mimikyu-turn27-psychic-native-20261107.md). The helper never certifies actual Energy payment or a paper game. It also records that Eon Blade carries a next-turn attack restriction, whose application to a copied Mimikyu attack remains unaudited.

The initial revised 13-test pure suite passed in manual workflow run **42356575752** on commit a0f2f37b8fbee448e996a4bdae397a3da257f828. A fourteenth diagnostic regression was then added to surface the Lunatone OBF + Solrock CES New Moon pair across Active and Bench without assuming a Dimension Valley discount; the 14-test pure suite passed in manual run **42357149725** on commit 043820d710e36edbe7cd9d9ac739977e4cad7609. The manual v14 native replay **42356602565** completed successfully on the earlier v2 behavior commit a0f2f37b8fbee448e996a4bdae397a3da257f828. Its artifact is ID **13568485031**, 95,105 bytes, SHA256 **bba14fa68946f52896af324cc9982ce05c7a8c1834f1852089c670bf2dd21fef**; the downloaded ZIP hash was independently verified against Actions metadata.

The v31 receipt reports four accepted attack settlements scanned, four Eon Blade attacks, and **zero** delegated Mimikyu GRI Copycat Eon Blade events. Therefore, in this registered rank-1 / champion-reference mirror, all four observed Eon Blade declarations were direct Latias ex attacks; three caused Prize exits (turns 13, 17 and 25) and the fourth did not (turn 21). This agrees with Agent37's independent archive audit. The zero Copycat count is a trial-specific observation, not evidence that Mimikyu Copycat is invalid or absent in other matchups. The synthetic positive and negative Copycat fixtures are covered by the pure helper tests; this native trial supplied no positive Copycat event to qualify.

No competitive game is qualified by these attack-level joins. The 99.5% objective remains unproven.


## 2026-11-07 v2 attack-cost and damage cross-check

The earlier provisional statement that the v29 replay had no measured incremental pre-attack damage deltas is superseded by the completed v2 validation below.

### Reproducible CI evidence

- Pure public-board join workflow: run `42364129705`, successful.
- Native v14 replay workflow: run `42364148824`, successful.
- Native run commit: `4a304a970d86700640685e7d5025f3728b847b85`.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Archived native artifact: `13571042806`, `issue25-v14-owner-pokemon-42364148824`.
- Artifact digest: `sha256:283e649307808dc2f43b41c4bdbf86465189ec107962912ba162a9c28f17d5f3`.

The v2 join helper is `simulation/evaluation/agent3-native-pre-attack-public-board-join.cjs`. It now compares the physical Active's actual pinned attack-cost enum against the independently registered source-print cost, and records both players' pre-attack Stadium names and in-play Pokémon printings. The pure test covers a positive direct-source cost match, a negative cost-mismatch fixture, and the public-board context fields.

The native v14 test now requires all eight joined rows to satisfy all of the following:
- actual physical Active observed at the native attack;
- independently registered source attack printing matched;
- actual pinned Active attack cost matches the independent source-print cost;
- direct attached-Energy screen returns `POSSIBLE`;
- native incremental damage delta equals the independently screened printed nominal damage.

The pure workflow and the full manually dispatched native v14 workflow both passed. Thus the current evidence is **8/8 attack roots with exact incremental-damage agreement and 8/8 direct printed-cost coverage**, with actual engine Active-print cost agreement for all eight. This remains attack-level evidence from four original ranks and two candidate lists, not a game-win estimate.

### Eight joined attack roots

| Registered trial | Physical attacker and attack | Printed cost | Pre-attack Energy screen | Target | Native damage delta |
|---|---|---|---|---|---:|
| `6:210:B:champion-reference` | Iron Thorns ex TWM — Volt Cyclone | Lightning + C + C | Speed Lightning Energy + Double Colorless Energy | Girafarig LOT | +140 |
| `6:210:B:new-moon-lockbreaker-v1` | Iron Thorns ex TWM — Volt Cyclone | Lightning + C + C | Speed Lightning Energy + Double Colorless Energy | Duskull VIV | +140 |
| `11:211:A:champion-reference` | Squawkabilly ex PAL — Motivate | C | Darkness Energy ×2 | Dialga-GX UPR | +20 |
| `11:211:A:new-moon-lockbreaker-v1` | Oranguru V ASR — Psychic | C + C + C | Darkness Energy ×3 | Duskull VIV | +130 |
| `11:211:A:new-moon-lockbreaker-v1` | Oranguru V ASR — Psychic | C + C + C | Darkness Energy ×6 | Mewtwo & Mew-GX UNM | +130 |
| `1:212:B:champion-reference` | Latias ex SSP — Eon Blade | Psychic + Psychic + C | Psychic Energy ×3 | Marshadow UNB | +200 |
| `1:212:B:champion-reference` | Latias ex SSP — Eon Blade | Psychic + Psychic + C | Psychic Energy ×3 | Tapu Lele-GX GRI | +200 |
| `1:212:B:champion-reference` | Latias ex SSP — Eon Blade | Psychic + Psychic + C | Psychic Energy ×3 | Trevenant & Dusknoir-GX SMP | +200 |

There are **three** Eon Blade roots, all from the physical Latias ex SSP Active. The eight rows contain no Mimikyu Copycat delegation. The Oranguru/Mewtwo & Mew row's two opposing attached Energy cards are Telepathic Psychic Energy and Psychic Energy; the native attack's +130 delta matches the printed 30 + 50-per-Psychic-Energy formula for those two cards.

### Correct interpretation of Energy cost

The repository manual states that an attack requires the right amount and type(s) of Energy matching its cost (lines 154–156). It also states that Energy normally stays attached after an attack unless the attack specifies otherwise (lines 501–503). Therefore, "actual attached Energy payment" is not a separate discard transaction: the relevant evidence is the pre-attack Energy provider set against the attack's effective cost.

The same manual documents effects that increase or decrease attack costs (D-11/D-12, lines 1947–1955). The v2 artifact records public Stadiums and in-play Pokémon printings to support that review, but this run does **not** certify every possible board-wide cost modifier or every card interaction. The direct-energy status remains a conservative printed-cost screen, and paper attack legality remains unqualified.

The pinned Twinleaf `ptcg-server/src/game/store/effect-reducers/game-effect.ts` attack path performs `CheckAttackCostEffect`, then `CheckProvidedEnergyEffect`, then calls `StateUtils.checkEnoughEnergy`. The successful native AttackAction therefore passed Twinleaf's modeled cost check. This is engine evidence, not independent proof that every relevant card implementation matches paper rules.

### Public attack-cost modifier context

I inspected the v2 artifact's public board fields for all eight attack roots:
- all eight pre-attack Stadium arrays are empty;
- all eight attacking Active `attackerToolNamesBeforeAttack` arrays are empty;
- none of the public in-play Pokémon printings is Espathra ex, the manual's D-11 example of an attack-cost increase;
- there is therefore no identified Stadium, attacking-Active Tool, or documented Espathra-style cost increase in these eight snapshots.

This is useful corroboration for the direct printed-cost screen. It is not an exhaustive card-by-card modifier proof: `printedEnergyTestIncludesExternalCostModifiers` remains `false`, and the test still reports `actualAttachedEnergyPaymentCertified:false`. Do not promote these rows to paper-certified attacks solely from this board scan.

### Rechecked Energy card text

An earlier source-inspection warning about Speed Lightning Energy was a false positive and is retracted. The card text says that the attached card provides Lightning Energy while attached to any Pokémon; only its draw-two effect requires attachment from hand to a Lightning Pokémon. Twinleaf's unconditional `CheckProvidedEnergyEffect` Lightning provision and Agent 30's unconditional direct-energy mapping are correct. No adapter patch or type-gate regression is warranted.

The v29 cases attach Speed Lightning Energy to Iron Thorns ex, so their direct-cost screens remain unchanged. The general external-modifier caveat below still applies: printed-cost coverage does not independently adjudicate every possible board-wide cost modifier.

### Remaining boundary

- Eight joined attack roots do not establish eight completed games.
- The v8 treatment still has root-capped attempts and an unqualified terminal attempt; the qualified competitive-game count remains zero.
- The first candidate response after the rank-11 champion-reference physical Prize exit at root ordinal 86 is Fog Crystal at root ordinal 90, turn 19, with no captured final Pass. Its post-action hand/board/prompt settlement is still an evidence gap.
- No matchup-level win-rate estimate or 99.5% claim is supported.
- The next useful extension is a post-Store-dispatch snapshot of the candidate's first response after each source Prize root, joined by registered trial ID and exact root ordinal. Capture only after the action has dispatched; do not feed hidden-state telemetry into either policy.


## 2026-11-07 v3 declaration-root timing extension (validation pending)

The v2 receipt establishes the public board before each accepted attack root. The v3 compatibility join now consumes the immediate public board after the declaration root and the final public board after prompt closure from the existing candidate-attack-settlement packet. It preserves the declaration root ordinal, initiating root ordinal, declaration turn, prompt-pending state, completion root ordinal/turn, physical Active printing, printed attack names, whether the declared attack is printed on that Active, whether the direct AttackAction matches the printed attack, and the trigger action.

For each of the eight actual KO-victim joins, the v3 row records:
- the target's location and damage immediately after declaration and after prompt closure;
- target printed HP and whether its damage threshold was reached at either snapshot;
- damage change from pre-attack board to declaration root, declaration root to actual native KO, and declaration root to prompt closure;
- whether the target was actually removed during later prompt resolution, separately from whether it merely reached printed HP during that later resolution;
- a declaration-root versus prompt-closure classification and both raw public snapshots.

The classification distinguishes threshold already reached at declaration, KO removal during later prompt resolution, threshold reached during later prompt resolution, target absent from in-play after declaration, target on Bench after declaration, removal without a recorded prompt chain, and inconsistent final board evidence. A final public board that still shows the KO-observed printing in play below printed HP is explicitly marked inconsistent. Missing legacy immediate-board data remains readable and is classified unknown; old v2 artifacts are preserved unchanged.

The pure regression suite now covers direct declaration-root damage, a delegated Copycat-style KO during later prompt resolution, later HP-threshold evidence without conflating it with KO removal, a target moved to Bench and later KO'd, a target still on Bench conflicting with a native KO receipt, missing legacy declaration-root snapshots, and mismatched physical Active identity fields. The v29 native integration test requires all eight rows to contain immediate/final boards, physical Active identity, root/prompt lineage, and a non-unknown/non-inconsistent classification. It emits an additional AGENT3_V29_DECLARATION_ROOT_TIMING summary with per-row damage deltas and classification counts.

No new workflow was added. The existing manual-only pure workflow is .github/workflows/agent3-native-pre-attack-pure.yml. The existing manual-only native integration workflow is .github/workflows/agent50-rank26-koko-dual-recipient-native.yml; dispatch it with issue25_v14_only=true to run the v29 integration test. The successful v2 native artifact 13571042806 from run 42364148824 remains the immutable prior receipt. A fresh v3 pure run and native v29 replay have not yet been observed.

Current patch commits: helper b69ea2937e415557b138df314b0476f088ed64fb; pure regression suite d373eaa9a186fa5065a70435d2ab391e27918d4f; v29 integration assertions 293c47f381eacbfece14376124ad1c8975e89bac. These are research telemetry and join improvements only. They do not certify paper rules, legal Energy payment, completed games, or competitive strength.
