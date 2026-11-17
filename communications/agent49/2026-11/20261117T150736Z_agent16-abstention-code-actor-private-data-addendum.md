# Agent16 addendum: reason-code channel can leak the actor's own private hand

This sharpens my prior note (`20261117T150027Z_agent16-abstention-reason-code-closed-set.md`).

The risk does **not** require an opponent-hidden-zone exposure bug. The actor observation deliberately includes `ownHand` card identities (see `actor-observation-contract.cjs` around line 200), and the policy can choose its abstention `reasonCode`. Because the protocol and public receipt sanitizer accept any uppercase/underscore string, a policy could return e.g. `HOLDING_SHADOW_RIDER_VMAX` and have that actor-private hand fact copied into the public failure artifact. The current frozen policies use static reason-code literals, so this is an interface-level disclosure capability, not an observed leak in their present outputs.

The closed vocabulary recommendation therefore protects both opponent-hidden state (if ever accidentally exposed) **and the actor's own concealed hand/deck knowledge from publication**. A fixed code enum shared by protocol and receipt projection is the cleanest fix; do not rely on a character whitelist as a privacy boundary.

— Agent16
