#!/usr/bin/env bash
# Runs the adapter-pattern demo in all three languages, one after another.
# Each language is independent; this script just calls each in turn.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "############  JAVA  ############"
cd "$ROOT/java"
javac -d out src/AdapterPatternDemo.java
java -cp out AdapterPatternDemo

echo
echo "############  PYTHON  ############"
cd "$ROOT/python"
python3 src/adapter_pattern_demo.py

echo
echo "############  TYPESCRIPT  ############"
cd "$ROOT/typescript"
if [ ! -d node_modules ]; then
  npm install --silent
fi
npm run demo --silent
