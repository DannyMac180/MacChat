# MacChat

Enhanced ChatGPT Clone with OpenRouter model fetching fix - now supports all 300+ OpenRouter models!

## 🚀 What's Different from LibreChat

MacChat is a fork of LibreChat with a crucial fix for OpenRouter model fetching:

- ✅ **Fixed OpenRouter Models**: Now shows all 300+ available models instead of just 4 defaults
- ✅ **Dynamic Model Loading**: Models refresh automatically when you add your API key
- ✅ **Better Cache Management**: Proper cache invalidation for user-provided API keys
- ✅ **Enhanced User Experience**: No more limited model selection

## 🛠️ Key Improvements

### OpenRouter Model Fetching Fix
The original LibreChat only showed 4 default OpenRouter models due to a limitation in how user-provided API keys were handled. MacChat fixes this by:

1. **Dynamic Model Fetching**: When users provide OpenRouter API keys, the system now fetches all available models
2. **Cache Invalidation**: Both backend and frontend caches are properly cleared when API keys are updated
3. **User Experience**: Users can now access the full range of OpenRouter's 300+ models

### Technical Changes
- Enhanced `loadConfigModels.js` to handle user-provided API keys for model fetching
- Added cache invalidation to key update endpoints
- Updated React Query mutations to refresh models when API keys change
- Improved error handling and fallback mechanisms

## 🎯 Features

All the powerful features of LibreChat, plus:

- **OpenAI GPT-4 Vision** 👁️
- **Anthropic Claude** 🤖
- **Google Gemini** ✨ 
- **OpenRouter** (300+ models!) 🌐
- **Bing & Sydney** 🔍
- **ChatGPT Plugins** 🔌
- **Assistants API** 🤝
- **DALL-E-3** 🎨
- **Multi-Modal Chat** 📷
- **Custom Endpoints** ⚙️
- **Presets & Search** 📋
- **Secure Multi-User** 👥

## 🏃‍♂️ Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MacChat.git
   cd MacChat
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access MacChat**
   Open http://localhost:3080

### Using Podman

```bash
# Build and start
podman-compose build
podman-compose up -d

# Manage containers
podman-compose down
podman restart MacChat
```

## 🔧 Configuration

### OpenRouter Setup
1. Get your API key from [OpenRouter](https://openrouter.ai/)
2. In MacChat settings, click the key icon next to OpenRouter
3. Enter your API key and save
4. Refresh the page and you'll see all 300+ models available!

### Environment Variables
Key variables in your `.env` file:
```bash
# Database
MONGO_URI=mongodb://localhost:27017/MacChat

# Optional: Set OpenRouter key server-wide
# OPENROUTER_API_KEY=your_key_here

# Security
CREDS_KEY=your_32_character_key
CREDS_IV=your_16_character_iv
JWT_SECRET=your_jwt_secret
```

## 📖 Documentation

For detailed documentation, see the original [LibreChat docs](https://docs.librechat.ai/) - all features work the same way, with the added benefit of full OpenRouter model support.

## 🤝 Contributing

Contributions are welcome! This project maintains compatibility with LibreChat while adding essential fixes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the [LibreChat](https://github.com/danny-avila/LibreChat) team for the excellent foundation
- [OpenRouter](https://openrouter.ai/) for providing access to 300+ AI models
- All contributors who help improve AI accessibility

---

**Made with ❤️ for better AI model access**
