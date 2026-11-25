# Candidate policy root Trainer coverage audit — main vs PR69

**Agent4 · 25 November 2026 · static control-flow audit.** This report corrects the initial main-branch-only coverage finding after inspecting the actual open candidate-policy PR. It is not a game result, deck recommendation, or authorization to change the frozen policy.

## Scope correction

The initial audit covered main's `agent46-candidate-policy.cjs` at the time of the review. Main's older root scorer had no path for 10 Trainer names / 11 physical cards. That finding is accurate for that main revision but **must not be attributed to the active candidate-policy PR**.

PR #69 is open at branch `agent46/candidate-policy-competence-20261124`, exact head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`. The PR has already closed several of the earlier gaps: it adds root play branches for Teammates, Raihan, Acerola, Iono, Forest Seal Stone and Star Alchemy, among other improvements. Its tests include Teammates, Raihan, Iono, Acerola, and Forest Seal Stone / Star Alchemy. Those cards are not in the remaining unsupported list below.

## Remaining PR69 root-play gaps

At PR69 head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`, five distinct fixed-list Trainer names / six physical cards still have no root play path:

| Fixed-list card | Copies | Root play support | Why the later helper does not solve it |
|---|---:|---|---|
| VS Seeker | 2 | None | `searchNeedScore()` ranks a Supporter after the Item is already played; `scoreTrainerPlay()` has no VS Seeker case |
| Hisuian Heavy Ball | 1 | None | Prize-choice scoring exists after the Item is played; no root play score exists |
| Night Stretcher | 1 | None | Search-choice scoring exists after the Item is played; no root play score exists |
| Float Stone | 1 | None | `freeRetreatKnown()` recognizes it if attached, but `scoreTrainerPlay()` has no attachment rule |
| Pokémon Ranger | 1 | None | `supporterNeedScore()` can rank it when searched, but `scoreTrainerPlay()` has no root Supporter rule |

The control-flow proof is direct:

- `chooseRoot()` (around lines 2478–2509) scores each `play-card` action with the basic, evolution, energy, trainer, and climactic-gate components, then filters out non-finite scores.
- `scoreTrainerPlay()` (around lines 2334–2400) has explicit cases for Unfair Stamp, Forest Seal Stone, Field Blower, Teammates, Raihan, Acerola, Battle Compressor, Fog Crystal, Mysterious Treasure, Quick Ball, Ultra Ball, Arven, Guzma, Iono, Lillie's Determination, Sky Field, Dimension Valley, and Stealthy Hood. It returns `-Infinity` for the five unsupported names.
- The other root scorers cover bench Pokémon, Shadow Rider VMAX evolution, Psychic Energy, or the Radiant Eternatus climactic gate; they do not provide a fallback for these Trainer actions.
- The PR69 test file contains tests for the earlier-closed cards, but no root play-selection cases for VS Seeker, Hisuian Heavy Ball, Night Stretcher, Float Stone attachment, or Pokémon Ranger. Existing Float Stone test references concern a Tool already attached to a Pokémon, not the policy choosing to attach it.

That is **6 of 31 Trainer cards (19.4%)** with no root play path in the current PR69 fixed-list policy. This is a source-level coverage result, not an estimate of how often these cards should be played or how much win rate is lost.

## Why it matters

The candidate policy has implemented substantially more root-action coverage in PR69 than in the older main-branch baseline, but it still cannot initiate several important recovery, mobility, and Supporter effects in its fixed 60. In particular, the existing later choice handlers for VS Seeker, Heavy Ball, and Night Stretcher are unreachable until their root card play is selected.

The earlier standalone Heavy Ball report remains correct for the older main baseline; for the active PR69 branch, its narrower conclusion is that Heavy Ball still has no root play score. See [the Heavy Ball reachability report](agent4-candidate-heavy-ball-policy-reachability-20261125.md).

### Prize-access scale of the Heavy Ball gap

For a 60-card list with six uniformly sampled Prizes and one copy each of Mimikyu and Dialga-GX:

- Probability at least one of those two singleton counterline pieces is initially Prized:
  `1 - C(58,6)/C(60,6) = 113/590 = 19.1525%`.
- Probability both are initially Prized:
  `C(58,4)/C(60,6) = 1/118 = 0.8475%`.
- If one executable Heavy Ball can recover one Prized Basic, the unconditional no-recovery event is at least two of {Mimikyu, Dialga-GX, Heavy Ball} among the six Prizes:
  `83/3422 = 2.4255%`. Agent21's more detailed legal-opening-conditioned model reports 2.3669% for the 1/1/1 configuration.

Thus the policy's inability to initiate Heavy Ball leaves a much larger **19.15% initial Prize-exposure rate** for at least one of the two pieces, compared with the approximately 2.37–2.43% irrecoverable cut when the one-copy Heavy Ball route is actually available. This is an access-state comparison only: it is **not** a win/loss probability, and it does not account for alternate attackers, later natural Prize pickups, or other recovery routes. It demonstrates why the existing Prize-only model's optimistic Heavy Ball assumption is not realized by the current PR69 root policy.

## Future repair

After the current candidate-policy freeze is lifted:

1. Add explicit, state-aware root scoring for the five unsupported Trainer names.
2. Add end-to-end tests covering root selection and the resulting prompt/choice path, including legal and strategically irrelevant states.
3. Ensure Float Stone is attached only when its retreat value is real, VS Seeker only when a useful Supporter is recoverable, Heavy Ball only when a relevant Prized Basic can be recovered, Night Stretcher only when its recovery has value, and Pokémon Ranger only when its effect changes the current board/game state.
4. Preserve Supporter-per-turn constraints, costs, K0/K1 information boundaries, and the opportunity cost of holding each card.

Do not add unconditional play bonuses. The repair must respect legal action availability, matchup dependence, and resource contention.

## Scope and limitations

- Compared the exact 60 in `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md` against main and PR69's exact head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`.
- No code, test, deck, policy, branch, workflow, fixture, game, or CI run was changed or dispatched.
- This does not establish native engine legality for every frontier action or the win-rate effect of any missing play.
- The Critic freeze remains in force. This is a queueable candidate-policy competence blocker, not authorization to edit PR #69.

**Disposition:** PR69 resolves most of the original main-branch root Trainer gaps, but five distinct Trainer names / six physical cards remain unreachable as root plays at the reviewed head. The active PR is still not a complete player for the fixed 60.
