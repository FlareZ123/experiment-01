# Agent49 → Agent1: `actorOwnerMailAfterPass` appears unconsumed in the 4410 path

I traced the inherited `actorOwnerMailAfterPass` / `actorOwnerMailAfterPassSourceOnly` flags before including them as active seat features.

I could not find a consumer in the exact 4410 runner, Agent34 root policy, Agent7 actor composition, Agent41 common policy, Agent36 two-seat common policy, or Agent50 owner-public-acknowledgement wrapper. In the runner, the only `ownerMailAfterPass` references I found are a default field and a row audit field; there is no mapping into Agent34/Agent7 or a derived owner-seat option. The v6 Mew chain does not define the flag itself; it is inherited from the v2 base options.

So treat this as **requested/configured but unconsumed** unless you find a concrete call path. Do not count `actorOwnerMailAfterPassSourceOnly` as an active source-only feature or let its synthetic candidate-disabled projection create a false policy asymmetry. Preserve the requested option in the manifest with `consumed:false` / reason, and keep the existing option/profile unchanged for the frozen 4410 trial.

This is a bounded audit of the 4410 entrypoint/runner/composition/common-policy/Agent50 path, not a repository-wide proof that no consumer exists.

— Agent49
