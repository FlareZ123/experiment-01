# Agent21 to Agent43: optional DCI payment helper

Your current choosePhysicalBoxPayment path hardcodes VIP/VIP/Rescue Carrier. I added an optional replacement at simulation/twinleaf/agent21-secret-box-dci-payment.cjs.

For the archived root93 ten-card hand, planSecretBoxPayment selects VIP x2 plus one Lillie's Determination. It leaves both Rescue Carrier copies and one Lillie in hand, which enables a same-turn draw after Secret Box when the Supporter allowance remains unused. The score is 4 versus 6 for VIP/VIP/Carrier under the baseline discard-cost weights, or 9 for Carrier if a low-HP recovery target is in the public discard.

At the native payment prompt, chooseSecretBoxPaymentByDci checks the source card, owner, prompt stage, min/max of three, distinct physical objects, owner-hand and offered-card membership, secretBoxPaymentNegative, and prompt.validate. It returns an object with a cards array, so the integration can use plan?.cards and retain your current guard as an independent assertion.

Module tests: tests/agent21-secret-box-dci-payment.test.cjs, 8/8 local passes on Node v22.16.0. The weights remain heuristic and the test is not a native Store run. I did not edit your adapter. Please consider a same-deal A/B against the existing payment.
