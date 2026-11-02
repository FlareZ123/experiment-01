# Original rank-5 source: 20 native Genesect V Bench plays, zero Ability-use root actions

**Agent 9 | 2 November 2026 | retrospective read-only census of frozen v3.1 original-source policy archive | no qualified games**

## Evidence and decision impact

The corrected-rank5 native release [Agent 13, run 41387484608](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608) retains **16 complete native Store root-action ledgers**: eight frozen-v2 controls and eight original rank5 integrated-v3.1 treatments. The original opponent is the authenticated final-rank-5 Mew/Genesect 60. The frozen ZIP artifact ID is **13115652707**; its independently published ZIP SHA256 is `62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d`, engine commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

I re-read the actual **`rawNativeRow.rootActionLedger`** in each individual archived arm, verifying that its length equals both `rootActionCount` and `actionCount`, then filtered by **the original source's actual physical player seat**. In parallel, I used the independently recorded **native accepted-target sidecar**, counting only accepted source-owned `PlayCardAction` with `Genesect V FST` as the owner-hand printing and an actual public board transition onto the original owner's Bench.

| Actual native receipt | Frozen-v2 control | Integrated-v3.1 treatment |
| --- | ---: | ---: |
| Original source attempted arms | 8 | 8 |
| All-seat native actions preserved | 1,780 | 1,596 |
| Original source native actions preserved | 830 | 768 |
| Source `PlayCardAction` | 43 | 59 |
| Source `ResolvePromptAction` | 549 | 503 |
| Source `PassTurnAction` | 238 | 198 |
| Source `AttackAction` | **0** | **8** |
| Source `UseAbilityAction` | **0** | **0** |
| Both-seat `UseAbilityAction` | **0** | **0** |
| Actual source Genesect V hand-to-Bench placements | **10** | **10** |

The integrated actor significantly improved the Mew VMAX attack line, but the archive contains **no accepted explicit `UseAbilityAction` in either role**, despite genuine Genesect V Bench establishment in both groups. The pinned [Genesect V FST185 implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/genesect-v.ts) implements Fusion Strike System as a conditional `WAS_POWER_USED` triggered Ability. Pinned [game-actions.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/actions/game-actions.ts) defines `UseAbilityAction` explicitly. This supports a **policy activation gap** relative to the available printed Ability, but no claim that every earlier turn had a net-positive or even eligible Ability use. A Genesect entering via deck search does not supply draw unless its Ability is actually used with its conditions satisfied.

This matters for the [original rank-5 VIP recipient comparison](agent9-vip-bench-entry-provenance-20261102.md). A policy that replaces `Mew V + Crobat V` with `Mew V + Genesect V` may improve future access to a powerful support Ability, but its benefit cannot be accurately tested by a bot that never selects that Ability. The currently validated VIP selector has already been observed choosing Crobat despite Genesect availability in [four actual original-owner prompts](agent9-rank5-native-vip-owner-alternatives-20261102.md). Effective source-opponent competence therefore needs a **native, owner-visibility-safe Genesect Ability-use and draw-response policy**, as well as the search-target alternative, before making matchup conclusions.

## Reproducibility and limitations

- Independent reader: [`scripts/agent9-v31-genesect-ability-archive-census.cjs`](../../scripts/agent9-v31-genesect-ability-archive-census.cjs), exporting `censusArchivedGenesectAbility(archive)`. Its returned 16 per-arm rows retain source physical seat, native root counts and accepted Genesect Bench transition ordinals.
- [Three direct positive/negative synthetic tests](../../tests/agent9-v31-genesect-ability-archive-census.test.cjs) exercise seat attribution, native acceptance, public post-dispatch board movement, both-mode completeness and fail-closed root-count checks; **3/3 passed locally under Node 22**.
- A local read of **all 16 actual archived rows** produced the exact table above; it did not change or rerun a game. A manual CI replay of this census against the immutable archived JSON is recommended before promoting it to shared policy release work.
- `UseAbilityAction` absence is an observation about **accepted native action traces**. It is not a proof that a physical player could profitably use Fusion Strike System every turn, or that other passive Abilities never affected the match.
- The original source does not need Genesect V to be drawn from the deck via VIP in these groups; the ten counted placements per group are verified **hand-to-Bench** `PlayCardAction` transitions. This prevents conflating the previously observed VIP entry path with unrelated in-hand plays.
- Outcomes include engine terminals and action caps. None are paper-clock-qualified tournament wins. Cross-candidate same-seed arms should never be treated as identical physical deals without matching fingerprints.

**Next native competency gate:** one opt-in both-seat original-source `UseAbilityAction` from a genuine owner-observed Genesect V, after explicitly confirming its native legal target, hand-size-to-Fusion-Strike-board-count condition, per-turn marker and remaining deck. Verify Store acceptance, printed draw count, no hidden opponent reads, next owner action, and real opponent continuation. After that, retest the VIP search-target counterfactual on exact matched source deals. Retain unsupported/negative opportunities in denominators.

**Overall field:** 29/32 original printed source sixties authenticated (ranks 23/25/28 absent); zero competitively qualified games; no demonstrated 99.5% fixed 60.
