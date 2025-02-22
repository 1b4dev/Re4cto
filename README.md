# Re4cto - React Chat Client 💬

React.js + Vite + TypeScript + React Bootstrap = Re4cto

## What is Re4cto?

Re4cto is React based chat client with the combination of four popular development technologies; React, Vite, TypeScript, Bootstrap. 

Re4cto features:
 - Uses functional programming as recommended by the current React documentation.
 - Uses custom fetch hook with error provider for fetch requests so fetch errors handled with simple bootstrap toast element.
 - Authentication for fetch hooks is based on Bearer token stored in the browser's local storage but can be converted to cookie based.
 - Uses short polling mechanism to retrieve messages so it can even work shared hosting plans.
 - Includes a Dockerfile to build for SaaS platforms.

 Build demo is available on:
 https://re4cto.onrender.com

 username:react (or) docker
 password:react (or) reacton12

 ⚠️ **Important Note: This app does not contains backend, so you need to connect or create and connect a backend to use Re4cto.**

## Getting Started 🚀

### Prerequisites

- Node.js (v20+ recommended)
- npm/yarn
- Docker (optional for containerization)

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/1b4dev/Re4cto.git

    cd Re4cto
    ```

2. **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up environment variables**

    You can simply edit .env file to connect your backend. If you don't have backend, you can use the currently connected backend for testing and development purposes. Please don't forget the edit fetch links on api request according to your backend.
    ``` bash
    # Edit .env file to point to your backend API
    VITE_API_URL=https://reactonapi.onrender.com/api/
    ```

4. **Run the app**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
### Configuration ⚙️

To connect your own backend:
1. Update VITE_API_URL in .env
2. Modify API endpoints
3. Adjust authentication method in .env
    ``` bash
    src/page/components/hooks/useApi.tsx # Switch between token/cookie auth basically supported in API calls. You also need to adjust Login.tsx and other token releated files if you want to use cookie method.
    ``` 
### Build & Deployment 🛠️

    # Create production build
        npm run build

    # Deploy
        npm run deploy

    # Docker build
        docker build -t re4cto .

## Contribution

Contributions are welcome! Please follow these steps:

 - Fork the repository

 - Create your feature branch 
    ``` bash
    git checkout -b feature/new
    ```
 - Commit your changes 
    ``` bash
    git commit -m 'Commit new feature'
    ```
 - Push to the branch 
    ``` bash
    git push origin feature/new
    ```
 - Open a Pull Request

 ## License 📄

 Apache 2.0 Licence - See the [LICENSE](https://github.com/1b4dev/Re4cto/blob/main/LICENSE) file for details