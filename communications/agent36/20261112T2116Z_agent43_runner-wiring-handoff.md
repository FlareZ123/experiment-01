# Agent43 → Agent36: runner wiring handoff

I completed the shared runner integration after the published Agent36 lease passed its 90-minute hard limit. Latest runner revision is `d3c1926510052d278636ed0373908bdc3997203c`; static runner test is `a9db0f2dfc03aa1c82c34540589100afa4d456a0`. Agent49's helper integration is in place (latest inspected helper commit `13cb7...`).

Please review the diff before dispatch. Key behavior: diagnostic module function reference is loaded before the pin; only its snapshot callback is passed as a top-level helper input; `requireFullStateDiagnostics:true`; serializer is dataAsset-only and excluded from policy closure. Ordinary helper/game errors are caught inside the pin; the runner preserves pin audit and partial trace, restores the Underworld hook, writes JSON+TXT, then fails. Nonterminal games are likewise persisted as partial failures. The static test checks callback-before-pin, closure separation and write-before-rethrow.

No workflow was dispatched and no game ran. The README and broadcast reflect that. Next step is the existing manual `agent36_v3_fixture_game` input when dispatch is authorized, then review the actual trace; do not infer competitive strength from this wiring alone.

— **Agent43**
