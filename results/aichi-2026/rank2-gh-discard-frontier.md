# Aichi rank-2 Vileplume: Guzma & Hala two-discard frontier

**Agent 35, 18 October 2026. Evidence class: exact restricted-source resource sensitivity with independent physical-deal check.** No source-dealt first-turn setup or competitive result is established. Pinned input is the unchanged 60-card rank-2 Takahiro Ando Vileplume source in [full-decklists.json](full-decklists.json). The script does not change either deck or gameplay policy.

## Question

The published source includes two Bunnelby, six evolvable Basics, four Guzma & Hala, four Tag Call, two Technical Machine: Evolution and two Jet Energy. The earlier [exact first-turn resource model](vileplume-double-tm-opening.md) measures Tool and Energy search as theoretical connectivity. Guzma & Hala's optional mode requires **discarding two cards** to access the Tool and Special Energy. Do relevant source openings still contain two expendable cards when one protects singleton resources and reserves the immediate attack line?

## Frozen model

The published 60 is classified into 12 disjoint physical-card categories. All 60 are counted and verified by [the source assertion](../../scripts/aichi-vileplume-gh-discard-frontier.cjs): Bunnelby **2**, evolvable Basics **6**, six other singleton Basics **6**, Guzma & Hala **4**, Tag Call **4**, TM Evolution **2**, Jet **2**, Capture **2**, Memory **1**, Basic Grass **1**, 13 other singleton Pokémon/Trainers, 17 other repeated Pokémon/Trainers.

An opening seven is uniformly dealt from the original 60; it must contain one of its 14 Basics. Six random Prizes come from the remainder, then one ordinary first-turn draw is added. A specific Bunnelby plus one evolvable Basic must be visible among the eight. If Bunnelby started Active, any suitable directly visible Energy qualifies; if drawn only on turn one, the restricted pivot requires Jet Energy. Direct TM/Energy can be reserved in hand, and a missing Tool/Energy can be retrieved by Guzma & Hala, accessed directly or through Tag Call, provided search targets remain outside the six Prizes. Source search targets are integrated with exact inclusion-exclusion.

**GH-dependent** means at least one of Tool or Energy is missing directly, hence the proposed setup needs the optional discard/search mode. The model reserves Bunnelby, the evolving Basic, the GH or Tag Call access card, and any directly needed Tool and Energy. It assumes the player delays playing other cards until after resolving the Supporter.

Three **nested discard-capacity screens** are deliberately modeled as sensitivity assumptions:

1. **Mechanical surplus:** there are two other original first-eight cards after reserving the immediate named role cards. This ignores long-term card value.
2. **Preserve singleton print names:** the two possible discard candidates must come from repeat-count names. Six singleton utility Basics, 13 other singleton Pokémon/Trainers, one Memory Energy and one Basic Grass are protected. Any otherwise unreserved duplicate, including Evolution stages, other Energy, tools or stadiums, is only a *potential* discard. This is optimistic about their strategic value.
3. **Spare connectors only:** two cards must be surplus copies of Bunnelby, Guzma & Hala or Tag Call after reserving the required copies. This is intentionally strict and **does not imply that other cards are actually undiscardable**.

The categories and the one-tool, one-Supporter and K0 search choices are restricted approximations, rather than a complete legal-turn solver or a context-dependent DCI calculation.

## Exact result

| Nested first-eight event | Probability conditional on valid seven | Fraction among GH-needed event |
| --- | ---: | ---: |
| Bench Basic + GH-dependent Tool/Energy resource route | **9.243804789%** | 100% |
| Two mechanically unreserved cards | **9.243804789%** | 100% |
| Two repeat-count discard candidates with singleton names protected | **7.795492679%** | **84.332078150%** |
| Two spare Bunnelby/GH/Tag Call copies | **0.633889398%** | **6.857451155%** |

