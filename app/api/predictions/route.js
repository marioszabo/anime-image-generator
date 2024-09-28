import { NextResponse } from "next/server";

// URL for the Hugging Face API endpoint
const HF_API_URL = "https://api-inference.huggingface.co/models/brushpenbob/flux-midjourney-anime";

// Function to query the Hugging Face API with retry mechanism
async function query(data, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // If the response is successful, convert the image to base64
      const result = await response.arrayBuffer();
      const base64 = Buffer.from(result).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    }

    const error = await response.json();
    if (error.error.includes("loading")) {
      // If the model is loading, wait and retry
      console.log(`Model is loading. Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else {
      // If there's a different error, throw it
      throw new Error(error.error || "An error occurred while generating the image");
    }
  }

  // If all retries are exhausted, throw an error
  throw new Error("Model is still loading after multiple retries");
}

export async function POST(request) {
  // Check if the API key is set
  if (!process.env.HUGGINGFACE_API_KEY) {
    return NextResponse.json({ detail: "HUGGINGFACE_API_KEY is not set" }, { status: 500 });
  }

  // Extract the prompt from the request body
  const { prompt } = await request.json();

  try {
    // Generate the image using the Hugging Face API
    const imageUrl = await query({
      inputs: prompt,
    });

    // Return the generated image URL
    return NextResponse.json({ output: [imageUrl] }, { status: 201 });
  } catch (error) {
    // If an error occurs, return it in the response
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}