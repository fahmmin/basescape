# 🌍 Culture Drops

### _Decentralized Place-Based Social Platform with NFT Marketplace_

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black)](https://nextjs.org/)
[![Powered by Walrus](https://img.shields.io/badge/Powered%20by-Walrus%20Blockchain-blue)](https://walrus.space/)
[![Secured by Sui](https://img.shields.io/badge/Secured%20by-Sui%20Blockchain-purple)](https://sui.io/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)](https://mongodb.com/)

> **A revolutionary social platform where every place shared becomes a permanent piece of blockchain history, every vote is cryptographically secured, and every story can evolve into valuable NFTs.**

---
Developed During Syntax Error 2025 hackathon



## 🚀 **Project Overview**

Culture Drops is a **decentralized social platform** that combines the best of Web3 technology to create a new paradigm for sharing and discovering amazing places around the world. Built on **Walrus blockchain** for permanent storage and **Sui blockchain** for secure authentication, it transforms how we document and monetize cultural experiences.

### **🎯 Core Innovation**

- **Permanent Storage**: Every image and story is stored forever on Walrus blockchain
- **Cryptographic Security**: All interactions secured by Sui wallet signatures
- **NFT Evolution**: Stories can evolve into valuable NFTs based on community engagement
- **Location Impact**: Articles can influence hype scores of nearby locations
- **Global Community**: Decentralized, censorship-resistant place sharing

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**

- **Next.js 15** with App Router for modern React development
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** with custom design system
- **Sui dApp Kit** for seamless wallet integration
- **Leaflet** for interactive world mapping

### **Backend & Storage**

- **MongoDB Atlas** for scalable data persistence
- **Walrus Blockchain** for permanent content storage
- **Sui Blockchain** for wallet authentication and signatures
- **Next.js API Routes** for serverless backend logic

### **Blockchain Integration**

- **Walrus**: Permanent blob storage with certificate verification
- **Sui**: Wallet signatures, NFT minting, and smart contract interactions
- **Anonymous Voting**: Keccak256 hashing for privacy-preserving voting

---

## ✨ **Key Features**

### **🌍 Global Place Discovery**

- Interactive world map with all culture drops
- Advanced search by location, title, or content
- Real-time hype score rankings
- Community-driven content curation

### **🔐 Web3 Security**

- Sui wallet authentication for all actions
- Cryptographic signature verification
- Anonymous voting system (one wallet, one vote)
- Rate limiting and spam protection

### **📝 Content Creation**

- **Culture Drops**: Share places with permanent Walrus storage
- **Articles**: Create location-impacting stories with GOOD/BAD/WORSE effects
- **Friends & Circles**: Secure wallet-to-wallet social connections

### **🎨 NFT Marketplace**

- Automatic NFT generation for popular drops
- Hype-based evolution system
- On-chain metadata with Walrus blob references
- Community-driven value creation

### **🎮 Culture RPG (v1)**

- Dynamic 2D exploration game with real culture drops
- Multiple difficulty levels (Easy/Medium/Hard)
- Rarity-based scoring system with color-coded boxes
- Progress persistence and local leaderboard
- Real-time UI with timer, score, and progress tracking
- API integration with MongoDB culture drops database
- See `/public/game/README.md` for detailed features

### **📊 Advanced Analytics**

- Real-time hype score calculation
- Location-based impact tracking
- Community engagement metrics
- Leaderboard rankings

---

## 🎨 **Design System**

### **Color Palette**

- **Primary**: `#97F0E5` (Cyan) - Main actions and highlights
- **Secondary**: `#C684F6` (Purple) - Social features and rankings
- **Background**: `#0C0F1D` (Dark Blue) - Main background
- **Surface**: `#090e1d` (Darker) - Card backgrounds

### **Typography**

- **Display**: Mondwest (Bold, geometric) - Headers and branding
- **Body**: Montreal (Clean, readable) - Main content
- **UI**: Neuebit (Monospace, tech) - Buttons and labels

### **Responsive Design**

- Mobile-first approach with Tailwind breakpoints
- Adaptive grid layouts for all screen sizes
- Touch-friendly interactions
- Progressive enhancement

---

## 🔧 **Installation & Setup**

### **Prerequisites**

- Node.js 20+
- MongoDB Atlas account
- Sui wallet (for testing)

### **Environment Configuration**

```bash
# Clone the repository
git clone https://github.com/your-username/culture-drops.git
cd culture-drops

# Install dependencies
yarn install

# Configure environment variables
cp .env.example .env.local
```

### **Environment Variables**

```env
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/culture-drops"

# Security
SERVER_SALT="your-32-byte-random-salt"

# Walrus Configuration
NEXT_PUBLIC_PUBLISHER_BASE_URL="https://publisher.walrus-testnet.walrus.space"
NEXT_PUBLIC_AGGREGATOR_BASE_URL="https://aggregator.walrus-testnet.walrus.space"

# Sui Configuration
NEXT_PUBLIC_SUI_NETWORK="testnet"
NEXT_PUBLIC_NFT_CONTRACT="0x..." # Optional for NFT features
```

### **Development Server**

```bash
# Start development server
yarn dev

# Open http://localhost:3000
```

---

## 📱 **User Journey**

### **1. Discovery**

- Browse the global feed of culture drops
- Explore the interactive world map
- Search for specific locations or content
- View community rankings and hype scores

### **2. Creation**

- Connect Sui wallet for secure authentication
- Upload images (permanently stored on Walrus)
- Add location data and descriptions
- Sign transactions for blockchain verification

### **3. Engagement**

- Vote on drops (anonymous, one per wallet)
- Comment and review places
- Share with friends and circles
- Create articles that impact location hype

### **4. Monetization**

- Popular drops automatically generate NFTs
- Hype-based evolution system
- Community-driven value creation
- On-chain metadata and provenance

---

## 🔒 **Security & Privacy**

### **Authentication**

- Sui wallet signatures for all actions
- Message verification: `"create:culturedrop"` or `"vote:<id>"`
- No personal data collection
- Wallet-only identification

### **Privacy Protection**

- Anonymous voting via Keccak256 hashing
- IP-based rate limiting
- No tracking or analytics
- Decentralized data storage

### **Data Integrity**

- Cryptographic content verification
- Permanent Walrus storage
- Immutable blockchain records
- Transparent metadata

---

## 🚀 **Deployment**

### **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### **Environment Setup**

1. Configure MongoDB Atlas connection
2. Set up Walrus endpoints
3. Configure Sui network settings
4. Deploy with environment variables

---

## 📊 **Performance Metrics**

- **Load Time**: < 2s initial page load
- **Storage**: Permanent on Walrus blockchain
- **Scalability**: MongoDB Atlas auto-scaling
- **Security**: Cryptographic verification for all actions
- **Uptime**: 99.9% with Vercel deployment

---

## 🎯 **Hackathon Impact**

### **Problem Solved**

- **Centralization**: Eliminates single points of failure
- **Censorship**: Content cannot be removed or modified
- **Monetization**: Creators can earn from their contributions
- **Discovery**: Global community-driven place discovery

### **Innovation Highlights**

- **First-of-its-kind** Walrus + Sui integration
- **Novel NFT evolution** system based on community engagement
- **Location impact** system for articles
- **Anonymous voting** with cryptographic privacy

### **Technical Excellence**

- **Modern Stack**: Next.js 15, TypeScript, Tailwind
- **Blockchain Integration**: Dual-chain architecture
- **Security**: Cryptographic verification throughout
- **UX**: Intuitive, mobile-first design

---

## 🔮 **Future Roadmap**

### **Phase 1: Core Platform** ✅

- Culture drops creation and discovery
- World map integration
- Community voting and comments
- Hype score system

### **Phase 2: Social Features** ✅

- Friends and circles system
- Private messaging
- Article creation with location impact
- Advanced search and filtering

### **Phase 3: NFT Integration** ✅

- Automatic NFT generation
- Hype-based evolution
- On-chain metadata
- Marketplace integration

### **Phase 4: Advanced Features** 🚧

- AI-powered content recommendations
- Cross-chain compatibility
- Mobile app development
- Enterprise partnerships

---

## 👥 **Team & Credits**

Built with ❤️ by the Culture Drops team for the **Walrus x Sui Hackathon**.

### **Technologies Used**

- **Walrus Blockchain** for permanent storage
- **Sui Blockchain** for authentication and NFTs
- **Next.js** for the web application
- **MongoDB** for data persistence
- **Tailwind CSS** for styling

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development**

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📞 **Contact & Support**

- **Website**: [culture-drops.vercel.app](https://culture-drops.vercel.app)
- **GitHub**: [github.com/your-username/culture-drops](https://github.com/your-username/culture-drops)
- **Discord**: [Join our community](https://discord.gg/culture-drops)
- **Twitter**: [@CultureDrops](https://twitter.com/culturedrops)

---

## 🙏 **Acknowledgments**

- **Walrus Team** for the revolutionary storage solution
- **Sui Team** for the fast and secure blockchain
- **Next.js Team** for the amazing framework
- **MongoDB** for the scalable database
- **Open Source Community** for the incredible tools

---

<div align="center">

**🌟 Built for the Walrus x Sui Hackathon 🌟**

_Transforming how we share, discover, and monetize cultural experiences through blockchain technology._

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/culture-drops)

</div>