The **1.448312110 percentage-point** reduction from 9.243804789% to 7.795492679% shows that approximately **15.6679%** of the restricted GH-dependent theoretical openings lack even two non-singleton candidates under the protected-name screen. Whether the other 84.3% can safely pay a discard cost depends on game state, intended multi-turn line, opponent, and card role. Conversely, the connectors-only screen is a restrictive hypothesis, never a bound on all realistic high-DCI cards. The earlier 10.660926% direct-or-search Bench-target result includes direct lines that do not require this GH mode; the two model events must not be conflated.

A separate **0.722128599%** of valid seven openings in this model has the whole TM/Energy resource pair visible *and* GH or Tag Call access. These direct-ready cases are excluded from the GH-dependent denominator because GH's discard-two mode is unnecessary to obtain the immediate named resources.

## Independent physically-dealt check

[Standalone seeded source-deal test](../../tests/aichi-vileplume-gh-discard-physical.test.cjs) deals **180,000** random 14-card physical prefixes with the six Prize identities explicitly removed before checking searchable cards. It shares only the published group counts and classification labels with the exact combinatorial code. Seed **20261018** (xorshift32/Fisher-Yates), with **154,842 accepted valid initial sevens**:

| Event | Exact conditional | Physical sample conditional |
| --- | ---: | ---: |
| GH-dependent route | 9.2438% | 14,371 / 154,842 = **9.2811%** |
| GH route plus singleton-protected discard candidates | 7.7955% | 12,152 / 154,842 = **7.8480%** |
| GH route plus two spare connector copies | 0.6339% | 1,000 / 154,842 = **0.6458%** |

All three differences are below the predeclared **0.30 percentage point** regression tolerance. This independent check samples deals; it does not execute a real first-turn Supporter or demonstrate optimal discarding.

## Reproduce and decision value

- [Exact source-count enumeration](../../scripts/aichi-vileplume-gh-discard-frontier.cjs), using the existing [validated prize inclusion-exclusion helper](../../scripts/aichi-vileplume-tm-opening.cjs).
- [Source-list and exact-numeric regression](../../tests/aichi-vileplume-gh-discard-frontier.test.cjs).
- [Independent 180,000 physical deals](../../tests/aichi-vileplume-gh-discard-physical.test.cjs).
- Both tests and a machine-readable JSON artifact are added to the existing manual-only [Aichi TM policy workflow](../../.github/workflows/aichi-tm-attack-policy.yml). **Compiled manual CI [39110850585](https://github.com/FlareZ123/experiment-01/actions/runs/39110850585) passed** all 35 job steps at pinned repository head `f96c9dafd7fbe4b0fdfdaba9d9723e91f4694da7`, including the source manifest count assertion, exact numeric tests, independent 180,000 physical deals, and prior existing Bunnelby/TM regressions. Preserved artifact `rank2-gh-discard-frontier-resource-only` ID `12130337827`, archive SHA-256 `62488321c8ea1383f3635cb554fcd25d1e5a58ed1a6a669df7b1ca792673c99e`. This is proof of this bounded computation and existing test compatibility, not of a playable first-turn GH sequence.

The observed rank-2 [turn-five source policy fork](../twinleaf/agent24-rank2-policy-fork-ci-evidence.md) provides an independent real-hand example: playing GH in a three-card hand would expose both Stoutland and Bellelba & Brycen-Man to the two-discard cost. That K1 turn-five observation has a different distribution from this K0 first-eight study, but illustrates why theoretical access and discharge of the cost need separate measurement.

**Limitations:** no other Item/Ability connectors, opponent mulligan bonus cards, alternative Supporter sequencing, dynamic DCI, actual two-attack Ω Barrage execution, lock establishment, informed opponent response, Prize recovery, clone/reducer fidelity or paper 25-minute timing. A repeat-count card can be critical; some singleton cards can be safely discarded. The fractions are resource-opportunity and discard-screen sensitivities, with **zero competitively qualified games and no supported win-rate estimate**.

**Interpretation:** a connector-only model can overstate usable GH turns; source-aware discarding deserves its own tracked policy channel in the rank-2 ALS replay. Test which cards are actually sacrificed under the complete hand, and whether those sacrifices weaken evolution and recovery on the opponent's reply before changing deck or opponent policy.
