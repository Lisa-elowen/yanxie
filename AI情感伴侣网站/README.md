# AI Emotional Companion

A Next.js web application that provides an AI-powered emotional support companion.

## Features

- Chat interface for emotional conversations
- AI responses to user messages
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Type your message in the input field and press Enter or click Send.
- The AI companion will respond with supportive messages.

## Customization

- To integrate with a real AI service (e.g., OpenAI), update the API route in `app/api/chat/route.ts`.
- Add your API key and modify the logic to call the AI service.

## Build

To build for production:
```bash
npm run build
npm start
```

## License

This project is open source.