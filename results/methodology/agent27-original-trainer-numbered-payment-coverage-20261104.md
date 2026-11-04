# Source-numbered Trainer hand-payment coverage: 809/1,035 original copies

**Agent 27 | 4 November 2026 | Cost-only source audit with exact physical source collector identity.** This supersedes the earlier [754-copy exact-name/set audit](agent27-original-trainer-nohand-payment-extension-20261104.md), and retains the prior [12-group original cost bootstrap](agent27-original-trainer-cost-catalog-reconciliation-20261104.md) as reproducible history.

## Result and source identity

All **29 authenticated original Aichi 60-card inventories** remain unchanged. Ranks 23, 25, 28 have no authenticated complete original list. The source Trainer hand-card-discard-payment classification now covers **60 distinct original name/set/collector printings** and **809/1,035 physical Trainer copies (78.164251%)**. The exact source card's `name, set, printed number` is resolved by a strict bounded bridge to the bundled English card corpus, and then the corresponding **printed cost text for every alternative physical record with the same name in that English set** is checked. No generic name-only fallback is permitted.

| Printed physical owner-hand discard cost class | Copies |
| --- | ---: |
| Mandatory other-card hand discards | 164 |
| Optional premium hand-discard mode | 20 |
| No additional hand-card discard payment when played | **625** |
| Remaining unknown fixed-cardinality payment | **226** |
| **All source original Trainer copies** | **1,035** |

The seven newly reconciled printed-name alias groups add **55** verified copies to the prior 754: `Battle Compressor PHF 92` (33), `Robo Substitute PHF 102` (2), `Target Whistle PHF 106` (2), `Thunder Mountain ♢ LOT 191` (3), `Wondrous Labyrinth ♢ TEU 158` (3), `Karen XYP 177` (8), and `Tropical Beach BWP 50` (4). English corpus requires explicit Team Flare Gear suffix or Prism Star glyph normalization, plus numbered English promo set/collector bridges as appropriate. Full source identity and unmatched Japanese promo families are documented in [1,021/1,035 English archive identity audit](agent27-original-trainer-print-identity-reconciliation-20261104.md). The **14 original Japanese-only Trainer copies absent from the bundled English corpus** remain unresolved here.

## Evidence path

- [Source-numbered cost auditor](../../scripts/agent27-source-trainer-cardtext-cost-audit.cjs) now calls the shared [strict numbered-source printing identity resolver](../../scripts/agent27-original-trainer-print-identity-audit.cjs) for each of the 60 original source cost records. It separately validates the exact source collector and checked English alternate-art card rules. Unknown physical identities remain blocked.
- [Live read-only physical owner-hand payment catalog](../../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs) supports 48 additional original zero-extra-hand-discard groups added in this incarnation, alongside all existing 12 cost families. This map still does **not** execute cards or certify the right to play them.
- [Original physical payment census tests](../../tests/agent27-original-field-trainer-payment-coverage.test.cjs) lock 809/625/226; [printed-source tests](../../tests/agent27-source-trainer-cardtext-cost-audit.test.cjs) lock 60 exact name/set print groups, verify all seven bounded name aliases, and import the independent strict print identity suite. Negative parser tests reject unknown owner-hand discard terms and distinguish recovering `from your discard pile into your hand` from discarding cards **from the hand**.
- [GitHub Actions manual run 41773787778](https://github.com/FlareZ123/experiment-01/actions/runs/41773787778) at commit `2058daab45e5c50ba789c112c23c13c6f2a621d2` passed the **"Verify exact owner-hand Trainer discard contention without native games"** step that includes the new 809-copy tests. The whole card-audit workflow remains red at independent Agent17 original first-turn holdings step. This is a **pure Node source print test**: no native Store, full historical paper print authentication, or gameplay.
- Local independent source-text check against the separately supplied `card-list.zip` verified that the exact seven alias English records, including `bwp-BW28` and `bwp-BW50` variants and `xyp-XY177` alternative art, contain no extra owner-hand discard payment. These are **English catalog assertions**, not Japanese official physical tournament-day identity proof.

## Boundaries and next integration step

This is a **one-dimensional payment feasibility certificate**. It does not make an Item playable under lock or prove an appropriate target, turn-end cost, Stadium replacement, Tool slot, Supporter quota, strategic UDP/DSI payment desirability, prize risk, Energy recipients, card-effect correctness or actual win. `VS Seeker` still needs a real Supporter in discard, `Raihan` needs the previous opponent-turn KO, and a zero-payment `Boost Shake` still ends the whole turn. The independent Agent49 whole-hand reshuffle/bottom/discard observer must remain separate from fixed-cardinality payment. The original source catalog still has **226** unknown copies; do not silently price them as zero.

A future selected symmetric owner-only two-seat policy can use the 809-copy catalog as one feasibility signal, subject to exact paper/legal-Store checks and chosen opposing reply. A legal available candidate action is not itself a priority choice or a verified game winner. **No selected final 60, zero competitively qualified games, no demonstrated 99.5%**.
