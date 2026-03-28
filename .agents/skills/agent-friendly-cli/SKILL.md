---
name: agent-friendly-cli
description: Build or refactor CLIs that work well for AI agents and humans. Use when asked to create a CLI, improve a command-line tool, redesign command structure, add non-interactive flows, improve --help output, support stdin/flags, add --dry-run or --yes, make commands idempotent, or make CLI errors and outputs more machine-usable.
---

# Agent-Friendly CLI

Use this skill when building a new CLI or upgrading an existing one so it works reliably for both agents and humans.

## Outcome

Produce a CLI that is:

- Non-interactive by default
- Discoverable through scoped `--help`
- Predictable in command naming
- Safe for retries and destructive actions
- Easy to compose in scripts and pipelines
- Explicit in both success output and error output

## Core Rules

### 1. Default to non-interactive execution

Every required input must be passable as a flag, option, config value, env var, or stdin.

Interactive prompts are fallback only. Do not make them the primary path.

Good:

```bash
mycli deploy --env staging --tag v1.2.3
```

Bad:

```bash
mycli deploy
# prompts for env/tag interactively
```

### 2. Make `--help` incremental and useful

Do not dump the full CLI surface area into the first screen unless the framework forces it.

Each subcommand must support `--help`. Each help page should include:

- What the command does
- Required flags
- Optional flags
- Defaults
- A short set of realistic examples

Examples are mandatory because agents pattern-match on them faster than prose.

### 3. Prefer flags and stdin over fragile positional input

Allow structured invocation that works in scripts:

```bash
cat config.json | mycli config import --stdin
mycli deploy --env staging --tag "$(mycli build --output tag-only)"
```

If positional args are used, keep them simple and consistent. Never force a weird ordering that is hard to infer.

### 4. Fail fast with corrective guidance

Missing input should return an error immediately. Never hang waiting for input the caller did not provide.

Error messages should contain the next valid command shape, for example:

```bash
Error: No image tag specified.
  mycli deploy --env staging --tag <image-tag>
  Available tags: mycli build list --output tags
```

### 5. Make operations idempotent

Assume callers will retry.

Running the same command twice should ideally:

- Return success with a no-op message, or
- Return a clearly classified "already applied" result

Do not create duplicates or mutate state twice unless the command is explicitly non-idempotent.

### 6. Add preview mode for destructive actions

For deploy, delete, migrate, apply, prune, reset, or overwrite actions, support `--dry-run`.

`--dry-run` should:

- Show what would happen
- Show targets/resources affected
- Make no changes

### 7. Support confirmation bypass

If the safe human path includes confirmation, support `--yes` or `--force` to bypass it for automation.

Defaults:

- Human default: confirm destructive action
- Agent/script path: pass `--yes` or `--force`

### 8. Keep command structure predictable

Use one command grammar consistently. Prefer a resource-oriented structure such as:

```text
mycli <resource> <verb>
```

Examples:

- `mycli service list`
- `mycli service deploy`
- `mycli config list`
- `mycli config import`

If you choose verb-first instead, keep that pattern everywhere.

### 9. Return machine-usable success output

On success, print concrete fields instead of only celebratory text.

Prefer stable key/value style or structured output:

```text
deployed v1.2.3 to staging
url: https://staging.myapp.com
deploy_id: dep_abc123
duration: 34s
```

When appropriate, support formats like `--output json`, `--output yaml`, or single-purpose outputs such as `--output tag-only`.

## Build Workflow

When asked to create or refactor a CLI, follow this order:

1. Identify the resource model and core verbs.
2. Define a consistent command grammar.
3. Convert required inputs into explicit flags or stdin.
4. Design `--help` for the top-level command and each subcommand.
5. Add examples for all important command paths.
6. Add `--dry-run` and `--yes` / `--force` where state changes occur.
7. Make retry behavior idempotent where possible.
8. Ensure success output is parseable and useful.
9. Ensure failure output is immediate and actionable.

## Minimum Bar For Every Command

Every user-facing command should answer these questions:

- Can it run without an interactive prompt?
- Does `--help` show at least one realistic example?
- Are required inputs explicit?
- Can it participate in shell pipelines?
- Does it fail fast?
- Is the output useful to another program or agent?

If the answer is no for any of these, fix that before considering the CLI complete.

## Implementation Guidance

When writing code for the CLI:

- Prefer libraries/frameworks that make subcommands and per-command help easy to implement
- Keep parsing and execution separate so help, validation, dry-run, and tests stay simple
- Validate inputs before performing side effects
- Separate human-readable output from structured output when both are needed
- Write tests for help output, missing required flags, dry-run behavior, and idempotent retries

## Review Checklist

Use this checklist before finishing:

- No required step depends on an interactive prompt
- Every subcommand supports `--help`
- Every help page includes examples
- Destructive commands support `--dry-run`
- Confirmations can be bypassed with `--yes` or `--force`
- Retrying a successful command does not duplicate work
- Errors tell the caller exactly how to recover
- Success output contains identifiers, locations, or next-step data
