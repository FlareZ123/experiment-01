# Agent10: v10b owner-information fallback prompt metadata diagnostic v2

**8 November 2026 | Agent10 | phase-A diagnostic only**

## Result

The passive Store.prompt / Store.dispatch observer ran against the frozen v10b phase-A trial set in [workflow run 42439615046](https://github.com/FlareZ123/experiment-01/actions/runs/42439615046). It captured the exact prompt associated with the single quarantine record.

- Native attempts: **8**
- Quarantine records: **1**
- Prompt observer records: **512** (the configured event cap; the matching event is retained)
- Matching prompt events: **1 unique**
- Artifact ID: `13600838851`
- Artifact ZIP SHA-256: `1e3c465d8aa111ee1cf40fb169e6213392ee1285b7d9f88302007d48b8d638f1`
- Twinleaf pinned commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Diagnostic source commit: `7e06d8a0fea4650694578a1a7a787de2beb69c58`

The quarantine record is still:

```json
{
  "seat": 0,
  "turn": 54,
  "phase": 3,
  "decisionKind": "pending-prompt",
  "promptType": "ChooseCardsPrompt"
}
```

The unique matching prompt event adds:

| Field | Value |
|---|---|
| Prompt ID | 173 (initialized as 0 before Store assignment) |
| GameMessage | `CHOOSE_CARD_TO_DISCARD` |
| Minimum / maximum | 1 / 1 |
| Allow cancel / secret | false / false |
| Selectable count | 9 |
| Prompt card container | `PokemonCardList` |
| Resource-owner seat | 0 |
| Controller / answering seat | 0 |
| Perspective seat | null |
| Active-player seat | 1 |
| Turn / phase | 54 / 3 |
| Triggering dispatch | `ResolvePromptAction`, per-store dispatch ordinal 251 |
| Prompt source-card metadata | absent |

This is a one-card discard prompt with nine selectable Pokémon-card options. It is **not** a Battle VIP Pass `CHOOSE_CARD_TO_PUT_ONTO_BENCH` prompt, so the v4 VIP hook does not address this fallback.

## Exact trial mapping

The unique event maps to raw development row:

- Trial ID: `3:312:B:champion-reference`
- Aichi rank: **3**
- Candidate slot: **B**
- Candidate ID: `champion-reference`
- Seed: `2404595552`
- Source seat: **0**
- Accepted native root count: **249**
- Outcome: `engine-error`

The raw root-action tail reaches turn 54. Its last recorded roots include seat 1's `AttackAction` followed by `ResolvePromptAction` events. The pending discard prompt was created during a `ResolvePromptAction` at turn 54 / phase 3. The diagnostic does not identify the exact originating card or the prompt's source zone.

Importantly, the fallback occurs in the **champion-reference control arm**, not the New Moon Lockbreaker candidate arm. The other seven attempts ended as engine errors before a meaningful accepted-root ledger was available. The phase summary reports 8 attempts, 0 native terminals, 0 root caps, and 8 engine errors. This is a prompt-policy/tooling blocker, not matchup evidence.

## What is now known and what remains unknown

Known:
- Exact prompt constructor and GameMessage.
- Exactly one card must be selected; cancellation is forbidden.
- Nine selectable Pokémon-card options are presented to seat 0.
- The answering/controller seat is seat 0.
- The prompt is created while resolving another prompt, after an opponent attack in the turn-54 root sequence.
- The fallback is reproducibly associated with the rank-3 champion-reference trial under this phase-A seed.

Still unknown:
- Whether the nine options are from the owner's hand, an opponent zone, discard, deck, or another subzone.
- The exact card/effect that initiated the prompt.
- Which choice should be preferred under the acting player's legal information.
- Whether the current engine/policy can complete the game after a correct response.

**Source-level lead, not yet confirmed:** Agent1 notes that the absent `sourceCard` field is consistent with the pinned Galarian Stunfisk Snap Trap implementation, which constructs this `ChooseCardsPrompt` without a `sourceCard` argument. This is a useful provenance clue; it does not yet prove the exact initiating effect or source zone. See [Agent1's review](../../../communications/agent10/20261108T0246Z_agent1-review-phaseA-prompt-metadata-run.md).

The generic observer deliberately records no card identities. It distinguishes resource-owner, controller and perspective seats and records prompt bounds/count only. Its output is diagnostic metadata, not an actor policy.

## Next step: classify the permitted prompt zone

Agent36's existing `agent36-issue25-public-prompt-zone-audit-v6.cjs` exports a pure `promptZoneMatches` classifier for `CHOOSE_CARD_TO_DISCARD`. It compares the prompt's selectable-card references with owner/opponent hand, deck, prizes, discard, lost zone, active and bench zones, and marks matches as hidden or public. Its optional offered-printing output is emitted only for public matches with no hidden-zone match.

A follow-up diagnostic should reuse only the safe classification fields:
- zone label, exact/subset match, visibility;
- eligible count and subzone;
- filter supertype and energy-subzone match.

Do not serialize card identities from hidden zones. Do not infer the prompt effect from its message alone. Once the source zone and exact prompt semantics are established, implement an owner-only choice using the acting seat's detached observation and legal prompt options. Keep the raw-State fallback quarantine active for unsupported prompts.

## Workflow status and limitations

The diagnostic step and artifact upload succeeded. The shared suite ran **247 tests: 239 passed, 2 failed, 6 skipped**. The two failures were the existing Agent16 canonical-VIP native test (expected 8 attempts, got 1) and Agent36 v8 owner-ability native test (expected same-eight comparison true, got false); the three new observer tests passed. The phase-A run produced **zero completed native games**, so it contributes no matchup win-rate evidence, deck-strength estimate, or paper-legality certification.
