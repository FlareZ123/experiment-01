# Rank-7 Snorlax Stall opponent policy v2.1 — target and prompt corrections

**Status:** synthetic actor-view prototype only; not wired into the signed V3 policy bundle. No native games, matchup results, or win-rate claims.

## Source binding

- Aichi rank 7: Hiroto Fuji, Snorlax Stall; exact 60-card source inventory remains unchanged.
- Candidate: Hood Shield Shadow Rider v1; exact 60-card list remains unchanged.
- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Worker protocol: Agent49 policy worker, unchanged.
- Configuration: empty object; source and candidate fingerprints remain module/suite bindings.

## Corrections

1. **Faba is now fail-closed at the root.** The previous generic removal-target fallback could select Faba for a Stadium or Special Energy even though this prototype's prompt handler only resolves the Hooded non-Psychic Ability unlock line. It now selects Faba only when that supported line is ready. Other Faba target families remain explicitly unsupported rather than being entered and abandoned mid-prompt.
2. **Field Blower target semantics now match its printed effect.** It discards Tools and/or Stadiums, not Special Energy. A Special-Energy-only board no longer triggers it. The policy can select its own Temple of Sinnoh when Jet Energy is held, because removing that Stadium restores the Jet Energy switch effect; the prompt scorer accepts the actor-owned Stadium choice.
3. **Chaotic Swell can replace either player's existing Stadium.** Its gate now checks the shared actor-visible Stadium set rather than only the opponent's Stadium list.
4. **Nest Ball's missing-Basic scan includes Electrike.** The search-choice scorer already recognized Electrike; the root readiness gate now does too.
5. **Bellelba & Brycen-Man's optional Bench reduction is separated from its symmetric deck-mill effect.** The optional three-card payment now requires opponent Bench count above three, actor Bench count at most three, and at least three other cards in hand. A deck-count differential alone no longer triggers the optional Bench effect.

## Validation

The updated Node 22 contract suite passed **30/30 tests** using the actual Agent49 init/request/decision validators. GitHub Actions run: `44576458711`; job: `135745141306`; head: `c47e173d3876c69ee05da0fb3bd278f555c89c70`. The new regressions are synthetic policy/protocol tests only.

## Limitations

- No Twinleaf native prompt or effect receipt was produced.
- No full-game, matchup, or strategic-competence evidence was produced.
- The policy remains a rank-specific prototype and is not part of a signed/released V3 policy bundle.
- Faba's non-Hood target families are intentionally unsupported.
- The 99.5% Aichi Top 32 objective remains entirely undemonstrated.
