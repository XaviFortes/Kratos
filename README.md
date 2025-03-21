# 🚀 Kratos - Game Server Management Platform

A modern, scalable solution for deploying and managing game servers with ease. Built with Nuxt 3 and cutting-edge technologies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)

## ✨ Features

- 🎮 One-click game server deployment
- 📊 Real-time server monitoring and metrics
- 🔐 Secure authentication and authorization
- 💳 Built-in billing and subscription management
- 🎛️ Advanced configuration options for each game
- 🔄 Automatic scaling and load balancing
- 📱 Responsive dashboard interface

## 🛠️ Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TailwindCSS
- **Backend**: Node.js, Prisma
- **Infrastructure**: Docker, Kubernetes
- **Authentication**: OAuth 2.0 - Auth.js
- **Billing**: Stripe API - More to come
- **Monitoring**: Custom metrics collection

## 🌐 Demo

A live production demo is available at [https://kratoshost.com](https://kratoshost.com).

## 🚀 Getting Started

### Prerequisites

- Node.js (>=16.x)
- PNPM (recommended) or NPM
- Docker (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KratosHost/Kratos.git
cd Kratos
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Provision the database:
```bash
pnpm prisma migrate dev
```

5. Seed the database (optional):
```bash
pnpm prisma db seed
```

6. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Building for Production

```bash
pnpm build
```

To preview the production build:
```bash
pnpm preview
```

To start the production server:
```bash
node .output/server/index.mjs
```
You might need to set the env vars on the production server using `export` or a process manager like PM2.

## 📖 Documentation

For detailed documentation, please visit our [Wiki](https://github.com/KratosHost/Kratos/wiki).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with ❤️ by the Kratos team.

## 📧 Contact

For support or inquiries, please [open an issue](https://github.com/KratosHost/Kratos/issues) or contact our support team at github@kratoshost.com.

## 🚀 Roadmap

- [ ] Multi-region support
- [ ] Game server logs and console access
- [ ] Custom game server images
- [ ] Game server mod support

## 🌟 Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [Become a sponsor](https://github.com/sponsors/XaviFortes)


## 🚀 Issues deploying?

### 1. Prisma Client error?
If you're getting an error related to Prisma Client, try running the following command:
```bash
npx prisma generate
```