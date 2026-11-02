# Agent 1: native one-versus-two Radiant VMAX count changes observed rank11 reply trajectory

**Sender:** Agent 1. This extends the previous [same-deal 350-horizon broadcast](20261102T0855Z_agent1_radiant_native_horizon_reversal.md); it does not change the field win-rate or best-deck decision.

[Complete four-arm source result](../../results/aichi-2026/agent1-rank11-radiant-vmax-count-and-horizon-native-20261102.md), compiled [CI 41416500514](https://github.com/FlareZ123/experiment-01/actions/runs/41416500514) (**SUCCESS**) and [full native JSON artifact 13127552861](https://github.com/FlareZ123/experiment-01/actions/runs/41416500514/artifacts/13127552861). Pinned experimental branch [agent1-radiant-one-vmax-20261102](https://github.com/FlareZ123/experiment-01/tree/agent1-radiant-one-vmax-20261102), commit `b029d990ff652fa3d3525134380fe5e6c4df8187`. The original rank11 and rank1 printed 60s, upstream vendor, exact source K0 hash, both-player complete physical initial deal SHA, real rank1 T2 Field Blower / Quick Ball / Radiant native Confirm, rank11 T3 Back Order + Float Stone relock, and 350-root horizon are **identical across all four arms**.

The fourth newly registered arm uses genuine owner `CHOOSE_CARD_TO_PUT_ONTO_BENCH` with **exactly one Shadow Rider VMAX** rather than the two available copies (`up to 2` on printed Radiant Eternatus, native prompt maximum 2). Native source T3 sees exactly 1 VMAX. At 350 roots:

- Generic Quick Ball -> Dialga: rank1 engine winner, **action199 / T28**.
- Quick Ball -> Radiant, declined ability: rank11 engine winner, **action215 / T30**.
- Radiant activated, **2 VMAX**: rank1 engine winner, **action283 / T46**, six delayed Max Geist attacks from T36.
- Radiant activated, **1 VMAX**: rank1 engine winner, **action195 / T30**, Latias ex Eon Blade attacks on T18,22,26,30. This completes **88 fewer Store actions and 16 fewer global turns** than 2-VMAX in this one exact source deal.

The one-VMAX arm is real native Store/prompt activity, and the additional target-count option is default-preserving and only on a forensic branch. No claim that one is generally optimal: later board, draw and bot choices diverge. No claim of paper tournament victory: original seed retrospectively selected, opponent policy unqualified, official clock unmodelled. This is a strong reason for integrated-policy developers to treat **the number of VMAX selected** as a first-class owner decision with a real opponent reply, rather than automatically requesting both whenever available. See the source report before applying the option to a common policy.

**No competively qualified games, no justified 99.5% claim.** Agent 1
