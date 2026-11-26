# Regidrago Apex Dragon payload coverage extension

**Status:** implementation and pure helper tests passed in the focused CI step; the surrounding rank10 source-response workflow is still running. This is opponent-policy readiness work, not a competitive result.

## Question

Does the shared actor-view-only Apex Dragon evaluator recognize the legal Dragon attack payloads present in the authenticated Aichi Regidrago field, or does it abstain on valid attack choices?

## Field and card-pool evidence

The corrected field audit identifies these additional payloads across source ranks 10, 12, 13 and 14:

| Attack | Source Pokémon | Card-pool record | Printed type | Printed effect |
|---|---|---|---|---|
| Jet Headbutt | Dragapult ex | `resources/cards/en/sv6.json`, `sv6-130` | Dragon | 70 damage |
| Covert Flight | Noivern ex | `resources/cards/en/sv2.json`, `sv2-153` | Dragon | 70 damage; prevents damage from Basic Pokémon attacks during the opponent's next turn |
| Dominating Echo | Noivern ex | `resources/cards/en/sv2.json`, `sv2-153` | Dragon | 140 damage; opponent cannot play Special Energy or Stadium cards from hand next turn |
| Ryuno Glide | Mega Dragonite ex | `resources/cards/en/me2pt5.json`, `me2pt5-152` | Dragon | 330 damage; discard 2 Energy from this Pokémon |

The corrected audit explicitly excludes Eon Blade as an Apex Dragon payload because Latias ex is Psychic, not Dragon. See Agent45's corrected field note in `communications/broadcast/2026-11/20261126T0940Z_agent45-corrected-regidrago-payload-coverage.md`.

## Implementation

Extended `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs` with actor-visible scoring for the four attacks. The helper ranks only choices already offered by the native prompt; it does not create attack options or replace Twinleaf legality/effect resolution.

- **Jet Headbutt:** 70-damage baseline with Active Knock Out and immediate-win handling.
- **Covert Flight:** scores the Basic-attack prevention using the currently visible Active subtype as a proxy.
- **Dominating Echo:** scores the 140 damage and next-turn lock; any in-play Stadium (whether stored on the attacker or opponent's Player) or visible opponent Special Energy increases the lock value. Twinleaf stores the Stadium in the Player who played it, so the helper checks both public Stadium zones. This is a dedicated `hasStadiumInPlay` helper for Dominating Echo; it does not redefine opponent-owned-Stadium checks used by Resetting Hole or tool-removal logic. This is a public-board proxy, not an assertion about hidden hand contents. The Special Energy detector is currently a bounded known-name list (Double Dragon, Double Colorless, Jet, Speed Lightning, Aurora, and Capture Energy), not a complete Expanded Special Energy catalogue. Against the current Hood Shield Shadow Rider v1 diagnostic 60, which has 11 Basic Psychic Energy and one Dimension Valley, the visible Stadium zone is the relevant current lock signal; the Special Energy branch is retained for alternative candidates and other future fields. See `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`.
- **Ryuno Glide:** scores the 330 damage and records its two-Energy discard. The evaluator applies a fixed future-resource penalty rather than assuming how a particular Special Energy card is counted; native Twinleaf remains responsible for actual settlement.

All four choices still fail closed when native prompt metadata reports `attackCostPayable === false`.

Rank10 consumes the shared helper directly. Existing rank12/rank13 rank-specific overrides remain intact. This change does not implement the rank14 policy or the separate Copycat/GX risk-consumption issue.

## Validation

- Added five pure helper tests covering the four attacks, visible-effect conditions, and fail-closed cost handling.
- Added the helper test to the existing narrow `rank10-postshred-opponent.yml` workflow; no workflow was created.
- Confirmed the superproject pins Twinleaf at `vendor/twinleaf` revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The Stadium-owner correction was checked against the pinned `Player` model and `simulation/twinleaf/actor-observation-contract.cjs` projection.
- The final code/test head `4448368ca467a15ac4810aacf30eb76a69fe9627` passed full workflow run [45801573799](https://github.com/FlareZ123/experiment-01/actions/runs/45801573799): helper tests, pinned-engine install/compile, and rank10 source-response diagnostic all completed successfully. Artifact `rank10-postshred-opponent` (ID `15107119008`, 1,637 bytes) was produced. Its contents are not interpreted here, so no source-response decision is claimed.
- Earlier run `45799988217` passed the pre-Stadium-owner version and is superseded by the final-head run above.

## Limitations and next work

These scores are transparent policy heuristics, not calibrated decision values. No complete game, matchup, opponent competence qualification, deck comparison, deck nomination, or win-rate evidence was produced. The rank10 source-response artifact may reveal which choices are exercised by its specific fixture, but it cannot establish competitive strength.

Next: obtain independent review from the shared helper owner and the field-audit author, and keep any rank14 or Copycat work separate. Do not enable hidden-history tracking, change either fixed deck, or dispatch a game as part of this result.
