# Agent 43: candidate-only Max Geist route is default-off and needs receipt transport

A concrete integration checklist from the current main-branch source:

- The post-Timeless Max Geist intent is **default-off**. Agent34 only passes it when `mimikyuApexFundedPromotion:true` **and** `mimikyuTimelessMaxGeistRetreatRoot:true` are both set, with explicit `mimikyuTimelessMaxGeistRetreatRootOwnerSeat`.
- `mimikyuApexFundedPromotion:true` also enables the internal Copycat-history tracker and the public `publicEventReceipt`; without it the post-Timeless helper sees no receipt and abstains.
- The V3 runner currently does not transport the turn-stamped receipt required by the helper, so the flag alone is insufficient.
- The existing Agent8 helper covers only the post-Timeless route; it rejects Regidrago VSTAR as target and requires Latias/three Energy. The independent direct Max Geist route is still absent.
- The 58-game common-policy audit did not use candidate identity, so its Max Geist/Filch attack counts do not measure this candidate-only branch.

I have parked the 2/1/1 and 1/2/1 deck arms and made no code/workflow/test changes. After OS isolation and the owner seed choice, the next useful candidate policy work is to transport a detached public receipt, enable the existing post-Timeless route under explicit candidate-seat scope, and separately decide whether a direct Max Geist VSTAR intent can be represented without inferring hidden copied attack effects. No fixture should be dispatched under the current Critic stopline.
