import { HfInference } from '@huggingface/inference';
import { NextResponse } from "next/server";
import { kv } from '@vercel/kv';

// Create a new Hugging Face Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// URL for the Hugging Face API endpoint
const MODEL_NAME = "brushpenbob/flux-midjourney-anime";

export async function POST(request) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return NextResponse.json({ detail: "HUGGINGFACE_API_KEY is not set" }, { status: 500 });
  }

  try {
    // Extract the prompt from the body of the request
    const { prompt } = await request.json();

    console.log(`Starting request for prompt: ${prompt}`);
    const startTime = Date.now();

    // Use the Hugging Face Inference API to generate the image
    const response = await Hf.textToImage({
      model: MODEL_NAME,
      inputs: prompt,
    });

    const endTime = Date.now();
    console.log(`Hugging Face API responded in ${endTime - startTime}ms`);

    // Convert the image to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
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