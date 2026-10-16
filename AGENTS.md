## Canonical project location

- This project must be opened, inspected, and edited at `E:\Money Tracker For Saving`.
- Before running project commands, verify the working directory resolves to that path. If it does not, switch to the canonical path first. Do not use or modify a similarly named copy under `C:\Users\rovil\OneDrive`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- At the start of every codebase task or question in this project, verify the canonical project location above, then run `graphify query "<question>"` before any grep, search, or source-file read. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output. Read raw files only for lines the graph or an earlier read already located. Put this rule in every subagent prompt that explores code.
- Graphify queries write `graphify-out/cache/last_query_stamp`. In a sandbox that cannot write to `E:\Money Tracker For Saving`, obtain write access for the query command before running it (for example, invoke it with the required elevated permission). Do not run an unprivileged query and mistake a blocked stamp write for an empty result. If the required write access is unavailable, explain the blocker before using another project-inspection method.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
