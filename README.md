# Contextual AI RAG Agent Template

A [Next.js](https://nextjs.org/) template for building and deploying a Retrieval-Augmented Generation (RAG) agent powered by [Contextual AI](https://contextual.ai/). This template demonstrates how to connect your app to a Contextual AI agent, send chat messages, and display retrieval attributions in the UI.

## Features

- Chat UI for interacting with a Contextual AI agent
- Retrieval-augmented responses with attribution display
- Modern, animated UI with [Framer Motion](https://www.framer.com/motion/)
- Built with [Next.js](https://nextjs.org/) and [Vercel AI SDK](https://sdk.vercel.ai/)

## Getting Started

To get the project up and running locally:

1. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```

3. **Add your Contextual AI credentials to the `.env` file:**

   ```
   CONTEXTUAL_API_TOKEN=your_contextual_api_token_here
   NEXT_PUBLIC_CONTEXTUAL_AGENT_ID=your_agent_id_here
   ```

   - `CONTEXTUAL_API_TOKEN`: Your Contextual AI API token (keep this secret!)
   - `NEXT_PUBLIC_CONTEXTUAL_AGENT_ID`: The Agent ID for your Contextual AI agent (can be shared with frontend)

4. **Start the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

Your project should now be running on [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

You can deploy this template to Vercel. Make sure to add the same environment variables (`CONTEXTUAL_API_TOKEN` and `NEXT_PUBLIC_CONTEXTUAL_AGENT_ID`) in your Vercel project settings under **Environment Variables**.
 
---

## Acknowledgments

This project is based on the [vercel-labs/ai-sdk-preview-rag](https://github.com/vercel-labs/ai-sdk-preview-rag) template.

---

## License

MIT
