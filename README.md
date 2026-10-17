# Adapter pattern — one example in three languages

The same payment-checkout example (a client that pays through two
incompatible vendor SDKs via adapters) implemented in **core Java**,
**core Python**, and **core TypeScript**.

Each language lives in its own folder and runs on its own. Nothing is
shared between them — this is a *polyglot* project, just three independent
mini-projects that happen to sit under one roof.

```
adapter-pattern/
├── README.md
├── run.sh                  # convenience: runs all three in a row
├── java/
│   └── src/AdapterPatternDemo.java
├── python/
│   └── src/adapter_pattern_demo.py
└── typescript/
    ├── package.json
    ├── tsconfig.json
    └── src/adapter-pattern-demo.ts
```

## Prerequisites

| Language   | Needs                         |
|------------|-------------------------------|
| Java       | JDK 17 or newer (`java`, `javac`) |
| Python     | Python 3.9 or newer (`python3`)   |
| TypeScript | Node.js 18+ and npm (`node`, `npm`) |

## Run each one separately

### Java
```bash
cd java
javac -d out src/AdapterPatternDemo.java
java -cp out AdapterPatternDemo
```

### Python
```bash
cd python
python3 src/adapter_pattern_demo.py
```

### TypeScript
```bash
cd typescript
npm install     # first time only, installs the TypeScript compiler
npm run demo    # compiles to dist/ then runs it
```

## Run all three at once

```bash
./run.sh
```

All three print the same output, which is the point — the same design
pattern, three languages.
