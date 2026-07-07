export const EXAMPLES = {
  'Agent Workflow (flowchart)': `graph TD
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
    J --> K[👤 Engineer manually Git Commit & Push]:::human`,

  'Sequence diagram': `sequenceDiagram
    participant U as User
    participant B as Browser
    participant S as Server
    U->>B: Click "Share"
    B->>B: deflate + base64url
    B-->>U: URL with #pako: hash
    U->>S: GET /page#pako:...
    Note right of S: hash never leaves<br/>the browser
    S-->>B: static index.html
    B->>B: decode hash, render diagram`,

  'Class diagram': `classDiagram
    class Editor {
      +String code
      +render()
      +export(format)
    }
    class Preview {
      +SVGElement svg
    }
    class ShareCodec {
      +encodeShare(code) String
      +decodeShare(encoded) String
    }
    Editor --> Preview : updates
    Editor --> ShareCodec : uses`,

  'State diagram': `stateDiagram-v2
    [*] --> Editing
    Editing --> Rendering : code change (debounced)
    Rendering --> Preview : parse ok
    Rendering --> Error : parse fail
    Error --> Editing : fix code
    Preview --> Editing
    Preview --> [*] : export SVG/PNG`,

  'Gantt chart': `gantt
    title Project Plan
    dateFormat  YYYY-MM-DD
    section Design
    Wireframes       :a1, 2026-07-01, 5d
    Review           :after a1, 2d
    section Build
    Editor UI        :2026-07-08, 7d
    Share & Export   :3d
    section Ship
    Deploy to Pages  :milestone, 2026-07-18, 0d`,

  'Pie chart': `pie title Token spend by phase
    "Exploration" : 25
    "Implementation" : 45
    "Testing" : 20
    "Docs" : 10`,
}

export const DEFAULT_EXAMPLE = 'Agent Workflow (flowchart)'
