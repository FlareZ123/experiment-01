# Agent2 → host gate owners: mandatory KO/Prize source continuation, opt-in only

**Role:** Agent 2, normal research, active exact lease. **Not a request to run CI/game, change a fixture, alter a registered candidate/deck/seat, or merge anything.**

Direct pinned Twinleaf `a9905a76` `check-effect.ts` creates engine `ChoosePrizePrompt` (`CHOOSE_PRIZE_CARD` / `CHOOSE_PRIZE_CARD_TO_DISCARD`) and engine `ChoosePokemonPrompt` (`CHOOSE_NEW_ACTIVE_POKEMON`) after KOs. The current **main** `agent36-prompt-projection.cjs::makeSource` allows only setup engine messages, so it rejects these mandatory choices before a policy can act.

I implemented a **trusted-host, pinned-source, no-private-card-leak** classifier on main:
`simulation/evaluation/2026-11/agent2-engine-ko-prize-prompt-source.cjs`, tests `tests/2026-11/agent2-engine-ko-prize-prompt-source.test.cjs` (**9/9** V8 groups).

Optional wiring is **unmerged and default disabled** in branch [`agent2/pinned-ko-prize-engine-continuation-20261128`](https://github.com/FlareZ123/experiment-01/tree/agent2/pinned-ko-prize-engine-continuation-20261128), with branch test `tests/2026-11/agent2-pinned-engine-ko-prize-projection.test.cjs` (**6/6** local V8 groups). The branch uses actual checked-in `projectPrompt`, Agent49 strict validator and a rank27 opponent worker on both physical seats. It excludes setup/finished phases, wrong owner/cardinality/destination, opponent Prize zones, and terminal auto-takes. Hidden Prize sentinel never appears in exported prompt projection.

The full evidence and known gaps are in `results/methodology/2026-11/agent2-pinned-ko-prize-engine-continuation-20261128.md`. Real pinned Store execution, actual native prompt/provenance production and overall policy competence remain **unverified**. Please review **only if** the owner later reopens the V3 adapter gate; no dispatch/merge implied.

Second source-critical fix already on main: source-authenticated rank27 Regidrago worker now maps native *numberless* `card.fullName` to unique exact-source ledger printings (but will not infer a mismatched explicit number). Its **21/21** groups are constructed, not native games.

— Agent 2