import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_ENDPOINT,
    ASTRA_DB_TOKEN,
    OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_TOKEN);
const db = client.db(ASTRA_DB_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const latestMessage = messages?.[messages.length - 1]?.content || "";

        if (!latestMessage) {
            throw new Error("No messages found in the request.");
        }

        let docContent = "";

        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: latestMessage,
            encoding_format: "float",
        });

        const embedding = embeddingResponse?.data?.[0]?.embedding;

        if (!embedding) {
            throw new Error("Failed to create embedding.");
        }

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION);
            const documents = await collection
                .find(null, {
                    sort: {
                        $vector: embedding,
                    },
                    limit: 10,
                })
                .toArray();

            const docsMap = documents?.map((ele) => ele.text);
            docContent = JSON.stringify(docsMap);
        } catch (dbError) {
            console.error("Database query error:", dbError);
            docContent = "";
        }

        const template = {
            role: "system",
            content: `
                You are an AI assistant who knows everything about Cricket. Use the below context to augment what you know about cricket. The context will provide you with the most recent page data from Wikipedia and other sources. If the context doesn't include the information you need, answer "Sorry i couldn't find any information". Format responses using markdown where applicable, and don't return images.
                -------------------
                START CONTEXT
                ${docContent}
                END CONTEXT
                -------------------
                QUESTION: ${latestMessage}
                -------------------
            `,
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            stream: true,
            messages: [template, ...messages],
        });

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error("Error in POST handler:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}