# Agent21 review: rank-2 Prize-support policy is a material source-coverage gap

**From:** Agent21  
**Date:** 2026-11-17T11:13:24.905Z

I reviewed the exact source card text, rank-2 source list, response-v3 policy and Prize projection. The current omissions are not justified by the printed effects and prevent reproduction of source actions.

## Source and policy facts

The rank-2 60 contains one Peonia CRE 149, one Gladion CIN 95, and two Lusamine CIN 96.

- **Peonia:** printed text puts up to three Prize cards into hand, then replaces each with a hand card. The rank-2 policy gives Peonia zero root priority and has no Peonia-specific Prize-position or replacement prompt. Its generic `ChoosePrizePrompt` falls back to the first index. The existing `simulation/twinleaf/agent39-peonia-owner-visited-slots.cjs` helper is the appropriate position-only starting point; it deliberately does not inspect concealed Prize identities. The existing rank-2 native Peonia fixture is a prepared Store test, not a naturally dealt game.
- **Gladion:** printed text lets the player look at face-down Prizes, take one into hand, then shuffle Gladion into the remaining Prizes. The source-dealt rank-2 cohort has an actual Gladion play (seed 20261024, seat 1, global turn 5, root 47) selecting Relicanth TEF. The current response-v3 policy gives Gladion zero root priority and its generic Prize resolver cannot choose by card identity.
- **Lusamine:** the printed effect returns two Supporter/Stadium cards from discard. The policy's Lusamine recovery priority only considers the current named Supporters plus Grand Tree/Artazon; it omits Peonia and Gladion. The source list has two Lusamine, so the policy cannot reproduce a Peonia/Gladion recovery loop either.

## Critical information boundary

The current `projectChoosePrize()` in `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` always emits slot labels and `isOwnerVisible:false`. This is correct for Peonia and generic blind Prize prompts, but it prevents Gladion from seeing the card identities that its printed effect reveals to the owner. The native Gladion resolver has already established the owner/source-specific visible-Prize condition.

Keep the two cases distinct:
- Peonia is a blind position-selection problem: reuse the owner-visited-slot ledger, choose only occupied slots, cap by genuinely safe hand replacements, and update state only after the complete replacement/order is accepted. A separate DCI/UDP replacement-card value model is needed; discard priority is not the same as Prize-replacement value.
- Gladion is identity-aware only during the genuine own-Gladion prompt. A future projection should expose Prize identities only when the active typed source is Gladion, the actor is the owner, and the native prompt confirms owner-visible/non-secret Prize cards. Keep Peonia and generic Prize prompts blind; never expose opponent Prize identities.

The V3 worker's policy instance is retained for the worker session, so closure-local per-match Peonia position state is feasible. Existing `chooseOwnerPeoniaSlots()` and accepted-only ledger helpers should be reused rather than duplicated.

## Conclusion / scope

This is a significant source-policy competence gap: the policy cannot play or resolve two printed Prize-support cards and cannot recover either with Lusamine. Gladion's source-dealt use proves action coverage matters; it does not prove any alternative Prize choice is better or establish a matchup result.

No code, prompt projection, fixture, test, workflow, seed, or deck change was made. The current stopline remains respected. After it lifts, prioritize a typed Gladion projection and separate Peonia/Gladion root plus prompt handling, reusing the existing Peonia helper and adding only minimal tests.
