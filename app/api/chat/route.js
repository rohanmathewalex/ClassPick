import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import fetch from 'node-fetch'; // Add this at the top of your server-side code

// Define the system prompt
const systemPrompt = `
You are an AI assistant specializing in helping students find professors based on their specific needs and preferences. Your knowledge comes from a vast database of professor reviews and ratings, which you can access through a retrieval system.

For each user query, you will:
1. Analyze the student's question or requirements.
2. Use RAG (Retrieval-Augmented Generation) to find the top 3 most relevant professors from the database.
3. Present these professors to the student with a brief summary of why each is a good match.
4. Offer to provide more details or answer follow-up questions about any of the suggested professors.

When presenting professors, include the following information for each:
- Professor's name
- Department/Subject
- Overall rating (out of 5 stars)
- A brief snippet from a positive review
- One key strength of the professor

If the student's query is vague, ask clarifying questions to better understand their needs. These might include:
- The specific subject or course they're interested in
- Their preferred teaching style (e.g., lecture-heavy, discussion-based, hands-on)
- Any particular qualities they're looking for in a professor (e.g., clear explanations, fair grading, engaging lectures)

Remember to maintain a friendly, helpful tone, and encourage students to ask for more information if needed. If a student asks about a specific professor not in the top 3, offer to provide information about that professor as well.

Your goal is to help students make informed decisions about their course selections by matching them with professors who best fit their academic needs and learning styles.
`;

// Main function to handle POST requests
export async function POST(req) {
    const data = await req.json();

    // Define your namespace here (replace 'ns1' with your actual namespace)
    const namespace = "ns1";

    // Initialize Pinecone client
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    // Reference Pinecone index
    const index = pc.index('rag').namespace(namespace);

    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Extract the user's input text
    const text = data[data.length - 1].content;

    // Create the embedding for the user's query using OpenAI's embeddings API
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',  // Use the correct model name
        input: text,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Query Pinecone for the top 3 most relevant professors
    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding,
    });

    // Format the results from Pinecone
    let resultString = '\n\nReturned results from vector db (done automatically):';
    results.matches.forEach((match) => {
        resultString += `
        Professor: ${match.id}
        Review: ${match.metadata.review}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}\n\n`;
    });

    // Prepare the message to send to OpenAI for completion
    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;
    const conversation = [
        { role: 'system', content: systemPrompt },
        ...data.slice(0, data.length - 1),  // Previous conversation history
        { role: 'user', content: lastMessageContent },
    ];

    // Generate a response from the OpenAI model
    const completion = await openai.chat.completions.create({
        model: 'gpt-4',  // Use the correct model name
        messages: conversation,
        stream: true,
    });

    // Stream the response back to the client
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        },
    });

    // Return the stream as the response
    return new NextResponse(stream);
}
