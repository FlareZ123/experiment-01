# Agent 41: convert 889 real Store root receipts into physical card-play identities

**9 November 2026.** Independent postgame reduction of Agent36's real eight-trial v8 physical custody archive. This supplies a reusable source for *which original physical card was played*, despite missing native action labels. It remains developmental and **certifies zero paper-qualified games**.

## Exact input and results

Input: [native run 42637232845](https://github.com/FlareZ123/experiment-01/actions/runs/42637232845), [raw artifact 13683832636](https://github.com/FlareZ123/experiment-01/actions/runs/42637232845/artifacts/13683832636), archived JSON at agent36-paper-root-capture/agent36-v8-native-paper-root-capture.json, recorded SHA-256 c72818d47e561fa4c39a649ab0e21f1500856cc2968b63be0e682fac03d02f01, vendor pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. All eight registered attempts are retained, including capped/error attempts. An independent local Python reduction reads the actual registered 120 physical card identities and before/after Store positions. No native game was rerun and no treatment was introduced.

| Native-observed quantity | Exact count |
| --- | ---: |
| Registered historical attempts | 8 |
| Exact accepted Store roots | 889 |
| Card-play roots | 98 |
| Non-null native card declaration on these plays | 0 |
| Card-play roots with exactly one original physical card leaving the actor's hand | **98/98** |
| Within-zone index reorders (not payment) | **12,304** |
| Transfers between two known different native zones | **619** |
| Transient off-zone entries/exits | **152** |
| Observed cross-owner physical-zone placements | **0** |

The prior 13,075 position differences decompose exactly into 12,304 index-only reorders, 619 known-zone transfers and 152 temporary off-zone legs (76 exits and 76 reentries). None of the 12,304 index changes is counted as paid discard or card movement between zones. Physical printing comes from original deck registration and actual Store acting seat, without guessing from array positions.

One independently inspectable paper-line example is present in the same tape: **12 Fog Crystal CRE plays** have exactly one deck-to-hand selected original physical card at the next native prompt; all 12 corresponding Fog Crystal cards later move from their native supporter staging zone to discard. The 12 searched printings are Latias ex SSP (3), Duskull VIV (2), Lillie's Clefairy ex JTG (2), Marshadow UNB (1), Mimikyu GRI (1), Galarian Articuno V CRE (1), Girafarig LOT (1), and Psychic Energy MEE (1). The supplied CRE card text permits a Psychic Energy or a Basic Psychic Pokemon. The selected printings have those categories in the supplied English database. This supports physical search-and-discard sequencing for those observed roots. It does not independently certify Japanese Extra legality, source policy competence, full-turn payments, hidden-information handling or competitive game outcomes.

## Working code and execution evidence

- [Read-only physical-root consumer](../../../simulation/evaluation/2026-11/agent41-store-physical-action-bridge.cjs) derives normalized zone identity, acting-hand exits, played print identity, unknown physical IDs, cross-owner anomalies and explicit ambiguity. It does not alter a native Store or give hidden zones to either player policy. Multiple or uncertain hand exits return AMBIGUOUS_OR_INCOMPLETE_PHYSICAL_PLAY. Conflicting declared printings return DECLARED_PRINTING_CONFLICT.
- [Pure fail-closed regressions](../../../tests/2026-11/agent41-store-physical-action-bridge.test.cjs) cover zone normalization, physical identity despite absent declaration, multiple exits, transient off-zone entries, foreign-owner movement, declared-printing mismatch and complete-archive reduction.
- The targeted step **Regress accepted Store physical card-play identity and deck-shuffle separation passed** in existing manual [run 42646791587](https://github.com/FlareZ123/experiment-01/actions/runs/42646791587). The overall workflow failed in two other steps: Check default-off owner Jet Bench switch proposal and shared symbolic Energy matcher; Preserve policy test failures and strictly pin immutable source releases. Thus this is a targeted pure test pass, not an overall green CI or native-qualification pass.

## Integration boundary

Agent36's real-Store producer can use this postgame reducer to expose the exact played physical printing wherever the actor hand exit is unique. If one Store action moves more than one card from hand, retain ambiguity and obtain finer action evidence. Preserve raw before/after identity and all prompts.

Agent42's causal source certificate can consume a real exact Store-accepted action separately from a paper-valid payment ruling. A sidecar Boolean is not physical proof. Printed costs, opponent targets and owner-private choice conditions require independent auditing.

Five of the eight outer capture rows have originalSourceSeat missing despite every inner root recording its actual acting seat. A future prospective packet should record source and candidate roles from its authoritative native trial instead of relying on trial-label inference.

Prioritize the next independently reviewed complete original-source game using these exact receipts. Do not claim a best 60 or a paper field win rate from this historical developmental eight-trial tape.

**Status:** original physical action-identity evidence available; printed-effect adjudication pending; independently paper/clock-qualified games **0**.
