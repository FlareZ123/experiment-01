"""Read-only local preflight for GitHub Actions workflow dispatch contracts.

Requires PyYAML. No GitHub API, workflow dispatch or CI jobs are invoked.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml

MAX_DISPATCH_INPUTS = 25
CANONICAL_WORKFLOW = "agent7-canonical-actor-bilateral.yml"
DISALLOWED_AUTOMATIC_EVENTS = {"push", "pull_request", "pull_request_target"}
REFERENCE_PATTERN = re.compile(r"\binputs\.([A-Za-z_][A-Za-z0-9_]*)\b")


class PreflightError(ValueError):
    """A local workflow contract is invalid."""


class UniqueMappingLoader(yaml.BaseLoader):
    """Parse GitHub Actions' on key as a string and reject duplicate YAML keys."""


def _unique_mapping(loader: UniqueMappingLoader, node: yaml.MappingNode) -> dict:
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=True)
        if key in result:
            raise PreflightError(f"duplicate YAML key: {key!r}")
        result[key] = loader.construct_object(value_node, deep=True)
    return result


UniqueMappingLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _unique_mapping
)


def _scalar_values(value):
    if isinstance(value, dict):
        for item in value.values():
            yield from _scalar_values(item)
    elif isinstance(value, list):
        for item in value:
            yield from _scalar_values(item)
    elif isinstance(value, str):
        yield value


def inspect_workflow(path: Path) -> tuple[set[str], int]:
    """Validate one YAML file and return its events and manual input count."""
    source = path.read_text(encoding="utf-8")
    root = yaml.load(source, Loader=UniqueMappingLoader)
    if not isinstance(root, dict):
        raise PreflightError("workflow root must be a YAML mapping")

    events = root.get("on")
    if isinstance(events, str):
        events = {events: None}
    elif isinstance(events, list):
        events = dict.fromkeys(events)
    if not isinstance(events, dict) or not events:
        raise PreflightError("workflow must declare a valid on: event")

    automatic = DISALLOWED_AUTOMATIC_EVENTS.intersection(events)
    if automatic:
        raise PreflightError(f"automatic per-commit triggers are forbidden: {sorted(automatic)}")

    count = 0
    if "workflow_dispatch" in events:
        dispatch = events["workflow_dispatch"]
        if dispatch in (None, ""):
            inputs = {}
        elif isinstance(dispatch, dict):
            inputs = dispatch.get("inputs", {})
            if inputs in (None, ""):
                inputs = {}
        else:
            raise PreflightError("workflow_dispatch must be a YAML mapping or empty")
        if not isinstance(inputs, dict):
            raise PreflightError("workflow_dispatch.inputs must be a YAML mapping")
        count = len(inputs)
        if count > MAX_DISPATCH_INPUTS:
            raise PreflightError(
                f"workflow_dispatch declares {count} inputs; GitHub limit is {MAX_DISPATCH_INPUTS}"
            )

        if path.name == CANONICAL_WORKFLOW and set(events) != {"workflow_dispatch"}:
            raise PreflightError("canonical engine workflow must be manual-only")
        if path.name == CANONICAL_WORKFLOW or count >= 20:
            for name, definition in inputs.items():
                if not isinstance(name, str) or not isinstance(definition, dict):
                    raise PreflightError(f"malformed canonical dispatch input: {name!r}")
            # Inspect parsed job expressions, never YAML comments or unused metadata.
            # Cap-adjacent workflows need the same selector-usage integrity gate.
            references = set(REFERENCE_PATTERN.findall(
                "\n".join(_scalar_values(root.get("jobs", {})))
            ))
            unreferenced = set(inputs) - references
            undeclared = references - set(inputs)
            if unreferenced or undeclared:
                raise PreflightError(
                    f"canonical input mapping mismatch: unused={sorted(unreferenced)}, "
                    f"undeclared={sorted(undeclared)}"
                )
    elif path.name == CANONICAL_WORKFLOW:
        raise PreflightError("canonical engine workflow is missing workflow_dispatch")

    return set(events), count


def main(paths: list[str] | None = None) -> int:
    files = [Path(p) for p in paths] if paths else sorted(
        path for extension in ("*.yml", "*.yaml")
        for path in (Path(__file__).resolve().parents[1] / ".github" / "workflows").glob(extension)
    )
    if not files:
        print("error: no workflows found", file=sys.stderr)
        return 1
    failed = False
    for path in files:
        try:
            events, count = inspect_workflow(path)
            print(f"OK {path.name}: events={','.join(sorted(events))} dispatch_inputs={count}")
        except (OSError, yaml.YAMLError, PreflightError) as error:
            failed = True
            print(f"FAIL {path}: {error}", file=sys.stderr)
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
