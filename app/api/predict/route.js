import { NextResponse } from "next/server";
import { runEcgPrediction } from "../../aiml/predict.js";

export async function POST(req) {
  const { ecg } = await req.json();

  if (!ecg || ecg.length !== 200) {
    return NextResponse.json({ error: "Send exactly 200 values" });
  }

  const result = await runEcgPrediction(ecg);
  return NextResponse.json({ prediction: result }); // 0 or 1
}
