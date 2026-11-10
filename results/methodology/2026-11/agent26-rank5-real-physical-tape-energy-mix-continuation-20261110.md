# Original Aichi rank 5: four physical native games and a copied Energy Mix blocker

**Agent26, 10 November 2026.** This is an original-source native development result, not a qualified paper tournament comparison.

## Completed execution

The four **previously preregistered** source/contender physical openings in
`results/aichi-2026/registrations/2026-11/agent36-fresh-rank5-physical-payment-intake-v1-20261109.json`
finally ran after repairing the actual 350-root configuration failure in
`simulation/evaluation/agent36-fresh-rank5-native-paper-packet.cjs`.
The new runner now passes `allowExtendedRegisteredNativeRootCap:true` through
to the native panel, with a regression that rejects silent option loss.

- Native GitHub Actions run: [42735807971](https://github.com/FlareZ123/experiment-01/actions/runs/42735807971) (**success**)
- Raw 12,182,490-byte JSON custody artifact: [13726673723](https://github.com/FlareZ123/experiment-01/actions/runs/42735807971/artifacts/13726673723)
- Artifact ZIP SHA256: `2d5bc03d68ae4c19b55fc68d6d5c7903d5bf52e77f55a54debcc038325a844fb`
- Original archive JSON SHA256: `e7e28e87041c21059573db1a71f127af0a84715ef61988b30547fffba3fb8a36`
- Pinned and observed engine revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Original source rank 5: Mew/Genesect original published sixty. Fixed contender: New Moon Lockbreaker v1.
- **4/4** native games have exact accepted native-Store ledger joins and clean 120-card original physical-ID custody.
  Total **776** actual accepted Store root actions.
- **3/4** native terminal games. Among them **one New Moon native winner and two original-source native winners**. The fourth is a genuine bot-decoder abort, not a loss.
- **Zero** paper-rule, official-clock or independent competitive-game admissions.

| Trial | Contender physical seat | Exact native Store roots | Native disposition | Source/contender status |
| --- | --- | ---: | --- | --- |
| `5:5000:A` | 0 | 165 | Terminal, winner seat 0, final prizes [0,5] | Contender native win |
| `5:5001:B` | 1 | 137 | Aborted owner prompt, no native winner | Unresolved |
| `5:5002:A` | 0 | 231 | Terminal, winner seat 1, final prizes [4,0] | Original-source native win |
| `5:5003:B` | 1 | 243 | Terminal, winner seat 0, final prizes [0,6] | Original-source native win |

## Specific mechanical blocker uncovered

In the aborted **original-source physical seat 0** game `5:5001:B`,
on **global turn 31**, the owner attached Double Colorless Energy (accepted
root 134), announced Mew VMAX's **Cross Fusion Strike** (135), and selected
a Benched **Mew V FST's Energy Mix** (136). The engine then raised a
bot-decoder failure at the native `AttachEnergyPrompt` before root 137 could
be chosen. The prompt had `min:0, max:1`, a 28-card owner deck source menu
and `blockedTo` targets for the three non-Fusion Strike Bench locations.
The live owner physically held **two Double Colorless Energy SUM cards in
their own deck**, with an eligible Benched Mew V. The full before/after
120-card custody was clean, and no submitted bad root action was recorded.

This is an **AI missing decision**, not a paper-rule impossibility or
evidence that the original rank-5 source cannot play. Candidate game-win
counts that include the aborted game as a loss are invalid.

## Concrete owner-only repair

Added `simulation/twinleaf/2026-11/agent26-mew-energy-mix-owner-prompt.cjs`
with default-opt-in execution only in a separate retrospective runner. It
recognizes the real accepted `ChooseAttackPrompt -> Energy Mix` source
after Mew VMAX, chooses one exact physical Energy from the **acting
owner's deck search**, respects the native blocked destination list,
tests the live prompt validator and delegates all other prompts unchanged.
It prefers a Benched Mew V without Energy, while retaining the native
Store as the final arbiter. It never reads the opposing hand, deck or Prizes.

The separate
`simulation/evaluation/2026-11/agent26-rank5-energy-mix-native-continuation.cjs`
replays the **identical four initial physical deals**, requiring exact
full-deal hashes against this successful baseline. This is a
**post-observed retrospective mechanical repair** and cannot produce new
prospective win-rate evidence. The manual workflow
`.github/workflows/agent26-rank5-energy-mix-native.yml` runs both-seat
contracts and the actual pinned native 60-card games.

The producer also now saves all captured original physical Store receipts
on any runner-level exception. Failed game attempts must remain counted
and inspectable. A new pure regression demonstrates preservation after a
synthetic native abort.

**Research priority:** complete the blocked original-source response and
then review the actual next owner decision. Regardless of that continuation,
competitive admission still requires independently verified original
Japanese prints, rules, full owner payments/targets/alternatives, opposing
counterplay, official event-clock outcomes and reviewer approvals. No
99.5% or 32-opponent result follows from these four games.

## Resolved native continuation, 10 November 2026

The subsequent **post-observed** mechanical replay now succeeds:
[run 42738222660](https://github.com/FlareZ123/experiment-01/actions/runs/42738222660),
[full native JSON artifact 13728545381](https://github.com/FlareZ123/experiment-01/actions/runs/42738222660/artifacts/13728545381).
The archived 13,846,705-byte JSON hashes to
`74c22221ad83b8b46c34996ffcc2f242457bf51621b161a4ebd6572f88d184cc`;
the uploaded ZIP SHA256 is
`85aebd87c3c4ff71daf89593cfcd07a8f7c6d9bc074c40e03f1eef036bea4ff2`.

The exact **four original 60-card physical deals** match all four previously
recorded full-deal fingerprints. All **856** native Store actions have exact
receipt joins, **4/4** games have clean 120-card original physical custody,
and **4/4** reach genuine native terminal winners with no engine abort.
The two-seat owner decoder recognizes four actual `Energy Mix` searches and
accepts four exact owner prompts:

1. Global turn 31, original-source seat 0: move physical Double Colorless Energy
   from the owner's deck to the owner's Benched Mew V FST.
2. Global turn 33: move the second physical Double Colorless Energy to the same
   Benched Mew V, with native validation and actual zone movement.
3. Global turn 35: deck contains no Energy; complete the native min-zero search
   with an accepted empty selection and no physical Energy fabricated.
4. Global turn 37: repeat accepted empty selection with the deck still out of
   Energy.

The formerly aborted original-source game `5:5001:B` continues from native
root 137 through **217** accepted actions and ends with **original-source
seat 0 winning**, final Prizes `[3,0]`, rather than being marked as an
engine failure or candidate loss. The other three terminal winners are
unchanged. The final **post-observed four-game native result** is **one
contender native win and three original-source native wins**. This is a
mechanics-regression result, **not an unbiased candidate win-rate estimate**.

The live regression demonstrates correct owner search custody, legal
`blockedTo` handling, exact physical double-colorless attachment, and
empty-deck Energy search settlement. The source attack line and native
outcome are inspectable. Independent paper-clock judgments and qualified
full-field competitive outcomes remain entirely unavailable.
