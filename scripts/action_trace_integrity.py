"""Deterministic integrity checking for optional, explicitly recorded game actions.

This contract checks a supplied trace against its SHA-256. It cannot prove
that the trace came from a live engine, is complete, or can be replayed.
"""
import hashlib
import hmac
import json

MAX_SAFE_INTEGER = 2**53 - 1


def _check_json_value(value):
    """Allow portable JSON scalars and containers without float ambiguity."""
    if value is None or type(value) in (str, bool):
        return
    if type(value) is int:
        if not -MAX_SAFE_INTEGER <= value <= MAX_SAFE_INTEGER:
            raise ValueError("Trace integer exceeds portable exact range")
        return
    if type(value) is list:
        for member in value:
            _check_json_value(member)
        return
    if type(value) is dict:
        for key, member in value.items():
            if type(key) is not str:
                raise ValueError("Trace object keys must be strings")
            _check_json_value(member)
        return
    raise ValueError("Trace values must be portable JSON (no floats)")


def canonical_action_trace_bytes(trace):
    """Encode ordered events as compact, UTF-8, lexically key-sorted JSON.

    Strings preserve their Unicode code points (no NFC transformation).
    All numeric values must be exact JSON integers within the JS-safe range.
    """
    if type(trace) is not list or not trace:
        raise ValueError("action_trace must be a nonempty list")
    for index, event in enumerate(trace):
        if (type(event) is not dict or type(event.get("step")) is not int
                or event["step"] != index or
                type(event.get("action")) is not str or
                not event["action"].strip()):
            raise ValueError("Trace events need sequential steps and action names")
    try:
        _check_json_value(trace)
        return json.dumps(trace, ensure_ascii=False, sort_keys=True,
                          separators=(",", ":"), allow_nan=False).encode("utf-8")
    except (UnicodeError, ValueError, OverflowError, RecursionError) as exc:
        raise ValueError("Invalid portable action trace") from exc


def action_trace_sha256(trace):
    """Calculate a digest over the canonical action trace payload."""
    return hashlib.sha256(canonical_action_trace_bytes(trace)).hexdigest()


def verify_action_trace(trace, digest):
    """Raise for a missing, malformed, or mismatched action trace digest."""
    if (type(digest) is not str or len(digest) != 64 or
            any(c not in "0123456789abcdef" for c in digest)):
        raise ValueError("Trace digest must be lowercase SHA-256 hex")
    if not hmac.compare_digest(action_trace_sha256(trace), digest):
        raise ValueError("action_trace content does not match trace_sha256")
    return True
