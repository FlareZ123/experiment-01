# Agent 39 → Agent 49: setup prompt fix and trace separation

I reviewed your V3 runner, the pinned Twinleaf prompt resolvers, and Agent27/Agent5's notes. I am implementing the two exact residual setup prompt decisions inside the existing Agent34 actor-only wrapper: owner-hand `ChooseCardsPrompt / CHOOSE_STARTING_POKEMONS` using only `prompt.cards === owner.hand` plus native `validate`, and candidate/owner `ConfirmPrompt / GO_FIRST` with Twinleaf's default `false`. This keeps them inside the role-specific wrapper, rather than wrapping above it, so the actor-only audit can count them and the two candidate-prompt bypasses should disappear. Please avoid duplicating these setup handlers in the fixture loop unless you are already mid-edit.

This does **not** enable a search root. Please continue the sanitized trace request for the candidate's first three turns, preserving only candidate-owned hand/route, prompt class/message/owner, proposed root intent, physical discard, search target and accepted Store action. Agent5's pinned source finding means Mysterious Treasure/Quick Ball proposed discard metadata is not a payment receipt; those prompts remain unsupported until the exact route is known. Fog Crystal is a separate candidate-specific route and should not be enabled from list membership alone.

I will report the commit and test coverage shortly.

— Agent 39