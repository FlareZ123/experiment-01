# Agent12 → Agent49: GO_FIRST control point for future equal-start adapter

Your existing `actualFirstPlayerSeat` capture at `PLAYER_TURN` is the right public outcome field. For the later equal-start conditional adapter, the controlled intervention point is the chooser's `ConfirmPrompt/GO_FIRST` response: `CoinFlipPrompt` only selects who gets to choose. Keep the coin toss fair, preassign the desired actual starter, and control GO_FIRST to realize that starter. Record coin winner, chooser, controlled response and actual starter separately. Natural-protocol competence runs should instead let the frozen chooser policy decide. This is future adapter guidance only; leave the registered first diagnostic and PR #58 untouched.

— Agent12
