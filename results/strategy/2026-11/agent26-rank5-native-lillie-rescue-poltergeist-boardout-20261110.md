# Original Aichi rank5: five native Lillie rescues, one physical board-out reversal

**Agent26, 10 November 2026. Status: postobserved original-source native policy test, zero qualified paper games.**

## Decision problem and exact fixed decks

The fully settled original-source physical packet from
[run 42738222660](https://github.com/FlareZ123/experiment-01/actions/runs/42738222660)
contained one New Moon Lockbreaker native failure that was dominated by its
owner-policy pass: trial `5:5003:B`, candidate physical seat 1, spent
global turns 21 through 51 passing every turn despite holding two physical
`Lillie's Determination M1L` on turn 21. The Active
`Mewtwo & Mew-GX UNM` had exactly one Basic Psychic Energy, while
the owner deck contained Telepathic Psychic Energy. The candidate had already
executed `Horror House-GX` on global turn 19, temporarily preventing the
source from playing cards from hand. The source took all six Prizes
on the original native continuation.

The candidate printed sixty and original rank5 Mew/Genesect source sixty
were **not edited**. Each of the four registered initial physical shuffle,
setup, six-Prize configurations and owners was held exactly fixed. To solve
the actual missing owner decision, the runner enabled the repository's
already-tested `actorBilateralLillieAfterPass` root option for **both
physical players**. That option replaces an actual proposed owner
`PassTurnAction` with an otherwise playable hand-held
`Lillie's Determination`, subject to the already implemented one-Supporter,
first-player-turn, item/prompt, and lock checks. Store still pays the real
Supporter and shuffles/draws the physical owner's actual cards. The
source's copied `Energy Mix` native owner prompt repair remains enabled
for both seats, as in the fixed baseline.

This follows the observed source and pass sequence. All observations and
outcomes here are **retrospective, developmental and non-independent**,
not paper-tournament or matchup-win-rate observations.

## Real native execution

- [GitHub Actions run 42739588697](https://github.com/FlareZ123/experiment-01/actions/runs/42739588697) **succeeded**.
- [Complete Store/physical-root artifact 13729185299](https://github.com/FlareZ123/experiment-01/actions/runs/42739588697/artifacts/13729185299).
- ZIP SHA256 `4dbba1024a4fa5f4fcc37d5604b3b3ee58e9683cafe0857b8cbff317f37840e0`.
- JSON 13,743,490 bytes SHA256 `98303033a059e96690964b59e78cb44d4ef6598baf3910fd3d7597c237e54a8a`.
- Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **4/4** exact original initial full physical-deal SHA256 hashes retained.
- **4/4** clean original 120-card physical custody, exact Store ledger
  joins, and native terminal results, **849** accepted native roots.
- **5/5** proposed candidate Lillie roots were genuinely accepted by Store,
  with **zero** Store rejections, across the four trials. Two physical seats
  exercised the same owner-visible option.
- **Zero** games received independent official-clock, Japanese paper-rule,
  full playing-policy, or competitive-game qualification.

| Original registered trial | Candidate Lillie turns in treatment | Control winner / roots | Treatment winner / roots |
| --- | --- | --- | --- |
| `5:5000:A` | 4 | Candidate / 165 | Candidate / 200 |
| `5:5001:B` | 2 | Source / 217 | Source / 248 |
| `5:5002:A` | 39, 41 | Source / 231 | Source / 261 |
| `5:5003:B` | **21** | **Source / 243** | **Candidate / 140** |

The registered original four games therefore changed from **one candidate
native terminal** to **two candidate native terminals** under this one
owner-policy option, with the **same three other winner identities except
the trial 5003 reversal**. This cannot be extrapolated to a competitive
win rate: the intervention was chosen after seeing an obvious loss and
the policy did not produce wins in the other two source-win cases.

## Native action mechanism for trial 5003: direct board elimination

The first different real owner root is ordinal **119**, global turn **21**,
where the baseline elected `PassTurnAction` but treatment paid and
accepted `PlayCardAction Lillie's Determination`. Original hand contained
**two** physical Lillie cards (IDs `1:42`, `1:43`) and no immediately
held Energy. On the treatment's subsequent native shuffle/draw prompts,
an exact physical `Telepath [P] Energy M3` reached the owner's hand.
The following transitions are observed in native receipts:

1. Root **123**, turn **21**: the candidate manually attached that
   Telepathic Psychic Energy to its Active Mewtwo & Mew-GX,
   which already had one Basic Psychic Energy.
2. Roots **124–127**, turn **21**: the owner invoked `Perfection`,
   selected `Poltergeist` from Gengar & Mimikyu-GX's attacks,
   and the resulting native attack effect **Knocked Out the source's
   Active Mew V FST** (and its attached Double Colorless Energy).
   Physical receipt root 128 moved **two** candidate Prize cards to hand.
3. The source was forced to promote its only remaining Pokémon,
   **Genesect V FST**. It attached Double Colorless Energy on its own
   next turn and passed, with no attacking native response.
4. Roots **136–139**, global turn **23**: the same funded Mewtwo & Mew-GX
   invoked Perfection and chose `Poltergeist` again; this **Knocked Out
   Genesect V**. Two additional original candidate Prizes moved to hand.
   The owner-position ledger shows that the source then had **zero**
   Active or Benched Pokémon left. This satisfied the actual engine
   no-Pokémon win condition despite the candidate having **two Prize
   cards remaining** (final Prizes `[6,2]`, candidate seat1 winner).

All attack-copy roots are `UseAbilityAction` and `ResolvePromptAction`
in the adapter's printed Perfection representation. They are recorded
as actual native settled attacks by the independent public settlement
observer in `rawNative.candidateAttackSettlement`; counting only
`AttackAction` would miss this pair of copied Poltergeist attacks.

The source's original completed game chose four Cross Fusion Strike
attacks on global turns 40, 44, 48, and 52. In the treatment it
completed **zero** native declared attacks before the two-Poltergeist
board elimination. Its original board initially consisted of Mew V
and Genesect V at the intervention point.

## How to apply this evidence

The useful decision policy is straightforward: when an actual owner
would pass holding a currently legal draw Supporter, consider that
Supporter **before ending the turn**. In this specific game it opened
the missing Energy channel and converted a board into two immediate
two-Prize KOs on sequential turns. The action should remain
contingent on exact hand resources, available deck draw, printed
Supporter rules, locks, tactical opponent board, and attack-funding
constraints. It should not be generalized into unconditional Lillie
priority.

The original-source native rank5 result proves a concrete causal
*within-deal* policy difference, not a credible paper-competitive
performance estimate. This repair is default-off outside the manual
experiment. The fixed sixty is still unqualified against the full
Top 32, and the exact printed sixties for ranks 23/25/28 remain missing.

**Reproduction:**
`simulation/evaluation/2026-11/agent26-rank5-lillie-pass-rescue-native.cjs`
via manual
`.github/workflows/agent26-rank5-energy-mix-native.yml` with
`run_native=true, run_lillie_pass=true`.
