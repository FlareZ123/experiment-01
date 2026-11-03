# Original rank9 owner-visible Battle Compressor after Pass: real Store retrospective, zero selected roots

**Agent29 | 3 November 2026 | source-printed original 60, four previously observed physical groups, eight native attempted games | zero competitively qualified games**

## Why this comparison was needed

The authenticated original Aichi rank-9 Shun Ito *Absol Electrode* 60 contains one Battle Compressor PHF, two Electrode-GX CES48, a Voltorb and Mega Absol ex. Existing same-deal observations of the generic actor-only policy revealed **29 Electrode-present source Passes with zero Energy in the owner's discard, including 19 Passes while physically holding the one Battle Compressor**. All 29 had a non-GX/non-EX Mega Absol recipient in play. This reveals a concrete source policy resource-placement failure, but does not establish that spending the Item or using Extra Energy Bomb is optimal.

A [genuine staged Store regression](agent29-rank9-native-compressor-bomb-claw-20261103.md) separately proved the complete source **Battle Compressor → 3 physical Prism Energy discarded → paper-correct Extra Energy Bomb → Mega Absol 3-Energy Claw of Darkness (200 damage and opponent-hand discard)** in both physical player seats. Its board/hand/opponent were prepared, so we must test whether an autonomous owner policy actually discovers part of the line.

## Default-off owner-root intervention

[Source code](../../simulation/twinleaf/agent29-rank9-compressor-owner-bridge.cjs), [six passing pure behavior/security checks](../../tests/agent29-rank9-compressor-owner-bridge.test.cjs) in the existing [manual Energy census CI 41614893312](https://github.com/FlareZ123/experiment-01/actions/runs/41614893312). The new experimental root hook is nested **inside** the shared actor-only root in [canonical composition](../../simulation/evaluation/agent7-canonical-actor-composition.cjs), to observe its actual terminal Pass before proposing the source's real `Battle Compressor PHF` `PlayCardAction`.

The gate consults only the owner's exact held Item and public board/discard and the opponent's public remaining-Prize count. It requires source Mega Absol and Voltorb/Electrode in play, fewer than three original Energy cards in own discard, no public Item lock, at least three cards remaining in own deck, opponent more than two Prizes remaining, and global turn no later than 12. It performs a real native `canPlay` check before proposing the Item. Only after an actual owner-deck `ChooseCardsPrompt` may it inspect original physical source Energy and choose up to three relevant cards to discard. The live Store identity is required for native acceptance and same-object owner-deck-to-discard evidence; speculative simulator clone actions are excluded.

This is explicitly a **source-only developmental Item proposal**, not a proposed symmetric competitive two-player decision policy. The original Player card/normal attachment/Supporter/other Item interactions can dominate the proposal. The limited early-turn guard is an investigational conservative assumption that needs empirical re-evaluation.

The [existing bilateral development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) now has two **default-off** flags, `actorRank9CompressorOwnerBridge` and `paperRank9ElectrodeGXCorrection`. The bridge requires the existing corrected CES48 Energy-cardinal/payment hook. Historical shared registrations remain unchanged.

## Completed paired historical native experiment

The [retrospective runner](../../simulation/evaluation/agent29-rank9-compressor-owner-bridge-retro.cjs) uses the existing **four original rank9 source physical groups** of Agent10, two already nominated candidate 60s (reference champion and New Moon Lockbreaker), on both source physical seats. The **control and treatment have precisely matching original-source seed/group/candidate and complete physical opening-deal fingerprints**. Both use the identical paper-correct CES48 hook; only the owner-root Compressor bridge differs. These groups were selected earlier, so they are a retrospective **mechanism debugging cohort**, with no prospective game sample, independent holdout or field win-rate value.

[Compiled native GitHub Actions 41616121429](https://github.com/FlareZ123/experiment-01/actions/runs/41616121429) **passed**, including **56/56 CES48 real-Store regressions** and the complete eight-attempt retrospective developmental workload. All four matched full two-deck physical fingerprints were verified, and all four treatment arms included the new owner-root audit. [Raw complete native attempt artifact 13220749290](https://github.com/FlareZ123/experiment-01/actions/runs/41616121429/artifacts/13220749290).

**Observed aggregate in that bounded historical cohort:**
- Four exact same-deal candidate/source pairs with audit present for every treatment arm.
- **Zero** actually selected and accepted source Battle Compressor roots from the new bridge.
- **Zero** physical original source Energy cards moved from own deck to discard through this experimental bridge.
- Neither that zero nor any native winner/cap status establishes real game or deck performance.

An earlier [CI 41615408698](https://github.com/FlareZ123/experiment-01/actions/runs/41615408698) ran all eight actual games but failed its own **postgame reporting assertions** because the report code looked for nonexistent field paths `initialFullPhysicalDealFingerprint.digestSha256` and `actorOnlyDecisionCoverage.components`. The correct persisted row fields are the top-level `fullPhysicalDealFingerprint` string and `actorOnlyDecisionCoverage.detailedComponentAudits`. That parser error was corrected, and the passing second run above is the outcome evidence. Do not interpret the initial report-side false match value as a gameplay difference.

A follow-up native run now adds per-arm counts of actual Passes, policy eligibility and root proposals to diagnose the zero accepted count. The remaining possibilities include overly conservative owner public gates and actual policy eligibility. Any later decision to expand the root policy must remain independently tagged and compared in a new developmental arm.

## Qualification

Source exact printed sixty is known, but paper gameplay source policy is still unqualified. The generic opponent does not demonstrate independent competent strategy. The native run does not observe a competitive-paper 25-minute event clock, many card effects are incomplete, and three Aichi Top32 original lists remain unauthenticated. **No fixed best 60, zero qualified full games and no verified 99.5% win rate**. The value is a reproducible owner-root integration mechanism and a falsifiable test of whether it executes on actual source decisions.

## Per-root provenance check of the first v1 zero, independently rerun

[Third compiled native CI 41616548763](https://github.com/FlareZ123/experiment-01/actions/runs/41616548763) succeeded at research head `c6821f3d0f4b1e79d3c94e0b4e5512bcaa5bc81a`, native **56/56** tests passing, and published [complete raw eight-game artifact 13221547727](https://github.com/FlareZ123/experiment-01/actions/runs/41616548763/artifacts/13221547727). It reports **true** for both all identical physical deal fingerprints and all four real source owner-policy audit receipts. The actual live source Pass decision counts (post-actor, source side only) were:

| Original full-60 candidate, physical source seat | Actual source Passes seen inside new adapter | Eligible Passes | Native Item proposals | Native Item accepted | Source physical Energy moved |
| --- | ---: | ---: | ---: | ---: | ---: |
| Champion reference, source B | 9 | 0 | 0 | 0 | 0 |
| New Moon Lockbreaker, source B | 21 | 0 | 0 | 0 | 0 |
| Champion reference, source A | 7 | 0 | 0 | 0 | 0 |
| New Moon Lockbreaker, source A | 6 | 0 | 0 | 0 | 0 |
| **Total** | **43** | **0** | **0** | **0** | **0** |

This proves the experimental hook **does see the real source owner's terminal Pass** rather than being masked by canonical actor root ordering. Native root acceptance is zero because **the bridge's own eligibility gate returns no proposal** in these actual sampled Passes. The original stage and the target source game share the same original printed card list, but the gate's conservative early-turn timing and other present-state conjunctions may have excluded late but otherwise viable original source opportunities. A subsequent read-only audit is measuring actual held Item and independently failing conditions, preserving every source Pass and physical root.
