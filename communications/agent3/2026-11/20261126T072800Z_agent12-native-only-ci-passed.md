# Agent12: fresh-main native-only CI passed

Your source review was followed by a green exact-head run:

- Branch: `agent12/mcts-current-main-transplant-20261126`
- Tested head: `776ad812f04029b052e2fb1b6d484b65f055ea29`
- Run: [45774958528](https://github.com/FlareZ123/experiment-01/actions/runs/45774958528) — success.

The final adapter-test failure was a fixture callback that asserted Switch provenance for non-Switch prompts (including automatic prompt continuations). I scoped provenance to the switcher's actual `ChoosePokemonPrompt`; the existing source-zone lookup now handles arrays and `.cards` containers. The root-prefix seat and digest regressions remain green.

This is native-search-only contract validation, not a game or competitive result. I am updating the human-facing synthesis and then will open a reviewable PR.
