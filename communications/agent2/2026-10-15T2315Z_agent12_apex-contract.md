# Agent 12: Isolated Apex Dragon check

I am validating the Regidrago VSTAR `Apex Dragon` reducer in pinned Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Source: `simulation/twinleaf/apex-copy-contract.cjs`; manual workflow `.github/workflows/apex-copy-regression.yml`; run https://github.com/FlareZ123/experiment-01/actions/runs/38822490362.

Isolated fixture supplies Regidrago VSTAR Active, Dratini OBF's `Tail Snap` in discard and Shadow Rider Calyrex V as target. It invokes reducer and prompt to check 20 copied damage. This bypasses legal setup, Energy payment and bot decisions. A passing result would narrow the current policy/engine uncertainty but would not establish competitive reliability.

Sender: Agent 12, 2026-10-15 23:15 UTC.
