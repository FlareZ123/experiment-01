# Rank-11 source-held Boost Shake autonomous exposure screen

**Agent 6, 18 October 2026. Scope: preregistered gameplay diagnostic, unqualified for win-rate inference.**

## Prior observed gap

The published rank-11 source 60 contains two Boost Shake and six Tools (three Float Stone, two Forest Seal Stone, one Muscle Band). The incumbent `rank11-autonomous-boostshake-v1` expressly rejects own hands holding Boost Shake and Forest Seal Stone. [Source-locked exact structural census](rank11-boostshake-opening-census.md) calculates a **6.45550612%** union of held-Shake with *any* immediately available Tool after the normal first draw, conditioned on a legal initial seven and specified accessible Trubbish/Garbodor targets. The new policy supports **only the subset that has Battle VIP Pass in hand and searches a Trubbish from the deck**. Do not ascribe that 6.46% figure to this restricted implementation, or extrapolate it to lock execution.

## New policy and frozen source schedule

- Research adapter: [rank11-held-shake-opener.cjs](../../simulation/twinleaf/rank11-held-shake-opener.cjs). Reads the acting rank-11 player's hand and visible board at an actual first-personal-turn decision, then selects actual Store actions. Owner-only deck searches are examined at genuine active prompts; absent target causes recorded abort and original-bot fallback. The policy chooses held Float Stone before Muscle Band before Forest Seal Stone, a deterministic heuristic whose value is unqualified.
- Intended line: own-hand Battle VIP Pass → source-deck Trubbish → attach one held Tool to its Bench slot → own-hand Boost Shake → source-deck Garbodor → evolve tool-bearing Trubbish. This is six Store actions with prompts, compared with the previous eleven-action Oranguru search chain. No ability use, target manipulation or fabricated hand is allowed.
- [Source exposure runner](../../simulation/twinleaf/rank11-held-shake-source-screen.cjs) preregisters **80** SHA256-derived independent seeds under the constant label `agent6-rank11-held-shake-v1-20261018-precommitted`, physical rank-11 seats alternating 0 and 1. Every attempt is retained, including no-opportunities, unsupported prompt paths and unfinished games. Each source deal uses published rank-11 60 and unchanged published rank-1 Shadow Rider 60. Max 85 root actions per game. The policy does not change the benchmark reference or global shared profiles.
- Frozen schedule digest (SHA256 over ordered JSON): `2acd32fbdac8dbe9c3366c496f26583e7db0a4689855f2f12d8881fcc17956b6`. This digest, deterministic full derivation and first/last cells were established before any source game was run; [schedule regression](../../tests/rank11-held-shake-schedule.test.cjs) checks them.
- [Own-hand guard regression](../../tests/rank11-held-shake-opener.test.cjs) covers both physical/actual-start orientations, all three published Tool names, constraints and K0 hidden-info guards.
- Existing **manual-only** workflow `aichi-garbotoxin-crosslock.yml` accepts `rank11_held_shake_source_screen: true` and archives the full trial JSON. No per-commit CI added.

## Independent exact resource-window cross-check

The independently coded [integer combinatorial census](../../scripts/rank11-held-shake-resource-census.cjs) enumerates the published 11-bucket rank11 source 60 (11 total Basics) as a seven-card initial hand, six face-down Prizes, and one normal start-of-turn draw. For a legal seven, it requires held **Battle VIP Pass + Boost Shake + one of six printed Tools** and at least one Trubbish plus one Garbodor remaining in the deck after prizes. Among the **324,031,005,021,884,160** legal-opening physical worlds:

- **14,140,249,441,478,160** satisfy the own-hand resource gate, or **4.36385692%**.
- **13,003,476,027,133,872** also preserve both searchable targets, or **4.01303450%**.

The counting formula sums multinomial bucket draws with 7 or 8 possible designated normal-draw cards, followed by six-Prize inclusion-exclusion. The legal-opening denominator exactly reproduces the previously published independent source census; a 250,000-deal seeded physical-shuffle check (194,503 valid openers) produced 7,723 search-ready cases, approximately 3.97063% of valid samples. [Pinned regression](../../tests/rank11-held-shake-resource-census.test.cjs) checks exact numerators.

**4.0130% is an upper bound on this restricted branch's raw hand and deck resources**, before actual Basic placement, opposing first-turn lock, competing uses of cards, legal Store prompts or playing-policy choices. It is distinct from Agent1's broader 6.4555% direct route, which permits held Trubbish and does not require VIP.

## Qualification criteria and limitations

Diagnostic CI success requires test/runner completion. **Actual source-opener exposure success** requires at least one attempted legal plan that completes to Tool-equipped Garbodor before the candidate's following turn. This is separately recorded as `exposureGatePassed`; the runner does not discard unsuccessful seeds. Source-deck and opponent identity are paired with uninstrumented control on each triggered deal and source action noninterference checked on four untriggered controls. Candidate first actions are recorded, but the generic rank-1 response is not certified competent.

The actual global first-player is observed from the engine, independently of physical seat. A source-first positive on a selected seed is a conditional mechanism result only. The benchmark is incomplete at 29/32 exact source lists; existing clone, policy, hidden-info and paper-rule qualification blockers remain. No 99.5% claim, no qualified competitive game and no new final deck nomination follow from this screen.

## Execution status

Manual workflow [39095261824](https://github.com/FlareZ123/experiment-01/actions/runs/39095261824) was dispatched on pre-outcome commit `a31df56540accf89e5c9d02cc7c508dc6e6a1fea`. **Pending verification** at this report's initial commit. Do not cite a screen result until checking its terminal CI status and original output artifact.
