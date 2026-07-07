// Canonical test diagram: contains unicode emoji, classDef styling and
// multi-line structure — exercises UTF-8 handling in the share codec.
export const AGENT_WORKFLOW_DIAGRAM = `graph TD
    classDef human fill:#f9d0c4,stroke:#333,stroke-width:2px;
    classDef agent fill:#d4e6f1,stroke:#333,stroke-width:2px;
    classDef hitl fill:#ffe6cc,stroke:#ff5733,stroke-width:3px,stroke-dasharray: 5 5;

    A[👤 Engineer inputs natural language prompt]:::human -->|Plan Mode| B(🤖 Agent reads local code + JSON keywords):::agent
    B --> C{🤖 Agent generates Plan locally}:::agent
    C -->|Approval| D[👤 Engineer confirms Plan]:::human
    D --> E[🤖 Agent generates or modifies .robot file]:::agent
    E --> F[🤖 Agent executes local test: robot test.robot]:::agent
    F --> G{Test passed Green?}:::agent
    G -->|Fail| H[🤖 Agent reads Log and self-corrects]:::agent
    H -->|Re-run| F
    G -->|Pass| I[🛡️ ★ Critical HITL Guardrail ★]:::hitl
    I --> J[👤 Engineer visually reviews logic and locators]:::human
    J --> K[👤 Engineer manually Git Commit & Push]:::human`
