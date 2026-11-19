# Rank-7 Snorlax Stall opponent policy v2.3 — source-bound recovery and target corrections

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

The updated Node 22 contract suite passed **44/44 tests** using the actual Agent49 init/request/decision validators. GitHub Actions run: [44605512482](https://github.com/FlareZ123/experiment-01/actions/runs/44605512482); job: `135848014196`; exact head: `08b66b89bf4f9ff21b4e8b88bf2d9f7f59eb93c0`. The new regressions are synthetic policy/protocol tests only.

## Limitations

- No Twinleaf native prompt or effect receipt was produced.
- No full-game, matchup, or strategic-competence evidence was produced.
- The policy remains a rank-specific prototype and is not part of a signed/released V3 policy bundle.
- Faba's non-Hood target families are intentionally unsupported.
- The 99.5% Aichi Top 32 objective remains entirely undemonstrated.


6. **Lusamine now requires two supported recovery targets before play.** The prompt scorer recognizes the rank-7 list's supported Supporters and Stadiums, including Pokémon Ranger, Lillie's Determination, Teammates, Bellelba & Brycen-Man and Team Rocket's Handiwork; unsupported Gladion remains excluded because its Prize-choice handler abstains.
7. **Target Whistle is now candidate-bound.** It checks free capacity on the opponent's Bench, not the actor's, and only treats the fixed candidate's exact Basic Pokémon printings as valid targets. A VMAX in the discard pile is not a Basic target.
8. **Get Lost recognizes the candidate's recovery cards.** Night Stretcher ASC 196 and Acerola BUS 112 are now prioritized as live recovery targets rather than ordinary discard cards.
9. **Radiant Eternatus printing identity is corrected.** The fixed candidate uses Radiant Eternatus CRZ 105, not SIT 105; the policy, fixtures and suite now bind the actual printing.

## Additional strategic limitation

The Agent49 worker's current public event receipt records known Ability use for the actor's own Pokémon, not the opponent's. The policy therefore cannot tell whether an opponent Radiant Eternatus has already used its one-shot Climactic Gate. The Faba → Jet Energy → Wobbuffet line remains a heuristic when that target is already in play; it is not an established live threat or a native-validated tactic.
