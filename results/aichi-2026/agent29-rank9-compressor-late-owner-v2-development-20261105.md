# Original rank-9 Battle Compressor: any-turn owner-only v2 development

**5 November 2026, Agent 29. Status: SOURCE-POLICY EXPERIMENT, NATIVE V2 NOT RUN, ZERO QUALIFIED GAMES.**

## Question and prior observed denominator

The original Aichi rank-9 source list holds printed **Battle Compressor PHF** during source-owner Pass turns where its original Mega Absol ex plus Voltorb/Electrode-GX board could benefit from Energy being moved from its own deck to the public discard. A 3 November native read-only observation of **four historically reused exact original physical source deals** found **43 original owner Pass decisions**. The conservative original v1 policy required `globalTurn <= 12`, so it proposed **zero** Items. On source seat B, **19 source Passes** holding Compressor satisfied all other then-recorded public gates but occurred from turn 16 onward. On source seat A, **nine held Passes** failed the Mega/Voltorb board gate. These are repeated decisions within four dependent trajectories, **not 19 independent opportunities or games**.

Evidence: [Agent29 original native audit](agent29-rank9-owner-compressor-actorpass-retrospective-20261103.md), [CI 41617144991](https://github.com/FlareZ123/experiment-01/actions/runs/41617144991), [archived 8-attempt artifact 13221174937](https://github.com/FlareZ123/experiment-01/actions/runs/41617144991/artifacts/13221174937). An eligible held Pass did not establish that native Store would accept the Item, that the owner deck retained suitable Energy, that the line was strategically preferred, or that a later attack would occur.

## New intervention

A new, **separately labeled default-off v2** allows the source owner to *consider* the same Battle Compressor at later turns. `chooseRank9CompressorAfterPass(view,{maxGlobalTurn:Infinity})` relaxes only the earlier cutoff. Existing v1 calls still default to the historical maximum of 12. The source-specific intervention continues to require the printed Item in the actual own hand, an owner-public Mega Absol and Voltorb/Electrode, an own-deck count of at least three, fewer than three recognized Energy cards in own public discard, no owner Item lock, and more than two opposing Prizes remaining. The native physical card's `canPlay` is checked before submitting the Item. **These gates are conservative research heuristics, not a complete paper legality or tactical superiority certificate.**

The own-deck contents remain unseen during root selection. Physical Energy is inspected and selected only when a genuine owner `ChooseCardsPrompt` for `CHOOSE_CARD_TO_DISCARD` exists, with `prompt.cards===owner.deck` and native prompt validation. The adapter now handles that authenticated pending prompt *before* calling the stock `decodeNextAction`, which could otherwise throw before this owner-specific handler gets to act.

Modifications:

- [Source-only hook and audit](../../simulation/twinleaf/agent29-rank9-compressor-owner-bridge.cjs): added `LATE_VERSION`, explicit `maxGlobalTurn`, prompt-first handling and audited turn bound.
- [Canonical owner wrapper](../../simulation/evaluation/agent7-canonical-actor-composition.cjs): optional `rank9CompressorMaxGlobalTurn` propagated inside existing root composition.
- [Bilateral native runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs): opt-in `actorRank9CompressorAnyTurn` requires existing `actorRank9CompressorOwnerBridge`; the historical default is unchanged.
- [Historical original-rank9 comparison entry](../../simulation/evaluation/agent29-rank9-compressor-owner-bridge-retro.cjs): `AGENT29_RANK9_COMPR_ANYTURN_V2=true` registers the separate v2 label, same original four source trial IDs and source/candidate seats, and retains all control/treatment records.
- [Existing manually dispatched workflow](../../.github/workflows/agent45-electrode-bomb-native-store.yml): optional `rank9_source_compressor_anyturn` input archives the v2 records including failures. No push-trigger workflow was created.
- [Regression tests](../../tests/agent29-rank9-compressor-owner-bridge.test.cjs): historical cutoff, late-root visible gates and owner-prompts preceding stock decoder.

## Executed local verification

All five changed JavaScript files parsed through V8 `Function` compilation. The exact committed source module and test file were executed in an isolated CommonJS-compatible V8 harness with fake dependencies. **10/10 unit callbacks passed**, including a fake Store where stock `decodeNextAction` throws on the owned `ChooseCardsPrompt` while the new owner handler selects two physical Energy references, the fake Store moves them to discard and the audit counts the accepted Item and two moved cards. The old mock fixture initially used an ordinary Object as a prompt, failed the intentional native constructor-name guard, and was corrected to a dedicated `ChooseCardsPrompt` class before final 10/10 pass. This is a mock Store, **not a pinned Twinleaf Store validation, actual CI success, or an original-source game**.

In particular, the real paper cost, native prompt message, selection count, settled native zone custody, aborted trials, attacker payoff and opponent continuation remain unverified for v2.

## Next acceptance gate

Run the existing manually dispatched `agent45-electrode-bomb-native-store.yml` with `rank9_source_compressor_anyturn=true`. Preserve all eight original registered control/treatment attempts and compare exact *initial physical source deal* parity across each pair, actual first-player seats, statuses, and paper receipts. Confirm: original owner held Compressor at actual Pass; owner-public eligibility; real Store accepted `PlayCardAction`; genuine owner deck `ChooseCardsPrompt`; selected physical Energy and deck-to-discard movement; actual subsequent legally paid Electrode-GX/attack or a clearly classified missed payoff; and a meaningful opponent reply. A normal native decoder failure or any rejected Item is a negative result, and absence of an opportunity is also reportable.

The v2 intervention may cause late resource depletion, give up more valuable search opportunities, or fail to convert into attacks. The test must treat those as possible outcomes. No v2 games have been executed as of this report. Neither the four original retrospective seed groups nor any prospective cohort currently supports a win-rate estimate.

## Global decision status

No final fixed 60 is selected. The benchmark remains at **29/32 authenticated original Top 32 name/count 60s**, missing ranks **23, 25 and 28**. No competitively qualified game or 99.5% field win rate has been demonstrated.
