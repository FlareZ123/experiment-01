# One actual rank11 native win reversal from VS Seeker → Guzma → Max Geist

**Agent31 | 9 November 2026 | outcome: accepted multi-turn native attack and Prize sequence | selected historical physical deal | zero competitively qualified games**

## Decision and realized continuation

The same printed `champion-reference` 60-card candidate that **lost** the existing original rank11 physical game was made to **win** that native game by adding one reversible, exact-turn owner-public tactical rule. The candidate recovered its discarded Guzma using `VS Seeker PHF`, gusted the original source's vulnerable Benched `Garbodor BKP`, promoted a funded `Shadow Rider Calyrex VMAX CRE`, and used `Max Geist`. The subsequent attack schedule took the candidate's final four Prize cards, including a later three-Prize `Mega Absol ex M1L` knockout.

This is a **complete native game-result reversal in a single previously observed deal**, with physical prompts, native attack declarations, settled damage and Prize changes. The opponent's actual following turns also occurred. The game model's developmental opponent behavior, unknown tournament-clock outcome, and unqualified historical English-printing representation prohibit translating this to a competitive win percentage.

## Exact actual Store events

| Actual turn / accepted action ordinal | Settled physical evidence |
| --- | --- |
| Source turn35 / ordinal184 | Opponent's `Guzma` counter-gust had stranded candidate `Dialga-GX` Active |
| Candidate turn36 / ordinal199 | Native `VS Seeker` Item played in place of the historical `PassTurnAction` |
| Candidate turn36 / 200–201 | Genuine owner-discard native prompt recovered own `Guzma BUS`; one intended Seeker prompt physically accepted |
| Candidate turn36 / 202–204 | Native `Guzma` played; opponent's Bench index1 `Garbodor BKP` physically promoted, candidate's funded `Shadow Rider Calyrex VMAX CRE` physically promoted; both target prompts confirmed |
| Candidate turn36 / 205 | Native `Max Geist` declared and settled; source Active before: **Garbodor BKP**, no Tool, no damage; after: **Mega Absol ex M1L**; candidate Prizes **4 → 3** |
| Source turn37 / 211 | Original source genuinely **passed** with newly promoted unpowered Mega Absol; its prompt subsequently resolved |
| Candidate turn38 / 217 | Native `Max Geist` settled **190 damage** on active Mega Absol; no Prize change |
| Source turn39 / 221–223 | Original source actually played `Oranguru V`, then **passed** |
| Candidate turn40 / 225 | Native `Max Geist` Knocked Out the damaged Mega Absol; candidate Prizes **3 → 0** (three-Prize Mega Evolution knockout), native game ended with candidate win |

At turn36, the already-visible five Basic Psychic Energy across candidate's Pokémon permitted the conservative published *nominal* Max Geist calculation `10 + 5 × 30 = 160`. The selector's public-card predictor chose the only suitable sub-160-HP Benched target rather than the first 280-HP Mega Absol. Later `Max Geist` damage was established from actual Store settlement, including the **190** damage on turn38, without inferring its damage modifiers from the earlier simplified predictor.

The turn36 target print was independently exposed by the actual post-Store public attack snapshot, and the two different prompt replies were tied to their genuine owner/opponent physical Pokémon instances. The turn36 attack's source Active change and physical Prize decrement establish a real knockout rather than a mere button press.

## Matched original trial and result

- Frozen source registration `11:3:B:champion-reference`, original source rank11, original seed `1101197735`, candidate physical seat1, source seat0. The two candidate 60s, physical deal fingerprints and source field were unchanged in all three phases.
- A0 control: source seat0 native winner, final Prizes `[0,4]`, **247** accepted roots.
- B treatment: candidate seat1 native winner, final Prizes `[1,0]`, **227** accepted roots.
- A1 recontrol: the control's original accepted-root ledger SHA replayed exactly. **Root-ledger equality does not assert bitwise full-state or hidden-draw parity.**
- The same experiment included the `new-moon-lockbreaker-v1` contender on its fixed native deal. It had no Seeker tactical selection; both arms remained the same incomplete action-capped 260-root game. Thus it supplies no independent positive exposure.

This A0/B/A1 is retrospective after finding the turn36 opportunity in Agent14's earlier native archive. It does not imply two or three independent wins: the three phases intentionally reuse one original seed. No unbiased frequency, real competitive victory, tournament time compliance or 99.5% aggregate is established.

## Code and bounded adoption

The actionable implementation is [public scaling and recovery selector](../../../simulation/twinleaf/agent31/late-seeker-guzma-prize.cjs), plugged into the [authentic actor-only Store owner-root](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) and [Guzma two-sided native prompt continuation](../../../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs). The [one-deal A/B/A runner](../../../simulation/evaluation/agent31/late-seeker-guzma-postgust-aba.cjs) carries strict physical deal, Prize, target and outcome accounting. Options are routed through the existing [canonical two-player runner](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs). **Tactical option remains off by default.** The new action explicitly detects Item and Supporter locks, Supporter quota, available discard target, direct-attack alternatives, funded Bench attacker, public-scaled damage, and exact target/prompt custody.

Eight focused tests passed, including the real root-ledger `playerSlot` and `attack` schema regression. CI source: [successful pinned compilation and A/B/A execution 42539727682](https://github.com/FlareZ123/experiment-01/actions/runs/42539727682). Its uploaded `agent31-rank11-postgust-seeker-aba` artifact includes every arm and outcome including the unaltered capped result, with source-digest audit. The prior [same real native winner-flip run 42539135984](https://github.com/FlareZ123/experiment-01/actions/runs/42539135984) separately reproduced the winner reversal.

**Decision:** Retain this as a tested tactical candidate for general-policy evaluation, with no automatic default-promotion or 60-card-list modification. The transferable improvement is owner-public **action conversion**: a legal-looking Seeker recovery whose complete physical follow-on attacks and Prize trade can be evaluated against a stalled board. The next substantive experiment should measure how often such chains arise across independently selected original matchups and both physical seats, with unchanged printed 60s and a defensible decision policy. Distinguish native game-end results from tournament-paper performance.
