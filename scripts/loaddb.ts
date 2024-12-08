import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import puppeteer from "puppeteer";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_ENDPOINT,
    ASTRA_DB_TOKEN,
    OPENAI_API_KEY,
} = process.env;

const scrapePage = async (url: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const content = await page.evaluate(() => document.body.innerText);
    await browser.close();

    return content;
};

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const dbClient = new DataAPIClient(ASTRA_DB_TOKEN);
const connectDb = dbClient.db(ASTRA_DB_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const cricketNewsUrls = [
"https://www.espncricinfo.com/cricket-news"
];


const createCollection = async (similarity: SimilarityMetric = "dot_product") => {
    const validMetrics: SimilarityMetric[] = ["dot_product", "cosine", "euclidean"];
    if (!validMetrics.includes(similarity)) {
        throw new Error(
            `Invalid similarity metric: ${similarity}. Supported metrics are ${validMetrics.join(", ")}.`
        );
    }

    try {
        const res = await connectDb.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarity,
            },
        });
        console.log("Collection created successfully:", res);
    } catch (error) {
        console.error("Error creating collection:", error);
    }
};

const loadSampleData = async () => {
    try {
        const collection = await connectDb.collection(ASTRA_DB_COLLECTION);
        for (const url of cricketNewsUrls) {
            const content = await scrapePage(url);
            const chunks = await splitter.splitText(content); // Await here to resolve the Promise

            for (const chunk of chunks) {
                const embedding = await openai.embeddings.create({
                    model: "text-embedding-ada-002",
                    input: chunk,
                });

                const vector = embedding.data[0].embedding;
                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk,
                });
                console.log("Inserted chunk:", res);
            }
        }
    } catch (error) {
        console.error("Error loading sample data:", error);
    }
};


(async () => {
    // await createCollection();
    await loadSampleData();
})();
