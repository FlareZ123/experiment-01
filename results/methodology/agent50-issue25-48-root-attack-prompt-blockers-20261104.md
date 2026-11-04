# Issue25: extending frozen native owner-only policy to 48 actions reaches ATTACK-phase prompt boundaries

**Agent50, 4 November 2026.** Predeclared [V6 horizon extension](registrations/agent50-issue25-48-root-horizon-v6-20261104.md) changed only `nativeRootActionLimit:16` to `48` on the exact V5 adapter closure and the same four rank6/11 original source sixty versus champion/NewMoon historical candidate arms. [Full compiled CI 41767885327](https://github.com/FlareZ123/experiment-01/actions/runs/41767885327) passed every existing test group plus one extended native integration test, pinned `vendor/twinleaf=a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, workflow head `cb0cfbd8f8c383bc20fdea37e3da6df69ae86586`.

The outer Agent4 native raw-State decoder quarantine remained active. The same owner-only modules selected 4 public turn-order confirmations, 8 opening Basic selections, 4 mulligan disclosures, 48 mechanical Wait acknowledgements and 4 mandatory in-turn ShowCards disclosures. **Original native `SimpleTacticsAi.decodeNextAction` executed zero times.** All four trial rows survived through the shared runner's own error custody or normal return; none was discarded.

| Registered original-source arm | V6 disposition | First unresolved native interface | Direct native provenance |
| --- | --- | --- | --- |
| rank6 champion-reference, source physical seat1 | engine-error | **turn5, phase3 ATTACK, ChooseCardsPrompt, owner seat0** | halted before direct row-level result |
| rank6 new-moon-lockbreaker-v1, source seat1 | normal cap48 return | none within registered window | source deal `2ce05954cf7a...`; full deal `0f0d8f7e4f24...`; first starter seat0; 48 native actions/roots; turn7; finished=false |
| rank11 champion-reference, source seat0 | engine-error | **turn3, phase3 ATTACK, ChooseCardsPrompt, owner seat1** | halted before direct row-level result |
| rank11 new-moon-lockbreaker-v1, source seat0 | engine-error | **turn9, phase3 ATTACK, OrderCardsPrompt, owner seat1** | halted before direct row-level result |

Pinned [GamePhase enum](../../vendor/twinleaf/ptcg-server/src/game/store/state/state.ts) defines `ATTACK=3`. These are real *attack-resolution prompt boundaries*, not ordinary startup handshakes. `ChooseCardsPrompt` and `OrderCardsPrompt` choices can embody attack costs, optional search or card-order decisions, so blindly choosing the first card or an arbitrary ordering would be a weak, potentially paper-inaccurate solution.

The rank6/New Moon normal row's direct source-deal fingerprint was `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1`, complete physical-deal fingerprint `0f0d8f7e4f24222481e26890a2a534109846bd0903cdf8b449c03d1cdb24b847`; `verifiedFirstTurn:true`, `rootActionCount=48`, `finished=false`, `winner=null`. Its last three public roots include a prompt response, `Lillie's Clefairy ex` PlayCardAction, and PassTurnAction at turn7.

For the **three aborted runs**, the runner currently returns `engine-error` rows without direct `sourceDealFingerprint` and `rootActionCount`; this is an archive gap, not proof those initial physical deals were absent. Their first native fallback metadata remains lossless (turn, phase, responding physical seat, prompt class) under the outer quarantine. The earlier V5 cap16 execution provided fingerprints for each same historic stream, but those should not be silently transplanted into this aborted V6 test without a separate parity observer.

**Next research requirement:** a read-only, owner-visible prompt envelope (public prompt.message, own action/source context, min/max and selection class, never concealed card identities) captured at each ATTACK-phase first fallback, followed by card-effect-specific native Store and paper-rules tests before any actual selector is authorized. Public root-action histograms should distinguish attack and game decisions from protocol acknowledgements. Agent41's run remains a historical development composite with source-special scripts, and the first whole-policy release gate remains **unqualified**.

**No game reached terminal**, no full match, no opponent competency calibration, no paper 25-minute clock and no 99.5% field win evidence.
