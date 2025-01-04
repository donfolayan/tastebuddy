# TasteBuddy 🍳

TasteBuddy is an intelligent recipe recommendation application that helps you discover recipes based on your mood, available ingredients, and preferences. It features AI-powered recipe suggestions and integrated cooking tutorials from YouTube.

## Features 🌟

- 🧠 AI-powered recipe recommendations based on mood and preferences
- 🥘 "What's in Your Kitchen?" feature to find recipes using available ingredients
- 🎥 Integrated cooking tutorials from YouTube
- 👤 User authentication and profile management
- 📱 Responsive design for all devices
- 🌙 Dark mode interface

## Tech Stack 💻

### Frontend
- React with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests

### Backend (Developed by [@Purpose-Longe](https://github.com/Purpose-Longe))
- Node.js & Express.js
- PostgreSQL database
- JWT authentication
- Google's Gemini AI API
- YouTube Data API

## Prerequisites 📋

Before you begin, ensure you have:
- Node.js (v14 or higher)
- PostgreSQL database
- API keys for:
  - Google Gemini AI
  - YouTube Data API

## Setup Instructions 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tastebuddy.git
   cd tastebuddy
   ```

2. **Set up environment variables**
   
   Create `.env` files in both frontend and backend directories using the provided templates:

   Backend (.env):
   ```
   PORT=3000
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=your_db_name
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

   Frontend (.env):
   ```
   VITE_API_URL=http://localhost:3000
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Initialize the database**
   ```bash
   cd backend
   npm run init-db
   ```

5. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Documentation 📚

### Authentication Endpoints
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)

### Recipe Endpoints
- GET `/api/recipes` - Get all recipes
- POST `/api/recipes/recommendations` - Get mood-based recommendations
- GET `/api/recipes/:id` - Get single recipe
- POST `/api/recipes/by-ingredients` - Get recipes by ingredients

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Credits 👏

- Backend Development: [@Purpose-Longe](https://github.com/Purpose-Longe)
- Frontend Design & Development: [Your Name]

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 