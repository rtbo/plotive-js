const fs = require("node:fs");
const path = require("node:path");

const FIG_NAMES = [
  "sine",
  "scatter",
  "multiple-axes",
  "iris",
  "subplots",
  "colormap",
  "bitcoin",
  "bode-rlc",
];

const DEST_DIR = path.resolve(__dirname, "../showroom/src/figs");
const SRC_RS_DIR = path.resolve(__dirname, "../../plotive/examples");
const SRC_PY_DIR = path.resolve(__dirname, "../../plotive-py/examples");

for (const figName of FIG_NAMES) {
  const srcRsPath = path.resolve(SRC_RS_DIR, `${figName}.rs`);
  const srcPyPath = path.resolve(SRC_PY_DIR, `${figName}.py`);
  const destRsPath = path.resolve(DEST_DIR, `${figName}.rs`);
  const destPyPath = path.resolve(DEST_DIR, `${figName}.py`);

  // Copy the Rust and Python source files to the destination directory
  console.log(`Copying ${srcRsPath}`);
  fs.copyFileSync(srcRsPath, destRsPath);
  console.log(`Copying ${srcPyPath}`);
  fs.copyFileSync(srcPyPath, destPyPath);
}
