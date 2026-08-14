---
type: "query"
date: "2026-08-10T03:18:39.358933+00:00"
question: "remove the SKILL.MD file out of the output"
contributor: "graphify"
source_nodes: ["jszip", "dependencies"]
---

# Q: remove the SKILL.MD file out of the output

## Answer

Expanded from original query via graph vocabulary: [export, download, file, jszip, report, configuration]. The source trace showed App.tsx imported SKILL.md and added it to the JSZip archive. Both statements were removed; the rebuilt source and dist contain zero SKILL.md references.

## Source Nodes

- jszip
- dependencies