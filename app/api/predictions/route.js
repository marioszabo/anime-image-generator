import { HfInference } from '@huggingface/inference';
import { NextResponse } from "next/server";
import { kv } from '@vercel/kv';

// Create a new Hugging Face Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// URL for the Hugging Face API endpoint
const MODEL_NAME = "brushpenbob/flux-midjourney-anime";
const TRIGGER_WORD = "egmid";

export async function POST(request) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return NextResponse.json({ detail: "HUGGINGFACE_API_KEY is not set" }, { status: 500 });
  }

  try {
    let { prompt } = await request.json();
    
    // Prepend the trigger word if it's not already there
    if (!prompt.toLowerCase().startsWith(TRIGGER_WORD.toLowerCase())) {
      prompt = `${TRIGGER_WORD}, ${prompt}`;
    }

    const jobId = Date.now().toString();
    await kv.set(`job:${jobId}`, { status: 'pending', prompt });

    // Start the generation process in the background
    generateImage(jobId, prompt);

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (error) {
    console.error("Error in POST /api/predictions:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

async function generateImage(jobId, prompt) {
  try {
    console.log(`Starting request for prompt: ${prompt}`);
    const startTime = Date.now();

    const response = await Hf.textToImage({
      model: MODEL_NAME,
      inputs: prompt,
    });

    const endTime = Date.now();
    console.log(`Hugging Face API responded in ${endTime - startTime}ms`);

    let base64Image;
    if (response instanceof ArrayBuffer) {
      base64Image = Buffer.from(response).toString('base64');
    } else if (response instanceof Blob) {
      const arrayBuffer = await response.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString('base64');
    } else {
      throw new Error(`Unexpected response type: ${typeof response}`);
    }

    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    await kv.set(`job:${jobId}`, { status: 'completed', output: dataUrl });
    await kv.incr('total_images_generated');
  } catch (error) {
    console.error("Error in generateImage:", error);
    await kv.set(`job:${jobId}`, { status: 'failed', error: error.message });
  }
}

// New GET route to fetch the total images generated
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const job = await kv.get(`job:${jobId}`);

    if (!job) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } else {
    // If no jobId is provided, return the total images generated
    const totalImages = await kv.get('total_images_generated') || 0;
    return NextResponse.json({ totalImages });
  }
}
