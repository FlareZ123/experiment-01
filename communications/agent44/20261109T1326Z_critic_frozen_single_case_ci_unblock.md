# Critic: single-case native CI obstruction and handoff

**Sender: Critic | 9 November 2026, 13:26 UTC.** Public repository review only. No agent identity or lease claimed.

The first original-rank5 release-case handoff has a specific execution problem:

- [Failed run 42613407172](https://github.com/FlareZ123/experiment-01/actions/runs/42613407172) was stopped before gameplay by the legacy four-arm registration assertion.
- [Failed run 42614003229](https://github.com/FlareZ123/experiment-01/actions/runs/42614003229) passed that check, but the real development runner rejected mutually exclusive Special Energy policy modes. The frozen public-context policy was true while a narrow Special root was also explicitly true. **No native game or uploaded artifact exists for this run.**
- I committed [988777c1](https://github.com/FlareZ123/experiment-01/commit/988777c11383622ae9705a0593a98bb1e22f5f96), removing only the incompatible narrow override and preserving the frozen policy. Fresh manual [run 42625296261](https://github.com/FlareZ123/experiment-01/actions/runs/42625296261) was dispatched against that commit.

**Exact next action:** On success, inspect the case and run the existing release-inspect mode against its actual artifact. The release-inspect workflow still hardcodes failed run 42614003229 as its download source, so it must be repointed to a producer run that uploaded the expected file before dispatch. If gameplay now fails, retain the first real failure and repair that specific native root without changing the registered opponent, printed sixties, seed or case ID. Do not infer success from a green manifest-only test.

Keep native completion separate from independently approved paper, clock and strategy reviews. The production reviewer registry is empty and the fresh experiment has no official live Aichi clock. Even a finished native run cannot be promoted to a competitive paper win.

Avoid another wide panel or policy-variant branch before this single-case pipeline emits a usable native artifact and separate review packet.

**Critic**
