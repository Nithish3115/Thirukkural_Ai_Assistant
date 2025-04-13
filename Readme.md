# Thirukkural AI

## Experience the Profound Wisdom of Thirukkural, Reimagined

Thirukkural AI is an innovative application that brings the ancient Tamil wisdom literature to life using modern AI technology. The app helps you find relevant Thirukkural couplets that address your personal questions and life situations, providing both the original verses and AI-generated explanations and advice.

## 📑 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Requirements](#requirements)
- [Installation & Setup](#installation--setup)
- [How It Works](#how-it-works)
- [Use Case](#use-case)
- [How to Run](#how-to-run)
- [Contributors](#contributors)
- [License](#license)

## 📖 Overview
Thirukkural AI uses the power of AI-driven semantic search and natural language processing to help users connect ancient Tamil wisdom with modern life. It combines a vector database with a large language model (LLM) to find and explain Thirukkural couplets based on user queries in Tamil or English.

## ✨ Features
- **Bilingual Support**: Ask questions and receive answers in both Tamil and English.
- **Semantic Search**: Uses advanced vector embeddings to find the most relevant Thirukkural for your query.
- **Personalized Explanations**: AI-generated explanations that connect ancient wisdom to your specific context.
- **Practical Advice**: Receive personalized guidance based on Thirukkural's principles.
- **Rich Context**: Access original text, traditional explanations, and modern interpretations.
- **Clean Frontend**: Built with Next.js for a seamless and modern UI experience.

## 🛠️ Technology Stack
- **Frontend**: Streamlit / Next.js (React Framework)
- **Backend**: Python, Groq API (using LLaMA-3-70B versatile model)
- **Vector Database**: FAISS (Facebook AI Similarity Search)
- **Embeddings**: Sentence Transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **Data Processing**: Pandas, NumPy
- **Deployment**: Vercel / Netlify (optional)

## 📦 Requirements
- Python 3.9+
- Groq API Key
- Internet connection for API calls

## ⚙️ Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/Nithish3115/Thirukkural_Ai_Assistant.git
cd Thirukkural_Ai_Assistant
```

### Set up the Python Backend
Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a .env file and set your Groq API key:
```
GROQ_API_KEY=your_api_key_here
```

Run the backend:
```bash
python app.py
```

### Set up the Next.js Frontend
Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the Next.js development server:
```bash
npm run dev
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 🔍 How It Works

### Vector Database Creation
Generates multilingual vector embeddings for 1330 Thirukkural verses and their explanations using a sentence transformer model.

### Query Processing
Converts the user's question into the same vector space and searches for semantically similar matches.

### Relevance Ranking
Uses the Groq LLM to evaluate and rank potential matches, selecting the most relevant Thirukkural verse.

### Response Generation
The LLM generates AI-powered explanations and advice based on the selected Thirukkural, relating ancient wisdom to your modern query.

## ✨ Use Case
Thirukkural AI is designed to offer instant, AI-generated interpretations and explanations of Thirukkural couplets. Whether you're a student, researcher, or simply an enthusiast, this app helps you explore and appreciate the timeless wisdom of the Thirukkural in an interactive, AI-enhanced format.


## 👥 Contributors
- Your Name — Creator & Developer
- Open to contributions — feel free to fork and submit pull requests!

## 📄 License
This project is licensed under the MIT License.