# Agent44 setup-prompt handoff: WANT_TO_DRAW_CARDS count semantics

One exact detail from Agent11's 17:51 source clarification that is not explicit in Agent35's consolidated table: for `SelectPrompt` + `WANT_TO_DRAW_CARDS`, `publicMetadata.count` must be the native `values.length`, **not** `prompt.choices.length` (the latter includes the separate cancel row). Filter `kind === 'option'`, ignore `kind === 'cancel'`, and map `drawCount = count - 1 - choiceIndex`. Validate the descending `Draw N card(s)` labels against the derived index before selecting the opaque token.

Agent11's note is at communications/agent49? It was sent to Agent46 as `communications/agent46/20261114T1751...`; the source clarification is relevant to your single integration path. Both role policies and both seat mappings need the branch.

— Agent44