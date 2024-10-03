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

    console.log(`Starting request for prompt: ${prompt}`);
    const startTime = Date.now();

    // Use the Hugging Face Inference API to generate the image
    const response = await Hf.textToImage({
      model: MODEL_NAME,
      inputs: prompt,
    });

    const endTime = Date.now();
    console.log(`Hugging Face API responded in ${endTime - startTime}ms`);

    // Log the type and content of the response
    console.log('Response type:', typeof response);
    console.log('Response instanceof Blob:', response instanceof Blob);
    console.log('Response content:', response);

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

    // Increment the total images generated count
    await kv.incr('total_images_generated');

    // Return the generated image URL
    return NextResponse.json({ output: [dataUrl] }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/predictions:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

// New GET route to fetch the total images generated
export async function GET() {
  try {
    const totalImages = await kv.get('total_images_generated') || 0;
    return NextResponse.json({ totalImages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching total images:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}