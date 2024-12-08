# Project Setup and Documentation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Prerequisites

Before getting started, make sure you have the following environment variables configured for your project:

- **ASTRA_DB_NAMESPACE**: Your DataStax Astra DB namespace.
- **ASTRA_DB_COLLECTION**: The collection name in your Astra DB.
- **ASTRA_DB_ENDPOINT**: The endpoint URL for your Astra DB.
- **ASTRA_DB_TOKEN**: Your DataStax Astra DB token for authentication.
- **OPENAI_API_KEY**: Your OpenAI API key for embeddings and answer generation.

These environment variables are required to interact with Astra DB for vector storage and OpenAI's models for embedding and answering queries.

### Example `.env` file:

```bash
ASTRA_DB_NAMESPACE=your_namespace
ASTRA_DB_COLLECTION=your_collection
ASTRA_DB_ENDPOINT=your_endpoint
ASTRA_DB_TOKEN=your_token
OPENAI_API_KEY=your_openai_api_key

Getting Started :

First, run the development server:

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

Open http://localhost:3000 with your browser to see the result.