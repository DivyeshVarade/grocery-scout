# GroceryScout Backend

## Project Overview
GroceryScout is an event-driven e-grocery platform designed to handle high-concurrency inventory management and AI-powered recipe generation. It leverages a modern microservices-ready architecture to ensure scalability, data consistency, and a seamless user experience.

Key features include:
*   **Event-Driven Architecture:** Uses Apache Kafka to decouple order processing from notifications and analytics.
*   **AI Integration:** Google Gemini integration for parsing natural language recipe requests into structured shopping carts.
*   **Concurrency Control:** Optimistic locking to prevent inventory overselling during high-traffic periods.
*   **Real-time Updates:** WebSocket-like polling for live order status tracking.

## Technical Architecture

### Stack
*   **Java:** 17 (LTS)
*   **Framework:** Spring Boot 3.2+
*   **Database:** PostgreSQL 15
*   **Caching:** Redis 7
*   **Messaging:** Apache Kafka 3.7
# Grocery Scout - Intelligent Grocery Management System

Grocery Scout is a full-stack, AI-powered e-commerce application designed to streamline the journey from recipe discovery to grocery fulfillment. It leverages Google's Gemini AI to convert culinary requests into shoppable cart items, mapping abstract ingredients to real-time inventory stock.

## 🏗 Architecture
The system is built on a microservices-ready monolithic architecture, designed for scalability and maintainability.

- **Backend:** Spring Boot 3 (Java 17)
- **Frontend:** React + Vite (TailwindCSS)
- **Database:** PostgreSQL 15
- **Caching:** Redis 7
- **Event Bus:** Apache Kafka 3.7 (Audit Logging, Inventory Decoupling)
- **AI Integration:** Google Gemini 2.5 Flash

### Core Modules
1.  **AI Chef:** Generates structured recipes from natural language prompts, estimating metric weights (grams) for accurate inventory mapping.
2.  **Inventory Engine:** Real-time stock tracking with optimistic concurrency control.
3.  **Order Fulfillment:** Transactional order placement with asynchronous inventory deduction via Kafka.
4.  **Analytics:** Redis-backed trending scores and daily revenue aggregation.

## 🚀 Quick Start

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **Docker & Docker Compose**

### 1. Infrastructure Setup
Spin up the required external dependencies (PostgreSQL, Redis, Kafka):
```bash
docker-compose up -d
```

### 2. Backend Configuration
The application connects to `localhost` docker services by default (`dev` profile).
You **must** configure your Gemini API Key:

**Option A: Environment Variable (Recommended)**
```bash
# Linux/macOS
export GEMINI_API_KEY=your_key_here

# Windows PowerShell
$env:GEMINI_API_KEY="your_key_here"
```

**Option B: Config File**
Edit `backend/src/main/resources/application-dev.yml`:
```yaml
gemini:
  api:
    key: "AIzaSy..."
```

### 3. Run Application
**Backend:**
```bash
cd backend
./mvnw clean spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The Application will be available at:
- **Web App:** `http://localhost:5173`
- **API:** `http://localhost:8080/api`

## 🐳 Docker Deployment
To build a production-ready container for the backend:

```bash
cd backend
docker build -t grocery-scout-backend .
```

The provided `Dockerfile` uses a multi-stage build (Eclipse Temurin JDK -> JRE) to minimize image size and exclude build tools from runtime.

## 🛠 Feature Flags
**Kafka:** Defaults to `enabled: false` in `application.yml` to simplify local development without Docker. To enable event-driven features (Audit Logs), set `kafka.enabled: true`.

## 📄 API Documentation
_Coming soon: Swagger/OpenAPI spec via `springdoc-openapi`._ **Public Endpoints:** `/api/public/**`
*   **Auth Endpoints:** `/api/auth/**`

*(Swagger UI integration pending)*
