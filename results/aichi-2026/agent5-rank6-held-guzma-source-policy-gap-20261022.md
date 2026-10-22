# Agent 5: native rank-6 source bot misses twelve held-Guzma mobility windows

**22 October 2026.** The T15+T17 two-Duskull source-first rank-6 Iron Thorns ex versus unchanged New Moon control previously reached the native 260-root cap with no candidate attacks. A **separately preregistered read-only source-owner observation** now resolves the most obvious omitted opponent continuation. This is a **source policy diagnosis**, not a credible candidate win, a completed extra game or a deck recommendation.

## Exact controlled source-owner observation

- Frozen source/candidate 60s, actual source physical seat A and first, seed 407516727, deal SHA **14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de**.
- Complete untouched root SHA **20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419**, T15-only **9626b719fbb911cbfbd2e8b33eeed104b0783bb1ddb302bdaf782e0bf9b12083**, two-Duskull treatment **c453169eb6116e273c0556f71e8c49046c1dfaaab80316f13cefa4a1debe21f5**. Source-owner observer **preserved all four game roots, including this exact digest**, outcome T58 action cap [2,6], source winner not observed.
- Engine pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. [Source-hand preregistration](registrations/agent5-rank6-source-mobility-observer-20261022.md).
- [Compiled CI run **39714016395**](https://github.com/FlareZ123/experiment-01/actions/runs/39714016395) fully passed, [artifact **12397474535**](https://github.com/FlareZ123/experiment-01/actions/runs/39714016395/artifacts/12397474535), ZIP SHA-256 **2efbf2e1db313dafbaf885d70d5ad51fe269e6cbf449925b2b3f014268cbc969**.

### Actual owner observations, not an inferred opening

Source-owned actor observations were taken at the **first real owner-root decision on each odd global turn T35,37,...,57**; 12 distinct turn snapshots from 14 eligible decoder invocations. At **every one of those 12 source turns**:

- Source hand held **two printed Guzma BUS** and **one VS Seeker PHF**.
- Source Supporter use count was **0** and Supporter lock was **false**. Opponent had at least one publicly available Benched target.
- Source Active **Iron Thorns ex TWM** carried only **one Speed Lightning Energy RCL**; its Volt Cyclone costs Lightning plus two Colorless, so it was not funded. Its Retreat Cost is four Colorless, so it could not pay a normal Retreat.
- Source Bench slot 0 held a second **Iron Thorns ex TWM** with **Capture Energy RCL, three Speed Lightning Energy RCL, and Double Colorless Energy SUM**, an evidently funded Volt Cyclone attacker.
- Source's original decision policy continued without playing either Guzma, including all twelve candidate source-owned turn starts. It also held VS Seeker but had no previously discarded Guzma, so no reason to invoke that path.

The physical source list has three Guzma; card text requires choosing an opponent's Benched Pokémon and then switching your own Active with a Benched Pokémon. As the opponent had a Bench and the source had a fully charged attacker on its own Bench, the previously untested **Guzma mobility line is both strategically salient and owner-hand accessible**. Actual paper legality, native `PlayCardAction` and both switching prompts still require a separate accepted-Store test. **A read-only opportunity is not a certified playable action or winner.**

## Generalizable failure mode

The source result was censored after 260 root actions while the source held a potential gust/self-switch Supporter in hand across a long window. Consequently, treating the source's failure to take its last two Prizes as candidate defensive success is methodologically unsound. The setup of a powered Bench attacker alongside an underpowered Active does not guarantee an automatic move: source mobility must be chosen and validated by a two-seat policy. The shared conservative held-Guzma mobility selector in `simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs` presently declines observations with **unknown Special Energy**, potentially missing exactly such Iron Thorns states; it remains to be verified as a root-cause in the canonical composition, and this study does not claim which policy layer omitted the move.

The bounded observer stores only the source's own hand's **Guzma/VS Seeker names** when it is the acting player and both public boards. It reads no candidate private hand, deck or Prize identities and changes no native choices. It samples the first owner-root per source turn, so it does **not** claim a complete within-turn hand census after later draw effects. [Observer](../../simulation/twinleaf/agent5-rank6-source-mobility-observer.cjs), [strict audit](../../scripts/agent5-rank6-source-mobility-native-audit.cjs).

**Next necessary causal test:** preregister and attempt the actual owner-held Guzma root at T35, select a legal opposing Bench target, then promote the powered source Bench Thorns and observe whether the source's real Store reaches a legal subsequent Volt Cyclone. Preserve rejection/errors as first-class results. The source first-decision observation gives adequate motivation, but no native Guzma action has yet been accepted in this experiment.
