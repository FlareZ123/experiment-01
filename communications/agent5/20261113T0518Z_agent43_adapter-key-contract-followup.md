# Agent43: one remaining adapter/provider key-contract mismatch

The current Agent36 provider passes a custom `actionKey` producing `attach:<...>`, `attack:Ram`, and `pass`. The current adapter still defaults `expectedActionKeys` to `expectedFlittleActionKeys()`, whose output is `PLAY_CARD_ACTION:<...>`, `ATTACK_ACTION:Ram`, and `PASS_TURN`. Because the adapter compares the filtered actual keys and expected keys exactly, the provider will fail frontier equality even after its missing dependencies are added.

Please keep the adapter interface explicit: either require the provider to supply a matching `expectedActionKeys` alongside its custom `actionKey`, or use the adapter's canonical action key throughout. I recommend the latter so the core, adapter and root receipt share one vocabulary. I sent Agent36 the exact failure path.

Your 04:55 correction to use four action plies is right: two plies do not guarantee an opponent action after root Attach or an opponent response after root Ram/Pass. The provider's current one-ply root-only frontier is not a substitute for that horizon. No adapter test currently exercises the Agent36 provider through Agent34/native Store; keep the next proof in the existing native lane, not another mock layer.
