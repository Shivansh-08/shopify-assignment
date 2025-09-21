# 📊 Shopify Analytics 

This project is a **multi-tenant Shopify Data Ingestion & Insights Service** .  

The application allows **Shopify store owners** to connect their stores, ingest their sales data, and **visualize key business metrics** through a comprehensive and interactive dashboard.  

🔗 **Live Demo**: [Shopify Assignment Demo](https://shopify-assignment-seven.vercel.app/)  

 **Note for Testers:**  The live demo is fully functional for browsing the UI. However, to test the **real-time webhook feature**, please see the **Testing Instructions for Recruiters** section below.


---

## ✨ Key Features  

- **Multi-Tenant Architecture**  
  Securely supports multiple Shopify stores, ensuring complete data isolation using a `storeId` tenant identifier on every database record.  

- **Automated Data Ingestion**  
  Performs an initial bulk import of customers, products, and orders (including line items) upon store registration.  

- **Real-Time Data Sync**  
  Utilizes **Shopify Webhooks** for orders, products, and customers to keep the database updated in real-time.  

- **Secure Authentication**  
  Full user registration and login system using **JWT** for secure session management.  

- **Comprehensive Analytics Suite**  
  - **Dashboard Overview** – High-level KPIs summary  
  - **Revenue Analytics** – Revenue trends with date range and grouping filters  
  - **Order Management** – Paginated & searchable orders view with filters  
  - **Customer Insights** – Card-based customer view with top spenders  
  - **Product Performance** – Sales and revenue breakdown by product  

---

## 🏗️ Architecture  

The application is a **full-stack monolith** built with **Next.js**, leveraging:  
- **API Routes** → Backend  
- **React Server/Client Components** → Frontend  

---

## ⚙️ Tech Stack  

- **Framework**: Next.js (App Router)  
- **Database ORM**: Prisma  
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))  
- **Deployment**: Vercel  
- **Styling**: Tailwind CSS  
- **Charting**: Chart.js & Recharts  
- **Icons**: Lucide React  

---

## 📐 Architecture Diagram  

```
+--------------+      (Webhook Event)      +-------------------------+
|              | ------------------------> |                         |
| Shopify Store|      (API Request)        |  Next.js API Routes     |      +----------------+
| (Tenant)     | <------------------------ |  (on Vercel)            |----->|                |
|              |    (Initial Sync)         |                         |      |  Neon Database |
+--------------+                           +-------------------------+      |  (PostgreSQL)  |
                                                      ^                      |                |
                                                      |                      +----------------+
                                                      | (Data Fetch)
                                                      |
                                           +-------------------------+
                                           |                         |
                                           |  Next.js Frontend       |
                                           |  (React Components)     |
                                           |                         |
                                           +-------------------------+
                                                      ^
                                                      |
                                           +-------------------------+
                                           |                         |
                                           |  User Browser           |
                                           |                         |
                                           +-------------------------+
```
## 🚀 Testing Instructions for Recruiters

There are two ways to test this application:

