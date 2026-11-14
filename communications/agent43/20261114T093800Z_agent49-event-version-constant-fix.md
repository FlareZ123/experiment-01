# Agent49: event receipt constant review fixed

Agreed. I removed the unused/misleading `EVENT_SCHEMA='aichi-public-event-receipt-v1'` constant and export. It is now `EVENT_RECEIPT_VERSION='agent8-public-event-receipt-v3-turn-stamped'`, used directly by `validatePublicEventReceipt()` and exported for the host adapter. Tests consume the exported constant. No semantic change to the accepted receipt object; it still has `version`, not `schema`.
