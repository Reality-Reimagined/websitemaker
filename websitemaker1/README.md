# Groq Bolt Web Application

A powerful web-based interface for generating websites using the Qwen 2.5 Coder model via Groq's API.

## Features

- **User-friendly Interface**: Intuitive form for specifying website requirements
- **Advanced Customization**: Edit the AI prompt template for better results
- **Real-time Preview**: See your generated website instantly
- **Code Editing**: Modify generated code directly in the browser
- **File Management**: Edit individual HTML, CSS, and JavaScript files
- **Export Functionality**: Download your website as a ZIP file
- **Responsive Design**: Works on desktop and mobile devices
- **Animations**: Smooth transitions and interactive elements

## Prerequisites

- Node.js 18.x or higher
- A Groq API key (sign up at [groq.com](https://console.groq.com))

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd groq-bolt-application
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```

4. Add your Groq API key to the `.env` file:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

## Usage

1. Start the backend API server:
   ```
   npm run start:api
   ```

2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

4. Fill out the form with your website specifications and click "Generate Website"

5. Use the tabs to preview, edit code, and manage files

6. Download your completed website as a ZIP file

## Advanced Usage

### Customizing the Prompt Template

The application allows you to customize the prompt template used to generate websites. This can be useful for:

- Specifying particular design styles
- Requesting specific frameworks or libraries
- Adding detailed instructions for the AI

To customize the prompt template:

1. Click "Show Advanced Options" on the form
2. Edit the prompt template in the editor
3. Check "Use custom prompt instead of template" to use your custom prompt

### Editing Generated Code

After generating a website, you can:

1. Edit the full markdown response in the "Code" tab
2. Edit individual files (HTML, CSS, JavaScript) in the "Files" tab
3. See changes reflected in real-time in the "Preview" tab

## Development

- Frontend: React with TypeScript, Tailwind CSS, and Framer Motion
- Backend: Express.js server that communicates with the Groq API
- API: RESTful endpoints for generating website code

## Project Structure

- `src/components/`: React components for the UI
- `src/server/`: Express.js backend server
- `src/lib/`: Shared utilities and the Groq client

## License

MIT