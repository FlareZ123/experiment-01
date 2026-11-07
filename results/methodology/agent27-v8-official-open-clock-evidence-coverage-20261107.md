# Agent 27: full v8 original-eight archive has zero of sixteen Aichi Open event-clock receipts

**7 November 2026. Independent read-only archive metadata census, no rerun.** Supports the [actual original Aichi Open event regulation](agent27-aichi-open-official-time-adjudication-20261107.md). The benchmark still has zero competitively qualified timed games.

## Immutable native artifact and custody

Downloaded the existing [v8 eight-context owner-Ability retrospective archive, artifact 13538082892](https://github.com/FlareZ123/experiment-01/actions/runs/42287771647/artifacts/13538082892). The 98,778-byte ZIP SHA256 was **`36d759b28ae75bb120d94c30a6faa2ae79bd1e03ddb0df902a94418e2ba47882`**. Its embedded JSON sidecars verify as:

- `control/issue25-steward-v8.json`: **`b329cdba4e0b2dc937251993cb379ec6b62a56d3e22f1f328fc58fe1e3b4996d`**
- `treatment/issue25-steward-v8.json`: **`6ed9db1568aaf546e3165ddae2a2fa21fd1224f7d50e1e2dc8b8c6f578bb5a45`**

Both contain the *same eight registered IDs* across source original ranks **6, 11, 1, 3** with two fixed contender IDs. This is a retrospective **control/treatment archive**, not sixteen independently qualified games. The control is the old shared v8, and the treatment is a separate owner-Ability/Telepath experimental policy. No new simulation was dispatched for this audit.

## Complete error-inclusive census

| Native disposition | Control eight | Treatment eight |
| --- | ---: | ---: |
| Root128 cap | 3 | 7 |
| Engine error with preserved source root prefix | 5 | 0 |
| Native terminal, unqualified | 0 | 1 |
| Real **official** Aichi Open end-call receipt | **0** | **0** |
| Native archive event-stage designation (Swiss vs Top32 vs final) | **0** | **0** |
| Competitively qualified games | **0** | **0** |

The sole native terminal was treatment `1:212:B:champion-reference`, root count **110**, native winner physical seat1 and final `[6,0]` Prizes. As previously reported by Agent45, the original source seat0 made zero attacks, so strategic opponent competence is unqualified even though the native terminal is real. No source outcome is newly reclassified here.

For **all 16 attempts**, I checked the complete top-level exported `attempts[]` keys and first public accepted-root object keys for time, clock, elapsed, call, event-stage and overtime metadata. The only top-level regex match was `abortFailureStage` (an error label), and **zero** public root records included any time/clock field. Eight source deal fingerprints and starting-seat values exist, but those do not establish elapsed match time, exact official time call, prescribed final second-starter-turn completion or skipped Pokémon Checkup.

## Official rules implication

The actual 2026 Aichi Open Swiss round has **both players lose** if the permitted turn ends with no winner. A Top32 knockout game instead uses special Prize thresholds and extensions; its final has a 35-minute clock. Source: [Pokémon Card Game organizer, CL Aichi May 2026, Open League](https://www.pokemon-card.com/info/005445.html). No post-hoc assignment of time-call point can be extracted from these native root ordinals. For example, the treatment `11:211:A:new-moon-lockbreaker-v1` cap ends with `[6,2]` Prizes: this is **not** an awarded knockout Prize lead because it is a **root128 cap** with no official time call or completed prescribed final turn.

The new [pure official-stage classifier](../../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs) is deliberately separate from the native archive and always returns `competitiveAdmission:false`, even on complete-looking externally asserted receipts. The proper benchmark must prospectively register whether it represents Swiss, Top32 elimination, or Open final, implement/prove an actual match-clock provenance, and preserve all censored/error/no-call rows rather than converting caps into timeout results.

## Method and reproducibility

The ZIP was downloaded through the GitHub artifact interface into the current research environment. Python `zipfile`, `json`, `hashlib.sha256` and `collections.Counter` were used to inspect the two JSON files, enumerate all sixteen `attempts`, compare their native outcomes and keys, and verify both byte-exact sidecar hashes. No text was fabricated and no hidden hands or vendor code were needed. The archive census is deterministic on its saved bytes and **does not certify that its actual policy produced realistic play, paper-correct effects, or an official tournament timed game**.

### Two clock-critical observed counterexamples from the frozen archive

The **two rank3 original Snorlax Stall** attempts, `3:213:A:champion-reference` and `3:213:A:new-moon-lockbreaker-v1`, both reached the 128-native-root cap with **`[6,6]` Prizes and zero settled attack declarations by either seat**. This is a reproducible native *no-progress* state, not a proof the players or tournament judges would have allowed 25 real minutes to pass. **Hypothetically**, if a real Aichi Open **Swiss** end call and prescribed turn completion happened at a comparable paper-legal 6–6 state, both players would lose; in **Top32 knockout**, an unresolved 6–6 state instead enters extension under both-high condition. The event organizer specifies **no finite maximum extension duration** on the public page, so a simulator may need actual player/clock/judge conduct to know when a draw or normal win arises. Do not grant the candidate a victory from an artificial root cap, nor award a draw merely because both Prize counts remained six.

Similarly, the source-rank11 new-moon attempt's native 128-cap `[6,2]` Prizes would be a knockout lead for seat1 **only if** a real end-call and the prescribed post-call turn had actually completed at the same independently paper-reviewed state. That evidence is absent from all archived 16 attempts.
