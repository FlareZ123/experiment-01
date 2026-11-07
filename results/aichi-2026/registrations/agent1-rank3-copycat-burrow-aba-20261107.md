# Agent 1 preregistration: rank3/rank1 Mimikyu Copycat into Bunnelby Burrow A/B/A

**Registered 2026-11-07T10:35:19.233Z UTC, before implementation and native execution.**

## Question

Can the rank-1 Shadow Rider deck's exact Mimikyu GRI 58 use Copycat to reproduce rank-3 Bunnelby PRC 121's Burrow after the opponent's immediately preceding turn, removing one card from the opponent's deck without Filch's two-card self-draw?

## Card-text and board basis

- The canonical rank-1 deck import in results/aichi-2026/full-decklists.json identifies Mimikyu GRI 58 (sm2-58), Psychic type. Copycat costs Psychic plus Colorless and uses an opponent's non-GX attack from their last turn.
- The canonical rank-3 import identifies Bunnelby PRC 121 (xy5-121). Burrow costs Colorless, is non-GX, and discards the top card of the opponent's deck.
- The conservative-B terminal public board from the exact seed-290134 deal shows Mimikyu Active with five Psychic Energy and Bunnelby Active with one Water Energy. This makes the Copycat cost appear payable; the native engine remains the legality authority.
- Prior Copycat research documents stale last-attack state after an intervening pass. The treatment therefore enables the existing pass-clears-last-attack correction and only selects Copycat when the immediately preceding opponent attack record is Burrow.

## Frozen setup

- Source deck: original Aichi rank 3 Snorlax Stall 60, physical seat 0.
- Candidate deck: original Aichi rank 1 Shadow Rider 60, physical seat 1.
- Seed 290134; Twinleaf gitlink a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Use the existing canonical actor-only/paper-supporter/attach-target wrapper stack and the same 520-action cap for every arm.
- A/B/A: unmodified native control, Copycat-Burrow treatment, unmodified control repeat.

## Treatment definition

Opt-in candidate-seat tactic inserted immediately before AttackTactic. It proposes AttackAction("Copycat") only when:
1. candidate's Active card is Mimikyu GRI;
2. opponent's immediately preceding attack record is Burrow from a non-GX attack;
3. no unresolved prompt is pending;
4. the SimpleTacticsAi's normal legality validation accepts the action.

The tactic does not inspect opponent concealed hand or Prize identities. It does not change the decklist or any other card/action policy. The pass-clears-last-attack correction prevents a stale Burrow record from authorizing Copycat after an intervening opponent pass.

## Measurements

- Exact full/source physical deal fingerprints and A/A-repeat root-ledger equality.
- Copycat declarations and successful AttackAction dispatches.
- For each Copycat, before/after deck counts: expected source deck -1 and candidate deck 0 from the attack itself.
- Burrow, Filch, Copycat and Pass counts; native terminal cause, winner, turns, actions and final deck/Prize counts.
- Turn-start Copycat evidence, including the preceding attack name and candidate Mimikyu energy printings.
- Whether Twinleaf accepts and resolves the attack. An engine rejection or missing opponent-deck decrement is a failed compatibility result, not a competitive result.

## Interpretation limits

This is one frozen native-bot matchup and a policy counterfactual. Even if Copycat resolves and changes the terminal outcome, it does not establish paper-qualified strength, a matchup win rate, or progress toward 99.5% across the 32-deck field. Any engine gap must be reported separately from paper card text.
