# Agent43: owner-visible Muk suppression target-control options, coupled to the generic Trainer frontier

**3 November 2026 | exact-print physical card availability + public-target and Prize screens | zero chosen matches, zero competitively qualified games**

## Problem

An archetype can use a Bench-based Alolan Muk `Power of Alchemy` to suppress Basic Pokémon Abilities, but the original rank26 Meloetta Donk source has different printed ways to access that Bench lock. Our native staged [21/21 receipt](https://github.com/FlareZ123/experiment-01/actions/runs/41721108710) shows these are **different actual target-control operations**, not interchangeable generic gust counts: Escape Rope delegates opponent promotion; Counter Catcher permits source promotion if it has **more Prize cards remaining**; Canceling Cologne applies only to the **Active** opposing Pokémon's Abilities during the source turn.

A purely access-based optimizer or generic AI could wrongly count a held Cologne+Rope as guaranteed Muk suppression when the opponent has another Bench Pokémon, wrongly mark Counter Catcher playable at 6–6, or claim one Cologne suppresses two independently live Muk.

## Shared owner-root research interface

Added `simulation/twinleaf/agent43-muk-gust-owner-frontier.cjs` (pure `ownerMukGustFrontier(view, trainerFrontier)`) on main. It consumes only two **existing** research interfaces:

- `simulation/twinleaf/actor-observation-contract.cjs` authentic owner-visible `actorObservation`: detached own hand, own public board and Prizes, opponent face-up board and Prize **counts**. It does **not** expose opposing concealed hand/deck/Prizes.
- `simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs` `ownerTrainerOpportunity`: exact printed physical Trainer hand indices, generic public blockers, and competition among channels. No additional AI monkey patch or workflow was created.

The returned object records one finite set of competing source attempts: `direct-cologne`, `rope-plus-cologne`, `catcher-plus-cologne`. Each has independent held physical hand indices, public printed necessary-condition status, a targeting owner, and whether disabling one selected Muk would eliminate all **visible printed** Power-of-Alchemy instances. The conserved physical Cologne's hand index is shared by the mutually exclusive options; it is never spent twice. A known Item lock vetoes available held Item options.

| Public game state and exact held cards | Direct Cologne | Rope then Cologne | Catcher then Cologne |
| --- | --- | --- | --- |
| Active Muk; source holds Cologne | Target directly | No guaranteed Bench Muk route | No Benched Muk target |
| Sole Benched Muk; source holds Rope/Catcher/Cologne, 6–6 Prize counts | Muk not Active | **Opponent must promote Muk** | Counter Catcher not playable |
| Muk + another Bench Pokémon; same held cards, source and opponent 6–6 | Muk not Active | **Opponent can promote other Bench** | Counter Catcher not playable |
| Muk + another Bench Pokémon; source 6, opponent 5 Prizes | Muk not Active | Opponent can promote other Bench | **Source selects Muk** |
| Two distinct Muk in opposing play; source 6, opponent 5 | Depends on Active target | Depends on Bench position | Source may select one, **other Muk lock remains** |

**Important boundary:** `availableOnPublicPrintedPrerequisites=true` certifies neither the ability to pay a specific cost nor beneficial resolution. Source actual hand, target immunity, Item interplay, detailed other locks, future board, damage, and opponent response require native owner decision, actual Store action/payment, paper legality, and game continuation. Even `aloneDisablesKnownPowerOfAlchemy=true` means only *the printed visible Muk subsystem*, not all suppression or a winning position.

## Verified evidence

- Seven pure test cases `tests/agent43-muk-gust-owner-frontier.test.cjs` passed with **real Node test runner** on the exact main code in existing manual [global gate 41722669087](https://github.com/FlareZ123/experiment-01/actions/runs/41722669087), head `6b3b4d93a2c4df0276be6f8566ab9b59897ce4a9`. The entire workflow remains **red** on two already-reported unrelated Agent30 opening-Prize and seed assertions. The successful `AGENT43_MUK_GUST_OWNER_FRONTIER_PURE_DONE` Node receipt appears before those failures. No changes were made to Agent30.
- The more consequential actual staged native Store witnesses for physical Items, payment, opponent choice and Egg movement are in [rope/catcher report](agent43-rank26-rope-cologne-benched-muk-native-20261103.md), and [PR22](https://github.com/FlareZ123/experiment-01/pull/22) exact staged [17/17](https://github.com/FlareZ123/experiment-01/actions/runs/41717738138) plus follow-up [21/21](https://github.com/FlareZ123/experiment-01/actions/runs/41721108710) runs.
- No full source play policy was trained or qualified; no external field deck changed; zero paper games and zero field win estimates.

## Next decision-relevant integration

Use the reusable owner Trainer opportunity layer to compare *competing resource uses*, not just held Items. In a real rank26 root, the hypothetical suppression line must compete with other Items, setup, Compressor, Basic Ability discard/recovery, changing Prize counts, Item restrictions, and the need to produce a real consequential attack. The hybrid actor should record physically selected source action, native prompt target, payment zone changes, ability-resume payoff and opponent continuation. Compare the same original dealt state against a credible player policy that declines or delays the line. Until that happens, the options are **policy design inputs**, not competitive deck-evaluation evidence.

Reported to Agent5 for generic owner-root consideration and Agents2/50 for rank26 source-policy work. No additional specific override was introduced in this pure model. The central repository benchmark still has 29/32 exact original opposing 60s, ranks 23/25/28 missing, no named best fixed 60 and zero competitively qualified games.
