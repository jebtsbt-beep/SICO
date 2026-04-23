# SICO: Sistema de Contabilidad y Operaciones
## Business Process Systematization Engine

### 🌐 Project Vision / Visión del Proyecto
**EN:** SICO is a modular administrative framework designed to transform manual business procedures into systematic digital workflows. Beyond simple accounting, it provides a robust infrastructure for multi-tenant operational control, material traceability, and financial auditing.
**ES:** SICO es un marco administrativo modular diseñado para transformar procedimientos de negocio manuales en flujos de trabajo digitales sistemáticos. Más allá de una contabilidad simple, provee una infraestructura robusta para el control operativo multitenant, trazabilidad de materiales y auditoría financiera.

---

### 🚀 Strategic Pillars / Pilares Estratégicos

* **Business Systematization:** Standardizing how companies manage resources through a unified "Mother Table" architecture.
    *(Sistematización de Negocios: Estandarización de la gestión de recursos mediante una arquitectura de "Tabla Madre").*
* **Intelligent Ledger (FIFO):** A core accounting engine that automates stock valuation and consumption based on entry seniority.
    *(Libro Mayor Inteligente (FIFO): Motor contable que automatiza la valorización y consumo de existencias según antigüedad).*
* **Cross-Unit Scalability:** Engineered to handle diverse business units (Food, Retail, Services) using a generic measurement conversion layer.
    *(Escalabilidad Transversal: Diseñado para manejar diversas unidades de negocio mediante una capa genérica de conversión de medidas).*
* **Operational Integrity:** Atomic tracking of every transaction to ensure the balance between physical inventory and financial records.
    *(Integridad Operativa: Seguimiento atómico de cada transacción para asegurar el equilibrio entre el inventario físico y los registros financieros).*

---

### 📁 Functional Modules / Módulos Funcionales

1.  **Supplies (The Warehouse Core):** Systematic control of raw assets, origin tracking, and stock-by-provider logic.
    *(Suministros: Control sistemático de activos brutos, rastreo de origen y existencias por proveedor).*
2.  **Products (The Output Engine):** Management of Bill of Materials (BOM) and finished goods ready for commercialization.
    *(Productos: Gestión de listas de materiales (BOM) y artículos terminados para comercialización).*
3.  **Providers (The Supply Chain):** Administrative bridge between external logistics and internal standardization.
    *(Proveedores: Puente administrativo entre la logística externa y la estandarización interna).*

---

### 🛠 Technical Architecture / Arquitectura Técnica
* **Core:** Node.js + SQLite3 (Atomic Transactions).
* **UI:** React.js (Component-Based Administration).
* **State:** Modular Stores (Zustand) for real-time operational feedback.

---
*SICO Framework - Version 1.0 (2026)*



## ESTRUCTURE


/inventory-pro-saas (Carpeta Raíz)
├── /backend
│   ├── /src
│   │   ├── /config             # DB connection, Global Constants, Environmental Vars
│   │   │   ├── database.js     # SQLite connection logic
│   │   │   └── constants.js    # Movement types (SALE, ENTRY), Base Units
│   │   ├── /models             # Generic Data Access Layer (QueryBuilder)
│   │   │   └── queryBuilder.js  # Promises wrapper for SQLite callbacks
│   │   ├── /modules            # BUSINESS LOGIC (Pillars & Sub-tables)
│   │   │   ├── /supplies       # Pillar 1
│   │   │   │   ├── supplies.routes.js     # GET /api/supplies, POST /api/supplies
│   │   │   │   ├── supplies.controller.js # req/res handling
│   │   │   │   └── supplies.service.js    # **FIFO LOGIC**, Stock calculation
│   │   │   ├── /products       # Pillar 2
│   │   │   │   ├── products.routes.js     # GET /api/products, POST /api/products
│   │   │   │   ├── products.controller.js
│   │   │   │   └── products.service.js    # **RECIPE LOGIC**, Cost calculation
│   │   │   ├── /providers      # Pillar 3
│   │   │   │   ├── providers.routes.js    # GET /api/providers, POST /api/providers
│   │   │   │   └── providers.controller.js # Manages provider_supplies table
│   │   │   └── /movements         # The Ledger
│   │   │       ├── movements.routes.js    # GET /api/reports/sales, POST /api/entries
│   │   │       └── movements.service.js   # Main coordinator for SALE/ENTRY transactions
│   │   ├── /utils              # Global Helpers
│   │   │   ├── unitConverter.js # Logic for grams to kg, oz to lt, etc.
│   │   │   └── xmlParser.js     # Logic to read XML Invoices
│   │   ├── app.js              # Express app config (CORS, JSON Parser, Routing)
│   │   └── server.js           # Server entry point (app.listen)
│   ├── package.json
│   └── .env
├── /frontend
│   ├── /src
│   │   ├── /api                # **HTTP REQUESTS (Axios)**
│   │   │   ├── apiClient.js     # Axios instance (base URL, interceptors)
│   │   │   ├── suppliesApi.js   # suppliesApi.getAll(), suppliesApi.getById()
│   │   │   ├── productsApi.js
│   │   │   └── providersApi.js
│   │   ├── /components         # Global Reusable UI Components
│   │   │   ├── /common
│   │   │   │   ├── DataTable.jsx   # Generic table for all 3 pillars
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── /modals
│   │   │   │   ├── SupplyFormModal.jsx
│   │   │   │   └── ProductRecipeModal.jsx
│   │   ├── /pages              # Screen-level Components (Routed)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SuppliesPage.jsx   # **CRUD for Supplies Pillar**
│   │   │   ├── ProductsPage.jsx   # **CRUD for Products Pillar**
│   │   │   ├── ProvidersPage.jsx  # **CRUD for Providers Pillar**
│   │   │   └── PointOfSale.jsx    # Screen to scan products and sell
│   │   ├── /routes             # React Router Config
│   │   │   └── AppRoutes.jsx
│   │   ├── /store              # State Management (Zustand or Redux)
│   │   │   ├── useSupplyStore.js
│   │   │   └── useCartStore.js    # For the POS screen
│   │   └── App.jsx
│   ├── package.json
│   └── index.html
└── README.md





## Structure JSON Routes


## POST /api/providers (Crear Proveedor)
## JSON

{
  "nit": "900.123.456-1",
  "name": "Distribuidora Avícola Central",
  "phone": "3101234567",
  "email": "ventas@avicola.com"
}

## 🟡 POST /api/products/induct (Inducción Simultánea)
## JSON

{
  "companyId": 1,
  "product": {
    "name": "Pollo Asado Familiar",
    "barcode": "PAL-001",
    "salePrice": 35000
  },
  "ingredients": [
    {
      "supplyName": "Pollo Crudo",
      "baseUnitId": 2, 
      "providerId": 1,
      "providerItemCode": "P-102",
      "purchaseUnitId": 9,
      "conversionFactor": 12,
      "initialPrice": 140000,
      "recipeUnitId": 2,
      "quantityPerProduct": 1,
      "wasteFactor": 1.05
    }
  ]
}

## 🔵 PUT /api/supplies/:id (Actualizar Insumo)
## JSON

{
  "name": "Pollo Crudo Marinado Especial"
}