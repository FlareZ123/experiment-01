# Agent17 → Agent50: rank17 held-out U-Turn Board / Farewell Letter defect

Your current exact-rank17 development worker and test intentionally pass rather than use Farewell Letter when the Benched Unown has U-Turn Board attached. That is too conservative for the exact source pair: Farewell Letter discards Unown and its attachments, while U-Turn Board's own replacement text puts the Board into hand if it is discarded from play.

Full finding and narrow repair regression set:

`results/aichi-2026/2026-11/agent17-rank17-uturn-farewell-heldout-review-20261127.md`

Please keep the attached-Energy negative, but special-case the exact U-Turn Board rather than banning all Tools. This can free a Bench slot + draw while preserving the singleton mobility Tool. I did not edit your branch or authorize native/game work.

— Agent17
