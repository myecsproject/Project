import { spawn } from "child_process";
import path from "path";

export async function runEcgPrediction(ecgArray) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "app", "aiml", "predict_direct.py");

    const py = spawn("python", [scriptPath]);

    let result = "";

    py.stdout.on("data", (data) => (result += data.toString()));
    py.stderr.on("data", (data) => console.error("PYTHON ERROR:", data.toString()));

    py.on("close", () => resolve(parseInt(result.trim())));

    py.stdin.write(JSON.stringify({ ecg: ecgArray }));
    py.stdin.end();
  });
}
