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

  // Generate a unique ID for this request
  const requestId = Date.now().toString();

  console.log(`Starting request for prompt: ${prompt}`);
  const startTime = Date.now();

  // Start the image generation process without waiting for it to complete
  fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  }).then(async (response) => {
    const endTime = Date.now();
    console.log(`Hugging Face API responded in ${endTime - startTime}ms`);

    if (response.ok) {
      const result = await response.arrayBuffer();
      const base64 = Buffer.from(result).toString('base64');
      // Store the result somewhere (e.g., a database or cache)
      // For this example, we'll use global variable (not recommended for production)
      global.results = global.results || {};
      global.results[requestId] = { status: 'completed', data: `data:image/jpeg;base64,${base64}` };
    } else {
      const error = await response.json();
      console.error(`Error from Hugging Face API: ${JSON.stringify(error)}`);
      global.results = global.results || {};
      global.results[requestId] = { status: 'error', error: error.error };
    }
  }).catch((error) => {
    console.error(`Fetch error: ${error.message}`);
    global.results = global.results || {};
    global.results[requestId] = { status: 'error', error: error.message };
  });

  // Immediately return a response with the request ID
  return NextResponse.json({ requestId }, { status: 202 });
}

// Add a new route to check the status of a request
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json({ detail: "No requestId provided" }, { status: 400 });
  }

  const result = global.results && global.results[requestId];

  if (!result) {
    console.log(`No result found for requestId: ${requestId}`);
    return NextResponse.json({ status: 'processing', message: 'Request is still processing' }, { status: 202 });
  }

  console.log(`Result for requestId ${requestId}: ${JSON.stringify(result)}`);

  if (result.status === 'completed') {
    return NextResponse.json({ status: 'completed', output: [result.data] }, { status: 200 });
  }

  if (result.status === 'error') {
    return NextResponse.json({ status: 'error', detail: result.error }, { status: 500 });
  }

  return NextResponse.json({ status: 'processing' }, { status: 202 });
}