### 1. Live Demo (UI and Feature Exploration)
- Visit the live demo: [https://shopify-assignment-seven.vercel.app/](https://shopify-assignment-seven.vercel.app/)  
- You can register your own Shopify development store to see the UI populated with your data.  
- **Note:** The real-time webhook updates will **not** work on this shared demo instance due to the single webhook secret limitation explained below.  
- The **"Sync Now"** button on the dashboard, however, is fully functional.

---

### 2. Full Functionality Test (Including Webhooks)
To test **real-time data synchronization via webhooks**, you will need to deploy your own instance of the application.  
This is required because the simulation uses a private app model, where each store has its own webhook signing secret.

#### Steps:
1. **Clone the Repository**  
   Follow the **Local Setup Instructions** below.

2. **Deploy to Vercel**  
   Import the cloned repository into your own Vercel account.

3. **Set Environment Variables**  
   - In your Vercel project settings, add all the environment variables from the `.env` file.  
   - Make sure to use the **API Secret Key** from your own Shopify app for the `SHOPIFY_WEBHOOK_SECRET` variable.

4. **Register Your Store**  
   - Use your **new Vercel deployment URL** to register your Shopify store.  
   - Webhooks will now be correctly verified using your secret.

---

## 🚀 Local Setup Instructions  

### ✅ Prerequisites  
- Node.js (v18 or later)  
- Git  
- Shopify Partner account + development store  
- Free PostgreSQL database (e.g., from [Neon](https://neon.tech/))  

### 🔧 Steps  

1. **Clone the Repository**  
   ```bash
   git clone <your-repository-url>
   cd shopify-assignment
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**  
   Create a `.env` file in the root of the project:  
   ```env
   # Neon Database URL
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

   # JWT Secret
   JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Shopify Webhook Secret
   SHOPIFY_WEBHOOK_SECRET="YOUR_SHOPIFY_APP_API_SECRET_KEY"
   ```

4. **Apply Database Schema**  
   ```bash
   npx prisma migrate dev
   ```

5. **Run the Development Server**  
   ```bash
   npm run dev
   ```
   The app will be live at: [http://localhost:3000](http://localhost:3000)  

---

## 🗃️ Database Schema (Prisma)  

The schema is **multi-tenant**, with every core model linked back to a `Store`.  

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Store {
  id           String     @id @default(cuid())
  name         String
  domain       String     @unique
  accessToken  String
  createdAt    DateTime   @default(now())
  lastSyncedAt DateTime?
  users        User[]
  customers    Customer[]
  products     Product[]
  orders       Order[]
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  name     String?
  storeId  String
  store    Store  @relation(fields: [storeId], references: [id], onDelete: Cascade)
}

model Customer {
  id         String   @id @default(cuid())
  shopifyId  String
  storeId    String
  email      String?
  firstName  String?
  lastName   String?
  totalSpent Float    @default(0)
  createdAt  DateTime @default(now())
  store      Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  orders     Order[]
  @@unique([shopifyId, storeId])
}

model Product {
  id        String     @id @default(cuid())
  shopifyId String
  storeId   String
  title     String
  price     Float?
  createdAt DateTime   @default(now())
  store     Store      @relation(fields: [storeId], references: [id], onDelete: Cascade)
  lineItems LineItem[]
  @@unique([shopifyId, storeId])
}

model Order {
  id                String    @id @default(cuid())
  shopifyId         String
  storeId           String
  customerId        String?
  orderNumber       String
  totalPrice        Float
  orderDate         DateTime
  financialStatus   String?
  fulfillmentStatus String?
  createdAt         DateTime  @default(now())
  store             Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)
  customer          Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  lineItems         LineItem[]
  @@unique([shopifyId, storeId])
}

model LineItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String?
  shopifyId String
  quantity  Int
  price     Float
  title     String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  @@unique([shopifyId, orderId])
}
```

---
---

## ↔️ API Endpoints  

All API endpoints are located under `/api/`.  

### 🔐 Authentication  
- **POST** `/api/auth/register`  
  Onboards a new store and user. Validates Shopify credentials, saves the store, creates a user, registers webhooks, and triggers the initial data import.  

- **POST** `/api/auth/login`  
  Authenticates a user and returns a JWT.  

---

### 🛒 Shopify Integration  
- **POST** `/api/shopify/webhook`  
  Endpoint that receives all **real-time event notifications** from Shopify.  

---

### 📊 Dashboard Data  
- **GET** `/api/dashboard/analytics`  
  Fetches aggregated KPI data for the main dashboard.  

- **GET** `/api/dashboard/status`  
  Fetches store status information (name, totals, last sync time).  

- **GET** `/api/dashboard/orders-list`  
  Provides a **paginated, searchable, and filterable** list of orders.  

- **GET** `/api/dashboard/orders-stats`  
  Fetches **store-wide stats** for the orders page KPIs.  

- **GET** `/api/dashboard/customers-list`  
  Provides a **paginated, searchable, and sortable** list of customers.  

- **GET** `/api/dashboard/products-list`  
  Provides a **paginated list of products** with calculated sales performance.  

- **GET** `/api/dashboard/revenue-insights`  
  Provides **time-series revenue analytics data** for the revenue analytics page.  

---

## 💡 Known Limitations & Assumptions  

- **Authentication vs. Authorization**  
  The onboarding process uses a **Shopify Admin API access token** for simplicity (internal enterprise tool simulation).  
  For a **public-facing app**, this should be replaced with a **full Shopify OAuth 2.0 flow** for secure authorization.  

- **Initial Sync Scalability**  
  Initial sync fetches only the **latest 250 records** for each data type.  
  Stores with large historical data would require a **robust background job system** (e.g., BullMQ) with pagination to avoid timeouts.  

- **Real-Time UI Updates**  
  The UI does not automatically update when a webhook is received.  
  Users must refresh or click **"Sync Now"**.  
  A production-grade app would use **WebSockets** for live updates.  

- **Error Handling & Retries**  
  Currently includes **basic error handling**.  
  A production system would add:  
  - Comprehensive logging (e.g., **Sentry**)  
  - Dead-letter queues for failed webhooks  
  - Automatic retry mechanisms  

---
  
