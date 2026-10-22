"""Offline GitHub Actions workflow_dispatch gate for the shared research repository.

Requires PyYAML >=6.0. Run locally before pushing workflow edits, without
launching GitHub Actions or consuming simulation budget.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys

import yaml

MAX_DISPATCH_INPUTS = 25
CANONICAL_WORKFLOW = '.github/workflows/agent7-canonical-actor-bilateral.yml'
INPUT_REFERENCE = re.compile(r'\binputs\.([A-Za-z_][A-Za-z0-9_]*)\b')
ALLOWED_TYPES = {'boolean', 'choice', 'number', 'environment', 'string'}


class StrictBaseLoader(yaml.BaseLoader):
    """Keep YAML's literal `on` key and reject duplicate mapping keys."""

    def construct_mapping(self, node: yaml.MappingNode, deep: bool = False) -> dict:
        result = {}
        for key_node, value_node in node.value:
            key = self.construct_object(key_node, deep=deep)
            if key in result:
                raise yaml.constructor.ConstructorError(
                    None, None, f'duplicate key {key!r}', key_node.start_mark
                )
            result[key] = self.construct_object(value_node, deep=deep)
        return result


def _walk_strings(node: object):
    if isinstance(node, str):
        yield node
    elif isinstance(node, list):
        for item in node:
            yield from _walk_strings(item)
    elif isinstance(node, dict):
        for item in node.values():
            yield from _walk_strings(item)


def inspect_workflow(source: str, path: str, canonical: bool = False) -> dict:
    """Validate dispatch input count, names, references, and canonical trigger scope."""
    doc = yaml.load(source, Loader=StrictBaseLoader)
    if not isinstance(doc, dict):
        raise ValueError(f'{path}: workflow must be a YAML mapping')
    events = doc.get('on')
    if isinstance(events, dict):
        event_names = set(events)
        dispatch = events.get('workflow_dispatch')
    elif isinstance(events, list):
        event_names = set(events)
        dispatch = None
    elif isinstance(events, str):
        event_names = {events}
        dispatch = None
    else:
        raise ValueError(f'{path}: missing or invalid on trigger')

    if canonical and event_names != {'workflow_dispatch'}:
        raise ValueError(f'{path}: canonical workflow must be manual-only, got {sorted(event_names)}')
    if 'workflow_dispatch' not in event_names:
        if canonical:
            raise ValueError(f'{path}: canonical workflow lacks workflow_dispatch')
        return {'path': path, 'has_dispatch': False, 'inputs': 0}

    if dispatch is None:
        inputs = {}
    elif isinstance(dispatch, dict):
        inputs = dispatch.get('inputs', {})
        if inputs is None:
            inputs = {}
    else:
        raise ValueError(f'{path}: workflow_dispatch must be a mapping or null')
    if not isinstance(inputs, dict):
        raise ValueError(f'{path}: workflow_dispatch.inputs must be a mapping')
    if len(inputs) > MAX_DISPATCH_INPUTS:
        raise ValueError(
            f'{path}: workflow_dispatch declares {len(inputs)} inputs; GitHub permits {MAX_DISPATCH_INPUTS}'
        )
    for name, spec in inputs.items():
        if not isinstance(name, str) or not isinstance(spec, dict):
            raise ValueError(f'{path}: invalid dispatch input {name!r}')
        if spec.get('type', 'string') not in ALLOWED_TYPES:
            raise ValueError(f'{path}: invalid dispatch type of {name!r}: {spec.get("type")!r}')
        if canonical and spec.get('type') == 'boolean' and spec.get('default') != 'false':
            raise ValueError(f'{path}: canonical boolean input {name!r} must default false')

    if canonical:
        references = set()
        for value in _walk_strings(doc.get('jobs', {})):
            references.update(INPUT_REFERENCE.findall(value))
        unknown = references - inputs.keys()
        unused = inputs.keys() - references
        if unknown:
            raise ValueError(f'{path}: undeclared input references: {sorted(unknown)}')
        if unused:
            raise ValueError(f'{path}: declared inputs not used by any job: {sorted(unused)}')

    return {'path': path, 'has_dispatch': True, 'inputs': len(inputs),
            'remaining': MAX_DISPATCH_INPUTS - len(inputs)}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('paths', nargs='*', type=Path,
                        help='Workflow YAML paths (default: all .github/workflows/*.yml and *.yaml)')
    args = parser.parse_args(argv)
    paths = args.paths or sorted(
        list(Path('.github/workflows').glob('*.yml')) +
        list(Path('.github/workflows').glob('*.yaml'))
    )
    if not paths:
        print('No workflow YAML files found', file=sys.stderr)
        return 2
    failures = 0
    for path in paths:
        try:
            report = inspect_workflow(path.read_text(encoding='utf-8'),
                                      path.as_posix(),
                                      path.as_posix() == CANONICAL_WORKFLOW)
            if report['has_dispatch']:
                print(f'OK {path}: {report["inputs"]}/{MAX_DISPATCH_INPUTS} dispatch inputs')
        except (ValueError, yaml.YAMLError) as exc:
            failures += 1
            print(f'FAIL {path}: {exc}', file=sys.stderr)
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
