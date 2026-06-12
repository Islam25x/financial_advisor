# Finexa

AI-powered personal finance management platform built with React, TypeScript, React Query, and modern frontend architecture.

---

# Overview

Finexa is a production-oriented financial advisor application focused on:

* Transaction management
* AI-powered financial flows
* Voice-to-transaction workflows
* OCR receipt parsing
* Dashboard analytics
* Savings goals
* Financial insights
* Clean scalable frontend architecture

The project is designed with strong separation of concerns, centralized infrastructure, reusable UI systems, and domain-oriented feature modules.

---

# Features

## Financial Dashboard

* Available balance tracking
* Income & expense summaries
* Savings overview
* Money flow charts
* Financial analytics
* Dynamic dashboard refresh via centralized React Query invalidation

---

## Transactions System

* Add / update / delete transactions
* Transaction filters
* Categories system
* Insights & summaries
* Optimistic UI-safe mutation flows
* Shared transaction invalidation architecture

---

## AI Features

### AI Chat Assistant

* Financial assistant chatbot
* Transaction-aware responses
* AI-powered interaction layer

### Voice Transactions

Users can:

1. Record voice input
2. Convert speech to text
3. Review/edit transcript
4. Create transactions directly from speech

Example:

```text
I received 5000 pounds from freelance work and bought coffee for 200 pounds.
```

---

### Receipt OCR

* Upload receipts
* Extract merchant and items
* Parse purchase data
* Convert receipts into transactions

---

## Goals System

* Savings goals
* Goal contribution flows
* Refund/cancel support
* Goal history
* Dashboard integration

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* TanStack React Query
* Zod

---

## Architecture

* Feature-driven architecture
* Domain-oriented modules
* Centralized query invalidation
* Shared infrastructure layer
* Typed API contracts
* Scalable React Query topology

---

# Project Structure

```text
src/
├── assets/
├── components/
│
├── features/
│   ├── ai/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── auth/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   ├── charts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── goals/
│   │   ├── api/
│   │   ├── charts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── transactions/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── user/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── infrastructure/
│   ├── api/
│   ├── auth/
│   ├── query/
│   │   ├── invalidation/
│   │   └── query-keys.ts
│   └── layouts/
│
├── routes/
├── pages/
├── shared/
│   ├── ui/
│   ├── animations/
│   ├── theme/
│   └── utils/
│
└── lib/
```

---

# Architecture Philosophy

## Feature-Based Structure

Each domain owns:

* API layer
* hooks
* types
* utilities
* components

This keeps the application scalable and maintainable.

---

## Infrastructure Layer

Shared infrastructure handles:

* HTTP client
* authentication session handling
* query invalidation
* API configuration
* shared layouts

---

## Centralized Query Invalidation

The project uses centralized domain invalidation instead of scattered cache updates.

Example:

```ts
invalidateTransactionDomainQueries(queryClient)
```

This ensures:

* dashboard refresh consistency
* reduced duplication
* predictable cache behavior
* scalable side-effect management

---

# Timezone Handling

Backend stores UTC timestamps.

Frontend:

* preserves raw backend timestamps
* converts only at presentation layer
* centralizes Cairo formatting inside shared date utilities

This prevents:

* double timezone shifts
* DST issues
* inconsistent dashboard grouping

---

# AI Voice Flow

```text
Record Voice
    ↓
Speech To Text API
    ↓
Editable Transcript
    ↓
Create Transactions From Speech
    ↓
React Query Invalidation
    ↓
Dashboard + Transactions Refresh
```

---

# Running The Project

## Install dependencies

```bash
npm install
```

---

## Start development server

```bash
npm run dev
```

---

## Build project

```bash
npm run build
```

---

# Design Goals

* Production-grade architecture
* Reusable UI systems
* Strong type safety
* Minimal duplication
* Clean separation of concerns
* Domain-oriented state management
* Scalable React Query infrastructure
* Modern financial UX

---

# Future Improvements

* Real-time notifications
* Smart financial insights
* AI budgeting assistant
* Spending prediction engine
* Export reports
* Advanced analytics
* Multi-currency support
* Mobile optimization improvements

---

# Screenshots

Add your screenshots here.

Example:

```md
![Dashboard](./screenshots/dashboard.png)
```
