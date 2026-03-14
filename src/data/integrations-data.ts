export type IntegrationStatus = "connected" | "error" | "degraded" | "not_configured";

export type CategoryId =
  | "erp"
  | "crm"
  | "wms"
  | "mrp"
  | "accounting"
  | "ecommerce"
  | "communication"
  | "shipping"
  | "data";

export interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "url";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface SyncModule {
  id: string;
  name: string;
  direction: "inbound" | "outbound" | "bidirectional";
  frequency: "realtime" | "15min" | "hourly" | "daily";
  enabled: boolean;
}

export interface FieldMapping {
  hexaField: string;
  providerField: string;
  status: "mapped" | "unmapped" | "custom";
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  entityType: string;
  recordCount: number;
  status: "success" | "partial" | "failed";
  duration: string;
  errorMessage?: string;
}

export interface ValidationCheck {
  id: string;
  label: string;
  description: string;
  method: string;
  expectedResult: string;
  autoRunnable: boolean;
}

export interface SetupGuideStep {
  id: string;
  title: string;
  who: string;
  navigation: string;
  instructions: string[];
  warningText?: string;
  screenshotKey?: string;
  fields?: { name: string; value: string; note?: string }[];
  validationChecks?: ValidationCheck[];
}

export interface SetupGuide {
  estimatedTime: string;
  steps: SetupGuideStep[];
}

export interface CommonError {
  code: string;
  meaning: string;
  fix: string;
}

export interface TimelineEstimate {
  experienced: string;
  firstTimer: string;
  withApprovals: string;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  shortName: string;
  category: CategoryId;
  status: IntegrationStatus;
  description: string;
  authMethod: string;
  lastSync?: string;
  nextSync?: string;
  syncedRecords24h?: number;
  errorRate?: number;
  prerequisites: string[];
  credentialFields: CredentialField[];
  syncModules: SyncModule[];
  fieldMappings: FieldMapping[];
  syncLogs: SyncLogEntry[];
  isPaused?: boolean;
  connectedSince?: string;
  researchVerified?: boolean;
  setupGuide?: SetupGuide;
  verificationChecklist?: string[];
  commonErrors?: CommonError[];
  timelineEstimate?: TimelineEstimate;
  securityNotes?: string[];
}

export interface IntegrationCategory {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  providers: IntegrationProvider[];
}

// ---------------------------------------------------------------------------
// Provider Definitions
// ---------------------------------------------------------------------------

const sapS4Hana: IntegrationProvider = {
  id: "sap-s4hana",
  name: "SAP S/4HANA",
  shortName: "SAP",
  category: "erp",
  status: "connected",
  description: "Enterprise resource planning for inventory, orders, and financials",
  authMethod: "Basic Auth + CSRF Tokens (on-prem) / OAuth 2.0 (Cloud)",
  lastSync: "2 min ago",
  nextSync: "13 min",
  syncedRecords24h: 4_287,
  errorRate: 0.3,
  connectedSince: "2025-09-15",
  researchVerified: true,
  prerequisites: [
    "SAP Basis Administrator to activate OData services (/IWFND/MAINT_SERVICE) and ICF nodes (/SICF)",
    "SAP Security Administrator to create technical user (SU01) and build PFCG authorization role",
    "Network/Infrastructure team to open firewall rules and configure SAP Web Dispatcher or reverse proxy with TLS",
    "SAP GRC/Compliance team to review role design for Segregation of Duties conflicts",
    "Formal ITSM change request — expect 1–4 weeks for enterprise approval chains",
  ],
  credentialFields: [
    { key: "systemId", label: "System ID (SID)", type: "text", placeholder: "PRD", required: true },
    { key: "clientNumber", label: "Client Number", type: "text", placeholder: "100", required: true },
    { key: "appServerHost", label: "Application Server Host", type: "url", placeholder: "sap-prd.yourcompany.com", required: true },
    { key: "instanceNumber", label: "Instance Number", type: "text", placeholder: "00", required: true },
    { key: "authMethod", label: "Authentication Method", type: "select", options: ["Basic Auth (Username/Password)", "OAuth 2.0 (S/4HANA Cloud via BTP)", "X.509 Certificate"], required: true },
    { key: "username", label: "Technical User (Type B)", type: "text", placeholder: "SVC_HEXA_API", required: true },
    { key: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Levels (API_MATERIAL_STOCK_SRV)", direction: "inbound", frequency: "15min", enabled: true },
    { id: "item_master", name: "Product Master (API_PRODUCT_SRV)", direction: "inbound", frequency: "daily", enabled: true },
    { id: "customers", name: "Business Partners (API_BUSINESS_PARTNER)", direction: "bidirectional", frequency: "daily", enabled: true },
    { id: "sales_orders", name: "Sales Orders (API_SALES_ORDER_SRV)", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "purchase_orders", name: "Purchase Orders (API_PURCHASEORDER_PROCESS_SRV)", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "purchase_reqs", name: "Purchase Requisitions (API_PURCHASEREQ_PROCESS_SRV)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "pricing", name: "Pricing Conditions (API_SLSPRICINGCONDITIONRECORD_SRV)", direction: "inbound", frequency: "daily", enabled: false },
  ],
  fieldMappings: [
    { hexaField: "catalogSku", providerField: "A_Product.Product (Material Number)", status: "mapped" },
    { hexaField: "product.name", providerField: "A_ProductDescription.ProductDescription", status: "mapped" },
    { hexaField: "customer.company", providerField: "A_BusinessPartner.BusinessPartnerFullName", status: "mapped" },
    { hexaField: "lineItem.parsedUom", providerField: "A_Product.BaseUnit", status: "mapped" },
    { hexaField: "lineItem.parsedQuantity", providerField: "A_SalesOrderItem.RequestedQuantity", status: "mapped" },
    { hexaField: "order.poNumber", providerField: "A_SalesOrder.PurchaseOrderByCustomer", status: "mapped" },
    { hexaField: "supplier.leadTime", providerField: "A_ProductPlant.PlannedDeliveryDurationInDays", status: "custom" },
  ],
  syncLogs: [
    { id: "sl1", timestamp: "2026-03-11T14:32:00Z", direction: "inbound", entityType: "Inventory (A_MatlStkInAcctMod)", recordCount: 1247, status: "success", duration: "3.2s" },
    { id: "sl2", timestamp: "2026-03-11T14:17:00Z", direction: "outbound", entityType: "Sales Orders (A_SalesOrder)", recordCount: 3, status: "success", duration: "1.1s" },
    { id: "sl3", timestamp: "2026-03-11T14:02:00Z", direction: "inbound", entityType: "Inventory (A_MatlStkInAcctMod)", recordCount: 1245, status: "success", duration: "3.0s" },
    { id: "sl4", timestamp: "2026-03-11T13:47:00Z", direction: "inbound", entityType: "Inventory (A_MatlStkInAcctMod)", recordCount: 1247, status: "partial", duration: "4.8s", errorMessage: "3 records skipped: UOM mapping not found for 'ROLL', 'DRUM', 'SACK'" },
    { id: "sl5", timestamp: "2026-03-11T13:32:00Z", direction: "inbound", entityType: "Inventory (A_MatlStkInAcctMod)", recordCount: 1244, status: "success", duration: "3.1s" },
    { id: "sl6", timestamp: "2026-03-11T08:00:00Z", direction: "inbound", entityType: "Product Master (A_Product)", recordCount: 8742, status: "success", duration: "47.3s" },
  ],
  setupGuide: {
    estimatedTime: "2–3 days (experienced) / 2–8 weeks (first-timer with approvals)",
    steps: [
      {
        id: "sap-1",
        title: "Create a dedicated integration user (SU01)",
        who: "SAP Security Administrator",
        navigation: "SAP GUI → Transaction /nSU01 → Enter user ID → Click Create",
        instructions: [
          "Use naming convention: SVC_HEXA_API or RFC_HEXA_PROCURE (prefix with SVC_ or RFC_)",
          "On Logon Data tab, set User Type to System (Type B) — passwords do not expire, account is not locked after failed logons, dialog logon is blocked",
          "Set a strong initial password (will be used for API authentication)",
          "On Defaults tab, set Language to EN and appropriate date/decimal formats",
          "On Roles tab, assign the PFCG role created in Step 2",
        ],
        warningText: "Never use Dialog (Type A) for API integrations — password expiration will cause integration outages. Never assign SAP_ALL or SAP_NEW profiles.",
        screenshotKey: "sap-su01-logon-data",
        fields: [
          { name: "User ID", value: "SVC_HEXA_API", note: "Follow naming convention" },
          { name: "User Type", value: "System (Type B)", note: "Critical — prevents password expiry and lockout" },
          { name: "Last Name", value: "Hexa Procurement API User", note: "Required on Address tab" },
          { name: "Validity End", value: "12/31/9999 or per security policy" },
        ],
        validationChecks: [
          { id: "sap-1-v1", label: "User exists and is not locked", description: "Attempt HTTP Basic Auth against the SAP host with the provided username/password", method: "GET /sap/opu/odata/sap/API_PRODUCT_SRV/ with Basic Auth", expectedResult: "Any response other than 401 confirms the user exists and credentials are correct", autoRunnable: true },
          { id: "sap-1-v2", label: "User type is non-dialog", description: "If the user were Dialog (Type A), a successful API call confirms it still works — but password expiration risk cannot be detected remotely. Mark as manual check.", method: "Manual: verify in SU01 that User Type = B", expectedResult: "User Type field shows 'System'", autoRunnable: false },
        ],
      },
      {
        id: "sap-2",
        title: "Create and assign the authorization role (PFCG)",
        who: "SAP Security Administrator",
        navigation: "SAP GUI → Transaction /nPFCG → Enter role name → Click Single Role",
        instructions: [
          "Name the role Z_HEXA_PROCUREMENT_API (must start with Z or Y)",
          "On the Authorizations tab, click Change Authorization Data",
          "Add infrastructure objects: S_RFC (ACTVT=16, RFC_TYPE=FUGR), S_SERVICE (OData service names), S_ICF",
          "Add material master objects: M_MATE_WRK (ACTVT=03, WERKS=specific plants), M_MATE_MAR, M_MATE_STA, M_MATE_MAN",
          "Add sales order objects: V_VBAK_VKO (ACTVT=01,02,03, VKORG/VTWEG/SPART=specific), V_VBAK_AAT",
          "Add inventory objects: M_MSEG_WMB (ACTVT=03), M_MSEG_BWA, M_MSEG_LGO",
          "Add purchase order objects: M_BEST_BSA (ACTVT=01,02,03), M_BEST_EKO, M_BEST_EKG, M_BEST_WRK",
          "Add customer objects: F_KNA1_BUK, F_KNA1_GRP, B_BUPA_GRP (for S/4HANA Business Partner)",
          "Add pricing objects: V_KONH_VKO (ACTVT=03), V_KONH_VKS",
          "Click Save, then click Generate to create the authorization profile — this step is critical, without it authorizations do not take effect",
          "Go to User tab, enter the technical user ID, click User Comparison → Complete Comparison",
        ],
        warningText: "Forgetting to Generate the profile is the single most common mistake in PFCG role building. Traffic lights must all be green (🟢) before generating.",
        screenshotKey: "sap-pfcg-auth-objects",
        validationChecks: [
          { id: "sap-2-v1", label: "Product Master read access", description: "Attempt to read a single product record via OData", method: "GET /sap/opu/odata/sap/API_PRODUCT_SRV/A_Product?$top=1&$format=json", expectedResult: "HTTP 200 with product data — confirms M_MATE_* auth objects and S_SERVICE are correct", autoRunnable: true },
          { id: "sap-2-v2", label: "Business Partner read access", description: "Attempt to read a business partner record", method: "GET /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$top=1&$format=json", expectedResult: "HTTP 200 with partner data — confirms F_KNA1_* and B_BUPA_GRP auth objects", autoRunnable: true },
          { id: "sap-2-v3", label: "Inventory read access", description: "Attempt to read stock data", method: "GET /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod?$top=1&$format=json", expectedResult: "HTTP 200 with stock data — confirms M_MSEG_* auth objects", autoRunnable: true },
          { id: "sap-2-v4", label: "Sales Order read access", description: "Attempt to read a sales order", method: "GET /sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder?$top=1&$format=json", expectedResult: "HTTP 200 with order data — confirms V_VBAK_* auth objects", autoRunnable: true },
          { id: "sap-2-v5", label: "Purchase Order read access", description: "Attempt to read a purchase order", method: "GET /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=1&$format=json", expectedResult: "HTTP 200 with PO data — confirms M_BEST_* auth objects", autoRunnable: true },
          { id: "sap-2-v6", label: "Profile generated", description: "If any of the above return 403, the profile was likely not generated in PFCG", method: "If 403 on any check above, advise user to run PFCG → Generate → User Comparison", expectedResult: "All above checks pass after profile generation", autoRunnable: false },
        ],
      },
      {
        id: "sap-3",
        title: "Activate OData services (/IWFND/MAINT_SERVICE)",
        who: "SAP Basis Administrator",
        navigation: "SAP GUI → Transaction /n/IWFND/MAINT_SERVICE",
        instructions: [
          "Click Add Service",
          "In System Alias field, enter LOCAL (standard for S/4HANA embedded gateway)",
          "Click Get Services to load all available services",
          "Filter and activate each required service: API_PURCHASEORDER_PROCESS_SRV, API_SALES_ORDER_SRV, API_PRODUCT_SRV, API_BUSINESS_PARTNER, API_MATERIAL_STOCK_SRV, API_SLSPRICINGCONDITIONRECORD_SRV, API_PURCHASEREQ_PROCESS_SRV",
          "Assign package ($TMP for testing, or transportable package for production)",
        ],
        screenshotKey: "sap-iwfnd-service-catalog",
        validationChecks: [
          { id: "sap-3-v1", label: "API_PRODUCT_SRV active", description: "Fetch the $metadata document for the Product service", method: "GET /sap/opu/odata/sap/API_PRODUCT_SRV/$metadata", expectedResult: "HTTP 200 with XML EDMX schema — if 404, service is not activated", autoRunnable: true },
          { id: "sap-3-v2", label: "API_SALES_ORDER_SRV active", description: "Fetch the $metadata for the Sales Order service", method: "GET /sap/opu/odata/sap/API_SALES_ORDER_SRV/$metadata", expectedResult: "HTTP 200 with XML EDMX schema", autoRunnable: true },
          { id: "sap-3-v3", label: "API_PURCHASEORDER_PROCESS_SRV active", description: "Fetch the $metadata for the PO service", method: "GET /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/$metadata", expectedResult: "HTTP 200 with XML EDMX schema", autoRunnable: true },
          { id: "sap-3-v4", label: "API_BUSINESS_PARTNER active", description: "Fetch the $metadata for Business Partner", method: "GET /sap/opu/odata/sap/API_BUSINESS_PARTNER/$metadata", expectedResult: "HTTP 200 with XML EDMX schema", autoRunnable: true },
          { id: "sap-3-v5", label: "API_MATERIAL_STOCK_SRV active", description: "Fetch the $metadata for Inventory/Stock", method: "GET /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/$metadata", expectedResult: "HTTP 200 with XML EDMX schema", autoRunnable: true },
        ],
      },
      {
        id: "sap-4",
        title: "Verify ICF nodes are active (/SICF)",
        who: "SAP Basis Administrator",
        navigation: "SAP GUI → Transaction /nSICF",
        instructions: [
          "Navigate to the nodes: /sap/opu/, /sap/opu/odata/, and /sap/opu/odata/sap/",
          "Verify each node shows Active status (green icon)",
          "If any show Inactive (red), right-click → Activate Service",
        ],
        screenshotKey: "sap-sicf-nodes",
        validationChecks: [
          { id: "sap-4-v1", label: "OData base path reachable", description: "If all $metadata checks in Step 3 passed, ICF nodes are necessarily active. This is an implicit validation.", method: "Confirmed implicitly by Step 3 checks passing", expectedResult: "No additional test needed — Step 3 validates this", autoRunnable: false },
        ],
      },
      {
        id: "sap-5",
        title: "Test the connection — read operation",
        who: "SAP Basis Administrator or Integration Developer",
        navigation: "Browser or Postman",
        instructions: [
          "Test $metadata endpoint: GET https://<host>:<port>/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/$metadata",
          "Include header: Authorization: Basic <base64(user:password)>",
          "Include header: X-CSRF-Token: Fetch (retrieves a token for later write operations)",
          "Expected: HTTP 200 OK with XML EDMX schema",
          "Test data query: GET /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=5&$format=json",
          "If authorization error occurs, run SU53 for the technical user to see the exact failed authorization check",
        ],
        screenshotKey: "sap-metadata-test",
        validationChecks: [
          { id: "sap-5-v1", label: "CSRF token retrieval", description: "Fetch a CSRF token to verify the full auth chain works end-to-end", method: "GET /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/ with header X-CSRF-Token: Fetch", expectedResult: "HTTP 200 with X-CSRF-Token response header containing a non-empty token value", autoRunnable: true },
          { id: "sap-5-v2", label: "Data read returns records", description: "Confirm at least one record is readable via each core entity", method: "GET /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=1&$format=json", expectedResult: "HTTP 200 with JSON containing 'd.results' array (may be empty if no data exists — 200 still confirms access)", autoRunnable: true },
          { id: "sap-5-v3", label: "Response time acceptable", description: "Measure API latency to ensure the connection path (network, Web Dispatcher, etc.) is performant", method: "Measure response time on the above GET request", expectedResult: "Response in under 2 seconds — over 5 seconds may indicate network routing issues", autoRunnable: true },
        ],
      },
      {
        id: "sap-6",
        title: "Test the connection — write operation with CSRF token",
        who: "Integration Developer",
        navigation: "Postman",
        instructions: [
          "Use the X-CSRF-Token value from the GET response in Step 5",
          "Include all session cookies from the GET response",
          "POST to /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder with Content-Type: application/json",
          "Expected: HTTP 201 Created",
          "If you get 403 Forbidden with header X-CSRF-Token: Required, the token has expired — refetch it",
        ],
        warningText: "CSRF token handling is critical for all write operations (POST/PUT/PATCH/DELETE). Always fetch the token via a GET first, then include both the token and all session cookies.",
        screenshotKey: "sap-csrf-write-test",
        validationChecks: [
          { id: "sap-6-v1", label: "Write permission confirmed", description: "Attempt a POST to create a test entity (or PATCH an existing one) to verify write authorizations", method: "POST /sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder with CSRF token + minimal test payload", expectedResult: "HTTP 201 Created (or 400 Bad Request with a validation error — which still confirms write access is granted, only the payload is rejected)", autoRunnable: true },
          { id: "sap-6-v2", label: "CSRF flow works end-to-end", description: "The CSRF token from Step 5 is accepted on a write request", method: "Include X-CSRF-Token + all cookies from the Fetch response, then POST", expectedResult: "No 403 with 'X-CSRF-Token: Required' — confirms the token handling is correct", autoRunnable: true },
        ],
      },
    ],
  },
  verificationChecklist: [
    "Technical user created in SU01 as Type B (System)",
    "PFCG role created with all required authorization objects (infrastructure + business)",
    "Profile generated in PFCG (most commonly forgotten step)",
    "User comparison completed (role assigned → profile written to user master)",
    "OData services activated in /IWFND/MAINT_SERVICE",
    "ICF nodes active for /sap/opu/odata/sap/",
    "GET request to $metadata endpoint returns HTTP 200 with EDMX schema",
    "GET request to entity set (e.g., A_PurchaseOrder?$top=1) returns data",
    "POST request with CSRF token creates a test record (201 response)",
    "SU53 shows no failed authorization checks for the technical user",
    "Security Audit Log filter configured in SM19 for the technical user",
    "Firewall rules allow HTTPS traffic from Hexa's IP range",
  ],
  commonErrors: [
    { code: "200/201", meaning: "Success", fix: "No action needed" },
    { code: "401", meaning: "Unauthorized", fix: "Wrong credentials, locked user, or expired password. Check SU01 user status and password." },
    { code: "403", meaning: "Forbidden", fix: "Missing CSRF token on write operations, or user lacks authorization objects. Run SU53 to identify the exact missing authorization." },
    { code: "404", meaning: "Not Found", fix: "OData service not activated in /IWFND/MAINT_SERVICE, ICF node inactive, or wrong URL path." },
    { code: "405", meaning: "Method Not Allowed", fix: "CSRF token missing on write operation. Fetch token via GET with X-CSRF-Token: Fetch header first." },
    { code: "500", meaning: "Internal Server Error", fix: "ABAP runtime error — check ST22 for dumps and /IWFND/ERROR_LOG for Gateway errors." },
  ],
  timelineEstimate: {
    experienced: "2–3 days",
    firstTimer: "2–8 weeks",
    withApprovals: "4–8 weeks (includes security review, network changes, transport process)",
  },
  securityNotes: [
    "For read-only inventory sync, set all ACTVT fields to 03 (Display) only",
    "For bidirectional order sync, add ACTVT 01 (Create) and 02 (Change) on order objects while keeping master data at 03",
    "IP whitelisting: configure via SAP Web Dispatcher (on-prem) or use mTLS/X.509 certificates (S/4HANA Cloud)",
    "Credential rotation: System User (Type B) passwords do not expire by design — implement manual rotation every 90 days",
    "Audit logging: configure Security Audit Log in SM19/RSAU_CONFIG with a filter for the technical user",
  ],
};

const oracleNetsuite: IntegrationProvider = {
  id: "oracle-netsuite",
  name: "Oracle NetSuite",
  shortName: "NetSuite",
  category: "erp",
  status: "not_configured",
  description: "Cloud ERP for financials, inventory, and order management",
  authMethod: "OAuth 1.0 Token-Based Auth (TBA) with HMAC-SHA256",
  researchVerified: true,
  prerequisites: [
    "NetSuite Administrator role (or custom role with Core Administration Permissions) required to enable features",
    "SOAP Web Services AND REST Web Services must both be enabled in SuiteCloud features",
    "Token-Based Authentication must be enabled (SuiteCloud tab)",
    "Consumer Key/Secret are displayed only once on save — copy immediately to a secure password manager",
    "Token ID/Secret are displayed only once on save — copy immediately",
    "IT Security team review for role permissions and IP whitelisting",
  ],
  credentialFields: [
    { key: "accountId", label: "Account ID", type: "text", placeholder: "1234567", required: true },
    { key: "consumerKey", label: "Consumer Key", type: "text", required: true },
    { key: "consumerSecret", label: "Consumer Secret", type: "password", required: true },
    { key: "tokenId", label: "Token ID", type: "text", required: true },
    { key: "tokenSecret", label: "Token Secret", type: "password", required: true },
    { key: "baseUrl", label: "NetSuite Base URL", type: "url", placeholder: "https://1234567.suitetalk.api.netsuite.com", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Items (REST /inventoryItem)", direction: "inbound", frequency: "15min", enabled: false },
    { id: "item_master", name: "Item Records (REST /inventoryItem + SuiteQL)", direction: "inbound", frequency: "daily", enabled: false },
    { id: "customers", name: "Customer Records (REST /customer)", direction: "bidirectional", frequency: "daily", enabled: false },
    { id: "sales_orders", name: "Sales Orders (REST /salesOrder)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "purchase_orders", name: "Purchase Orders (REST /purchaseOrder)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "invoices", name: "Invoices (REST /invoice)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "vendor_bills", name: "Vendor Bills (REST /vendorBill)", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
  setupGuide: {
    estimatedTime: "30–60 min (experienced) / 2–4 hours (first-timer)",
    steps: [
      {
        id: "ns-1",
        title: "Enable SuiteCloud features",
        who: "NetSuite Administrator",
        navigation: "Setup > Company > Enable Features > SuiteCloud tab",
        instructions: [
          "Check SOAP Web Services under SuiteTalk (Web Services) section",
          "Check REST Web Services under SuiteTalk (Web Services) section — this is critical",
          "Check Token-Based Authentication under Manage Authentication section",
          "Click 'I Agree' on the SuiteCloud Terms of Service when prompted",
          "Click Save",
        ],
        warningText: "Not enabling REST Web Services is the #1 cause of cryptic 'Invalid Login Attempt' errors on REST API calls. This single checkbox is responsible for the majority of authentication failures reported in NetSuite community forums.",
        screenshotKey: "netsuite-enable-features",
        validationChecks: [
          { id: "ns-1-v1", label: "REST API endpoint reachable", description: "Attempt an unauthenticated request to the REST API base URL to confirm it's enabled", method: "GET https://{ACCT}.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog/", expectedResult: "HTTP 401 (not 404) — a 401 confirms the REST endpoint exists and is active. A 404 or connection refused means REST WS is not enabled.", autoRunnable: true },
        ],
      },
      {
        id: "ns-2",
        title: "Create an Integration Record",
        who: "NetSuite Administrator",
        navigation: "Setup > Integration > Manage Integrations > New",
        instructions: [
          "Enter Name: 'Hexa Procurement Integration' (convention: [VendorName] [Purpose] Integration)",
          "State: Enabled (default)",
          "On Authentication tab: check Token-Based Authentication",
          "Uncheck TBA: Authorization Flow (not needed for server-to-server)",
          "Uncheck Authorization Code Grant and Client Credentials",
          "Click Save",
          "IMMEDIATELY copy the Consumer Key and Consumer Secret — they are displayed only once",
        ],
        warningText: "The Consumer Key and Consumer Secret are shown only once after saving. After leaving the page, they cannot be retrieved. If lost, you must reset credentials (which invalidates old values). Never send these via email.",
        screenshotKey: "netsuite-integration-record",
        fields: [
          { name: "Name", value: "Hexa Procurement Integration" },
          { name: "Token-Based Authentication", value: "Checked", note: "Must be checked for TBA" },
          { name: "TBA: Authorization Flow", value: "Unchecked", note: "Not needed for server-to-server" },
        ],
        validationChecks: [
          { id: "ns-2-v1", label: "Consumer Key is valid format", description: "Verify the Consumer Key is a 64-character hex string", method: "Client-side format validation of the entered Consumer Key", expectedResult: "64-character alphanumeric string", autoRunnable: true },
        ],
      },
      {
        id: "ns-3",
        title: "Create a custom integration role",
        who: "NetSuite Administrator",
        navigation: "Setup > Users/Roles > Manage Roles > New",
        instructions: [
          "Name: 'Hexa Integration Role'",
          "Center Type: Classic Center",
          "Subsidiary Restrictions: All (critical for OneWorld accounts)",
          "Check 'Web Services Only Role' to prevent UI login (API-only access)",
          "On Setup tab: set 'Log in using Access Tokens' = Full (most commonly missed permission)",
          "On Setup tab: set 'SOAP Web Services' = Full and 'REST Web Services' = Full",
          "On Transactions tab: set Sales Order, Purchase Order, Invoice, Credit Memo, Item Fulfillment, Item Receipt, Vendor Bill = Full (or View for read-only)",
          "On Transactions tab: set 'Find Transaction' = View (required for GET operations — often missed)",
          "On Lists tab: set Items, Customers, Vendors = Full; Locations, Currency, Units of Measure = View",
        ],
        warningText: "Without the 'Log in using Access Tokens' permission at Full level, TBA authentication will fail entirely. The 'Find Transaction' permission is also commonly missed — it is required for all GET operations on transactions.",
        screenshotKey: "netsuite-role-permissions",
        validationChecks: [
          { id: "ns-3-v1", label: "TBA login permission", description: "Attempt a TBA-authenticated request — if it fails with INVALID_LOGIN, the role is missing 'Log in using Access Tokens'", method: "This is tested end-to-end in Step 6. Failure here with INVALID_LOGIN specifically points back to this step.", expectedResult: "Deferred to Step 6 auth test", autoRunnable: false },
        ],
      },
      {
        id: "ns-4",
        title: "Create a dedicated integration user",
        who: "NetSuite Administrator",
        navigation: "Lists > Employees > Employees > New",
        instructions: [
          "Create a dedicated employee record — never use an existing human user's account",
          "First Name: 'Hexa', Last Name: 'Integration'",
          "Email: use a functional/shared email (e.g., netsuite-integration@company.com)",
          "On Access subtab: check 'Give Access', set a strong password",
          "In Roles section, select the custom integration role → Click Add",
          "Click Save",
        ],
        screenshotKey: "netsuite-employee-access",
        fields: [
          { name: "First Name", value: "Hexa" },
          { name: "Last Name", value: "Integration" },
          { name: "Email", value: "netsuite-integration@company.com", note: "Use a shared/functional email" },
          { name: "Give Access", value: "Checked" },
          { name: "Role", value: "Hexa Integration Role" },
        ],
      },
      {
        id: "ns-5",
        title: "Generate access tokens",
        who: "NetSuite Administrator",
        navigation: "Setup > Users/Roles > Access Tokens > New",
        instructions: [
          "Application Name: select the Integration Record from Step 2",
          "User: select the integration user from Step 4",
          "Role: select the custom integration role from Step 3",
          "Click Save",
          "IMMEDIATELY copy the Token ID and Token Secret — they are displayed only once",
        ],
        warningText: "Token ID and Token Secret are displayed only once. TBA tokens do not expire automatically — they remain valid until manually revoked. For sandbox environments, tokens are destroyed on every sandbox refresh and must be recreated.",
        screenshotKey: "netsuite-access-tokens",
        validationChecks: [
          { id: "ns-5-v1", label: "All 4 credentials present", description: "Verify Consumer Key, Consumer Secret, Token ID, and Token Secret are all provided", method: "Client-side check that all 4 fields are non-empty", expectedResult: "All 4 credential fields contain values", autoRunnable: true },
        ],
      },
      {
        id: "ns-6",
        title: "Test the connection",
        who: "Integration Developer",
        navigation: "Postman or Hexa's Test Connection",
        instructions: [
          "Set Auth Type to OAuth 1.0 with Signature Method: HMAC-SHA256 (not HMAC-SHA1)",
          "Enter Consumer Key, Consumer Secret, Access Token (Token ID), Token Secret",
          "Set Realm to your Account ID (e.g., 1234567 or 1234567_SB1 for sandbox — note underscore, not hyphen)",
          "Set 'Add auth data to' = Request Headers",
          "Test: GET https://{ACCT}.suitetalk.api.netsuite.com/services/rest/record/v1/salesOrder?limit=5",
          "Expected: HTTP 200 OK with JSON array of sales orders",
        ],
        warningText: "For sandbox accounts, the realm uses underscore format (1234567_SB1) while the URL uses hyphen format (1234567-sb1). This mismatch is a constant source of authentication errors.",
        screenshotKey: "netsuite-postman-test",
        validationChecks: [
          { id: "ns-6-v1", label: "Authentication succeeds", description: "TBA-authenticated request returns 200 instead of 401", method: "GET /services/rest/record/v1/salesOrder?limit=1 with OAuth 1.0 TBA", expectedResult: "HTTP 200 — confirms all 4 credentials, realm format, TBA feature, and role permissions are correct", autoRunnable: true },
          { id: "ns-6-v2", label: "Sales Order read access", description: "Attempt to list sales orders", method: "GET /services/rest/record/v1/salesOrder?limit=1", expectedResult: "HTTP 200 with JSON containing 'items' array", autoRunnable: true },
          { id: "ns-6-v3", label: "Purchase Order read access", description: "Attempt to list purchase orders", method: "GET /services/rest/record/v1/purchaseOrder?limit=1", expectedResult: "HTTP 200 with JSON containing 'items' array", autoRunnable: true },
          { id: "ns-6-v4", label: "Inventory Item read access", description: "Attempt to list inventory items", method: "GET /services/rest/record/v1/inventoryItem?limit=1", expectedResult: "HTTP 200 with JSON containing 'items' array", autoRunnable: true },
          { id: "ns-6-v5", label: "Customer read access", description: "Attempt to list customers", method: "GET /services/rest/record/v1/customer?limit=1", expectedResult: "HTTP 200 with JSON containing 'items' array", autoRunnable: true },
          { id: "ns-6-v6", label: "Response time acceptable", description: "Measure API latency", method: "Measure response time on authenticated GET", expectedResult: "Under 3 seconds — NetSuite REST API can be slow on first call", autoRunnable: true },
        ],
      },
    ],
  },
  verificationChecklist: [
    "All 4 SuiteCloud features enabled (SuiteScript if needed, SOAP WS, REST WS, TBA)",
    "Integration record created; Consumer Key/Secret securely stored",
    "Custom role has 'Log in using Access Tokens' and SOAP/REST Web Services = Full",
    "'Find Transaction' permission added to role (commonly missed; needed for GET operations)",
    "Subsidiary Restrictions set to 'All' for OneWorld accounts",
    "Dedicated integration user created with role assigned",
    "Access Token generated; Token ID/Secret securely stored",
    "Account ID noted (from Setup > Company > Company Information)",
    "Test GET request returns 200 OK with data",
    "Test POST request successfully creates a record",
    "Sandbox tokens created separately (destroyed on every sandbox refresh)",
  ],
  commonErrors: [
    { code: "401 INVALID_LOGIN", meaning: "Authentication failed", fix: "Check in order: (1) REST Web Services enabled, (2) realm uses underscore not hyphen for sandbox, (3) TBA feature enabled, (4) role has 'Log in using Access Tokens', (5) SOAP Web Services = Full on role. Check Login Audit Trail at Setup > Users/Roles > User Management." },
    { code: "403 INSUFFICIENT_PERMISSION", meaning: "Missing permission on the role", fix: "Add the missing permission to the integration role. Check subsidiary restrictions are set to 'All'." },
    { code: "429 CONCURRENCY_LIMIT_EXCEEDED", meaning: "Too many concurrent API requests", fix: "Implement retry with exponential backoff. Base concurrency limit depends on service tier (e.g., Tier 1 = 15 concurrent)." },
  ],
  timelineEstimate: {
    experienced: "30–60 minutes",
    firstTimer: "2–4 hours",
    withApprovals: "1–2 weeks (including IT Security review and change management)",
  },
  securityNotes: [
    "For read-only inventory sync: Items = View, Locations = View, plus required Setup permissions for TBA",
    "For bidirectional order sync: add Sales Order, Purchase Order, Items, Customers, Vendors = Full",
    "IP restrictions: enable via Setup > Company > Enable Features > General > Access > IP Address Rules",
    "Token rotation (zero-downtime): create new token → update platform → verify → revoke old token. Multiple tokens can coexist.",
    "Recommended rotation schedule: every 90 days",
  ],
};

const msDynamics365: IntegrationProvider = {
  id: "ms-dynamics-365",
  name: "Microsoft Dynamics 365 F&O",
  shortName: "D365 F&O",
  category: "erp",
  status: "not_configured",
  description: "Finance and Operations for enterprise-grade ERP",
  authMethod: "OAuth 2.0 client_credentials (Azure AD / Entra ID)",
  researchVerified: true,
  prerequisites: [
    "Azure AD Global Administrator (or Application Administrator) to create App Registration and grant admin consent",
    "D365 System Administrator to register the app, create service account, and assign security roles",
    "These are often different people on different teams — coordination overhead expected",
    "Change Advisory Board (CAB) approval and data governance review at large enterprises",
    "D365 Environment URL available (e.g., https://yourorg.operations.dynamics.com)",
  ],
  credentialFields: [
    { key: "tenantId", label: "Azure AD Tenant ID", type: "text", required: true },
    { key: "clientId", label: "Application (Client) ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "environmentUrl", label: "D365 Environment URL", type: "url", placeholder: "https://yourorg.operations.dynamics.com", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory On-Hand (InventOnhandEntities)", direction: "inbound", frequency: "15min", enabled: false },
    { id: "products", name: "Released Products (ReleasedProductsV2)", direction: "inbound", frequency: "daily", enabled: false },
    { id: "sales_orders", name: "Sales Orders (SalesOrderHeadersV2 + Lines)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "purchase_orders", name: "Purchase Orders (PurchaseOrderHeadersV2 + Lines)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "customers", name: "Customers (CustomersV3)", direction: "bidirectional", frequency: "daily", enabled: false },
    { id: "vendors", name: "Vendors (VendorsV2)", direction: "inbound", frequency: "daily", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
  setupGuide: {
    estimatedTime: "30–60 min (experienced) / 2–4 hours (first-timer) / +4–8 hours for custom role design",
    steps: [
      {
        id: "d365-1",
        title: "Azure AD App Registration",
        who: "Azure AD Global Administrator or Application Administrator",
        navigation: "portal.azure.com → Azure Active Directory → App registrations → + New registration",
        instructions: [
          "Name: 'Hexa-D365FO-Integration-Prod' (convention: {VendorName}-D365FO-Integration-{Env})",
          "Supported account types: 'Accounts in this organizational directory only (Single tenant)'",
          "Redirect URI: leave blank — not needed for server-to-server client_credentials flow",
          "Click Register",
          "Note the Application (client) ID and Directory (tenant) ID from the Overview page",
        ],
        screenshotKey: "d365-app-registration",
        fields: [
          { name: "Name", value: "Hexa-D365FO-Integration-Prod" },
          { name: "Supported account types", value: "Single tenant", note: "Correct for B2B integration" },
          { name: "Redirect URI", value: "(leave blank)", note: "Not needed for client_credentials" },
        ],
        validationChecks: [
          { id: "d365-1-v1", label: "Tenant ID format valid", description: "Verify the Tenant ID is a valid GUID", method: "Client-side regex validation: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i", expectedResult: "Matches GUID format (e.g., 12345678-abcd-1234-efgh-123456789012)", autoRunnable: true },
          { id: "d365-1-v2", label: "Client ID format valid", description: "Verify the Application (Client) ID is a valid GUID", method: "Same GUID regex validation", expectedResult: "Matches GUID format", autoRunnable: true },
        ],
      },
      {
        id: "d365-2",
        title: "Configure API permissions",
        who: "Azure AD Global Administrator",
        navigation: "App registration → API permissions → + Add a permission",
        instructions: [
          "Select the 'APIs my organization uses' tab",
          "Search for 'Microsoft Dynamics ERP' (use the full name — partial searches may not find it)",
          "Select Delegated permissions and enable: AX.FullAccess, CustomService.FullAccess, Odata.FullAccess",
          "Click Add permissions",
          "Click 'Grant admin consent for {tenant}' — this requires Global Admin and shows green checkmarks when granted",
        ],
        warningText: "D365 F&O only exposes Delegated permissions under the Dynamics ERP API — there are no Application permissions. The actual data-level authorization is controlled by security roles assigned in D365 F&O, not by these Azure AD scopes.",
        screenshotKey: "d365-api-permissions",
      },
      {
        id: "d365-3",
        title: "Create client secret",
        who: "Azure AD Administrator",
        navigation: "App registration → Certificates & secrets → + New client secret",
        instructions: [
          "Description: 'D365FO-Integration-Secret-2026'",
          "Expiration: 6 months (Microsoft's security recommendation — maximum is 24 months)",
          "Click Add",
          "IMMEDIATELY copy the secret Value — it is shown only once and masked after you leave",
          "Document the expiry date and set a calendar reminder for rotation",
        ],
        warningText: "The client secret value is shown only once. Microsoft strongly recommends certificates over secrets for production. D365 supports multiple active secrets for zero-downtime rotation: create new → update integration → verify → delete old.",
        screenshotKey: "d365-client-secret",
        fields: [
          { name: "Description", value: "D365FO-Integration-Secret-2026" },
          { name: "Expiration", value: "6 months", note: "Microsoft recommended maximum" },
        ],
        validationChecks: [
          { id: "d365-3-v1", label: "OAuth token acquisition", description: "Attempt to obtain a bearer token using the client credentials flow — this validates the app registration, client secret, and admin consent in one shot", method: "POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token with grant_type=client_credentials, client_id, client_secret, scope={env}/.default", expectedResult: "HTTP 200 with JSON containing 'access_token' field", autoRunnable: true },
          { id: "d365-3-v2", label: "Token audience is correct", description: "Decode the returned JWT and verify the 'aud' claim matches the D365 environment URL", method: "Decode access_token as JWT, inspect the 'aud' field", expectedResult: "'aud' equals the environment URL without trailing slash (e.g., https://yourorg.operations.dynamics.com)", autoRunnable: true },
        ],
      },
      {
        id: "d365-4",
        title: "Register the app in D365 F&O",
        who: "D365 System Administrator",
        navigation: "D365 F&O → System Administration > Setup > Azure Active Directory applications (or direct: /?mi=SysAADClientTable)",
        instructions: [
          "First, create a dedicated service account user: System Administration > Users → New user (e.g., User ID: svc-hexa-api)",
          "The user must have an email matching an Azure AD account — it cannot be a guest/B2B user",
          "Navigate to System Administration > Setup > Azure Active Directory applications",
          "Click New",
          "Client ID: paste the Application (client) ID from Step 1",
          "Name: 'Hexa Procurement Platform'",
          "User ID: select the dedicated service account user",
          "Click Save",
        ],
        warningText: "When the integration authenticates using client_credentials with this Client ID + Secret, D365 F&O maps the token to the specified service account user. All API operations execute with that user's security roles. Never use the Admin user.",
        screenshotKey: "d365-aad-applications",
        fields: [
          { name: "Client ID", value: "(Application ID from Azure AD)", note: "Must match exactly" },
          { name: "Name", value: "Hexa Procurement Platform" },
          { name: "User ID", value: "svc-hexa-api", note: "Dedicated service account" },
        ],
        validationChecks: [
          { id: "d365-4-v1", label: "App mapped to user in D365", description: "Attempt an authenticated OData request — if the app is not registered in SysAADClientTable, you get 401 even with a valid token", method: "GET https://{env}.operations.dynamics.com/data/$metadata with Bearer token", expectedResult: "HTTP 200 with OData metadata — if 401, the app is not registered in D365 AAD applications table", autoRunnable: true },
        ],
      },
      {
        id: "d365-5",
        title: "Assign security roles",
        who: "D365 System Administrator",
        navigation: "D365 F&O → System Administration > Users → find service account → Assign roles",
        instructions: [
          "For quick setup, assign out-of-the-box roles: 'Purchasing agent' (POs), 'Sales clerk' (SOs), 'Inventory manager' (stock)",
          "For least privilege, create a custom role: System Administration > Security > Security configuration → Create new",
          "Add duties/privileges for each data entity: PurchaseOrderHeadersV2, PurchaseOrderLinesV2, SalesOrderHeadersV2, SalesOrderLinesV2, ReleasedProductsV2, CustomersV3, VendorsV2, InventOnhandEntities",
          "Set Object Type = Data Entity, Integration Mode = Data Services, and appropriate access levels (Read/Create/Update/Delete)",
          "Optionally configure throttling priority: System Administration > Setup > Throttling priority mapping → New → select Client ID → assign High priority",
        ],
        screenshotKey: "d365-security-roles",
        validationChecks: [
          { id: "d365-5-v1", label: "Customers read access", description: "Read a customer record to verify security role grants access", method: "GET /data/CustomersV3?$top=1", expectedResult: "HTTP 200 with customer data — if 403, the service account lacks the required security role", autoRunnable: true },
          { id: "d365-5-v2", label: "Products read access", description: "Read a product record", method: "GET /data/ReleasedProductsV2?$top=1", expectedResult: "HTTP 200 with product data", autoRunnable: true },
          { id: "d365-5-v3", label: "Inventory read access", description: "Read inventory on-hand", method: "GET /data/InventOnhandEntities?$top=1&cross-company=true", expectedResult: "HTTP 200 with inventory data", autoRunnable: true },
          { id: "d365-5-v4", label: "Purchase Orders read access", description: "Read PO headers", method: "GET /data/PurchaseOrderHeadersV2?$top=1", expectedResult: "HTTP 200 with PO header data", autoRunnable: true },
          { id: "d365-5-v5", label: "Sales Orders read access", description: "Read SO headers", method: "GET /data/SalesOrderHeadersV2?$top=1", expectedResult: "HTTP 200 with SO header data", autoRunnable: true },
          { id: "d365-5-v6", label: "Vendors read access", description: "Read vendor records", method: "GET /data/VendorsV2?$top=1", expectedResult: "HTTP 200 with vendor data", autoRunnable: true },
        ],
      },
      {
        id: "d365-6",
        title: "Test the connection",
        who: "Integration Developer",
        navigation: "Postman or Hexa's Test Connection",
        instructions: [
          "Get bearer token: POST to https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token",
          "Body (x-www-form-urlencoded): grant_type=client_credentials, client_id={Client ID}, client_secret={Secret Value}, scope=https://{env}.operations.dynamics.com/.default",
          "IMPORTANT: do NOT add a trailing slash to the scope URL",
          "Expected: HTTP 200 with JSON containing access_token",
          "Test data: GET https://{env}.operations.dynamics.com/data/CustomersV3?$top=3 with header Authorization: Bearer {access_token}",
          "Expected: HTTP 200 with {\"@odata.context\":\"...\", \"value\":[{...}]}",
          "Entity names are case-sensitive: /data/batchjobs returns 404, /data/BatchJobs works",
          "For cross-company data: append ?cross-company=true (default returns only the user's default legal entity)",
        ],
        warningText: "Entity names are case-sensitive in D365 OData URLs. Always verify the exact name via GET /data/ which returns all available entity sets. Maximum page size is 10,000 records — use @odata.nextLink for pagination.",
        screenshotKey: "d365-postman-test",
        validationChecks: [
          { id: "d365-6-v1", label: "Full end-to-end read test", description: "Complete authenticated read across all entity types to confirm the entire chain works", method: "Sequentially GET all 6 entities with Bearer token", expectedResult: "All return HTTP 200 — the integration is fully configured for read operations", autoRunnable: true },
          { id: "d365-6-v2", label: "Response time acceptable", description: "Measure API latency to ensure the connection is performant", method: "Measure response time on authenticated GET /data/CustomersV3?$top=1", expectedResult: "Under 3 seconds — first call may be slower due to JIT compilation", autoRunnable: true },
          { id: "d365-6-v3", label: "Cross-company access works", description: "If multi-company, verify cross-company parameter returns data from all legal entities", method: "GET /data/CustomersV3?$top=1&cross-company=true", expectedResult: "HTTP 200 — returns data across legal entities, not just the default company", autoRunnable: true },
        ],
      },
    ],
  },
  verificationChecklist: [
    "App Registration created in Azure AD in the correct tenant",
    "API permissions granted (Dynamics ERP — AX.FullAccess, CustomService.FullAccess, Odata.FullAccess) with admin consent (green checkmarks)",
    "Client secret configured; expiry date documented with calendar reminder",
    "App registered in D365: System Administration > Setup > Azure Active Directory applications with correct Client ID",
    "Dedicated service account user created (not a guest/B2B user)",
    "Security roles assigned to the service account with least privilege verified",
    "Throttling priority mapping configured for the Client ID",
    "Bearer token successfully obtained via Postman (200 response with access_token)",
    "All required entity endpoints tested with 200 OK responses",
    "Cross-company access tested if needed (?cross-company=true)",
    "Write operations tested (POST/PATCH) for entities requiring create/update",
    "Secret rotation procedure documented",
    "Tested in Tier 2+ sandbox before production deployment",
  ],
  commonErrors: [
    { code: "401 Unauthorized", meaning: "Authentication failed", fix: "App not registered in D365 SysAADClientTable; trailing slash in scope URL; wrong tenant; TLS below 1.2. Decode JWT at jwt.io — verify 'aud' matches environment URL without trailing slash." },
    { code: "403 Forbidden", meaning: "Insufficient security roles", fix: "Service account user lacks required security roles. Add appropriate roles in System Administration > Users." },
    { code: "404 Not Found", meaning: "Wrong entity name or URL", fix: "Entity names are case-sensitive. Check exact name via GET /data/ listing." },
    { code: "429 Too Many Requests", meaning: "Rate limit exceeded", fix: "6,000 requests per 5-minute window per user. Implement retry with Retry-After header. Configure throttling priority mapping." },
    { code: "AADSTS7000215", meaning: "Invalid client secret", fix: "Verify you're using the secret Value (not the Secret ID). Regenerate if needed." },
    { code: "AADSTS700016", meaning: "App not found in tenant", fix: "Verify correct tenant ID and client ID. Ensure app registration is in the correct Azure AD tenant." },
  ],
  timelineEstimate: {
    experienced: "30–60 minutes",
    firstTimer: "2–4 hours (+4–8 hours for custom security role design)",
    withApprovals: "1–2 weeks (including Azure AD admin coordination and change management)",
  },
  securityNotes: [
    "For read-only inventory sync: custom role with only Read access on InventSumEntity and ReleasedProductsV2",
    "For bidirectional procurement: add Read + Create + Update on PurchaseOrderHeaders/Lines and SalesOrderHeaders/Lines, keep master data at Read only",
    "Never assign System Administrator to an integration service account",
    "IP restrictions: Azure AD Conditional Access for workload identities (requires Workload Identities Premium license)",
    "Credential rotation: Microsoft recommends secrets no longer than 6 months. Store in Azure Key Vault for centralized management.",
    "Audit: Azure AD Sign-in Logs for service principal sign-ins; D365 Database Log for critical table changes; LCS Environment Monitoring for API call logs",
  ],
};

const epicorKinetic: IntegrationProvider = {
  id: "epicor-kinetic",
  name: "Epicor Kinetic",
  shortName: "Epicor",
  category: "erp",
  status: "not_configured",
  description: "Manufacturing ERP with deep shop-floor integration",
  authMethod: "API Key + Basic Auth",
  prerequisites: [
    "REST API v2 enabled in Epicor admin console",
    "API Key generated for integration user",
    "Company ID and Plant ID available",
  ],
  credentialFields: [
    { key: "serverUrl", label: "Epicor Server URL", type: "url", placeholder: "https://epicor.yourcompany.com", required: true },
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "companyId", label: "Company ID", type: "text", required: true },
    { key: "plantId", label: "Plant ID", type: "text", required: true },
    { key: "username", label: "Username", type: "text", required: true },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Part Inventory", direction: "inbound", frequency: "15min", enabled: false },
    { id: "parts", name: "Part Master", direction: "inbound", frequency: "daily", enabled: false },
    { id: "sales_orders", name: "Sales Orders", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "purchase_orders", name: "Purchase Orders", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "jobs", name: "Job Entries", direction: "inbound", frequency: "hourly", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const inforCloudsuite: IntegrationProvider = {
  id: "infor-cloudsuite",
  name: "Infor CloudSuite",
  shortName: "Infor",
  category: "erp",
  status: "not_configured",
  description: "Industry-specific ERP via ION API and BOD documents",
  authMethod: "OAuth 2.0 (ION API)",
  prerequisites: [
    "Authorized app created in Infor OS Portal",
    "ION API Gateway endpoint configured",
    "ION Connect BODs set up for data exchange",
  ],
  credentialFields: [
    { key: "portalUrl", label: "Infor OS Portal URL", type: "url", required: true },
    { key: "clientId", label: "ION API Client ID", type: "text", required: true },
    { key: "clientSecret", label: "ION API Client Secret", type: "password", required: true },
    { key: "tenantId", label: "Tenant ID", type: "text", required: true },
    { key: "logicalId", label: "Logical ID", type: "text", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Balance", direction: "inbound", frequency: "15min", enabled: false },
    { id: "items", name: "Item Master (BOD)", direction: "inbound", frequency: "daily", enabled: false },
    { id: "sales_orders", name: "Sales Orders (BOD)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "purchase_orders", name: "Purchase Orders (BOD)", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// CRM Providers

const salesforce: IntegrationProvider = {
  id: "salesforce",
  name: "Salesforce",
  shortName: "Salesforce",
  category: "crm",
  status: "connected",
  description: "CRM for accounts, contacts, opportunities, and case management",
  authMethod: "OAuth 2.0",
  lastSync: "5 min ago",
  nextSync: "10 min",
  syncedRecords24h: 892,
  errorRate: 0,
  connectedSince: "2025-11-02",
  prerequisites: [
    "Connected App created in Salesforce Setup",
    "OAuth scopes configured (api, refresh_token)",
    "Integration user with API-enabled profile",
  ],
  credentialFields: [
    { key: "loginUrl", label: "Login URL", type: "select", options: ["https://login.salesforce.com", "https://test.salesforce.com"], required: true },
    { key: "consumerKey", label: "Consumer Key", type: "text", required: true },
    { key: "consumerSecret", label: "Consumer Secret", type: "password", required: true },
    { key: "username", label: "Username", type: "text", required: true },
    { key: "securityToken", label: "Security Token", type: "password", required: true },
  ],
  syncModules: [
    { id: "accounts", name: "Accounts", direction: "bidirectional", frequency: "15min", enabled: true },
    { id: "contacts", name: "Contacts", direction: "bidirectional", frequency: "15min", enabled: true },
    { id: "opportunities", name: "Opportunities", direction: "inbound", frequency: "hourly", enabled: true },
    { id: "order_status", name: "Order Status Updates", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "call_logs", name: "Call Logs", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [
    { hexaField: "customer.company", providerField: "Account.Name", status: "mapped" },
    { hexaField: "customer.email", providerField: "Contact.Email", status: "mapped" },
    { hexaField: "customer.billingAddress", providerField: "Account.BillingAddress", status: "mapped" },
    { hexaField: "customer.shippingAddress", providerField: "Account.ShippingAddress", status: "mapped" },
    { hexaField: "order.stage", providerField: "Opportunity.StageName", status: "custom" },
  ],
  syncLogs: [
    { id: "sf1", timestamp: "2026-03-11T14:30:00Z", direction: "inbound", entityType: "Accounts", recordCount: 47, status: "success", duration: "1.8s" },
    { id: "sf2", timestamp: "2026-03-11T14:30:00Z", direction: "inbound", entityType: "Contacts", recordCount: 134, status: "success", duration: "2.4s" },
    { id: "sf3", timestamp: "2026-03-11T14:15:00Z", direction: "outbound", entityType: "Order Status", recordCount: 2, status: "success", duration: "0.6s" },
    { id: "sf4", timestamp: "2026-03-11T13:15:00Z", direction: "inbound", entityType: "Opportunities", recordCount: 23, status: "success", duration: "1.2s" },
  ],
};

const hubspot: IntegrationProvider = {
  id: "hubspot",
  name: "HubSpot",
  shortName: "HubSpot",
  category: "crm",
  status: "not_configured",
  description: "CRM, marketing, and sales hub for growing businesses",
  authMethod: "OAuth 2.0 / Private App Token",
  prerequisites: [
    "App created in HubSpot developer portal",
    "Required scopes defined (crm.objects.contacts.read/write, etc.)",
    "HubSpot account with Super Admin access",
  ],
  credentialFields: [
    { key: "authType", label: "Authentication Type", type: "select", options: ["OAuth 2.0", "Private App Token"], required: true },
    { key: "clientId", label: "Client ID", type: "text" },
    { key: "clientSecret", label: "Client Secret", type: "password" },
    { key: "accessToken", label: "Private App Access Token", type: "password" },
  ],
  syncModules: [
    { id: "companies", name: "Companies", direction: "bidirectional", frequency: "15min", enabled: false },
    { id: "contacts", name: "Contacts", direction: "bidirectional", frequency: "15min", enabled: false },
    { id: "deals", name: "Deals", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "tickets", name: "Tickets (Claims)", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const msDynamicsCrm: IntegrationProvider = {
  id: "ms-dynamics-crm",
  name: "Microsoft Dynamics 365 Sales",
  shortName: "D365 Sales",
  category: "crm",
  status: "not_configured",
  description: "CRM for sales pipeline, accounts, and customer engagement",
  authMethod: "OAuth 2.0 (Azure AD)",
  prerequisites: [
    "App registered in Azure Active Directory",
    "Dynamics CRM API permissions added",
    "Application user created in D365 CRM",
  ],
  credentialFields: [
    { key: "tenantId", label: "Azure AD Tenant ID", type: "text", required: true },
    { key: "clientId", label: "Application (Client) ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "crmUrl", label: "CRM Organization URL", type: "url", placeholder: "https://yourorg.crm.dynamics.com", required: true },
  ],
  syncModules: [
    { id: "accounts", name: "Accounts", direction: "bidirectional", frequency: "15min", enabled: false },
    { id: "contacts", name: "Contacts", direction: "bidirectional", frequency: "15min", enabled: false },
    { id: "opportunities", name: "Opportunities", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "incidents", name: "Cases (Claims)", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const zohoCrm: IntegrationProvider = {
  id: "zoho-crm",
  name: "Zoho CRM",
  shortName: "Zoho",
  category: "crm",
  status: "not_configured",
  description: "Affordable CRM for sales automation and analytics",
  authMethod: "OAuth 2.0",
  prerequisites: [
    "Client registered in Zoho API Console",
    "Authorization code generated",
    "Correct Zoho data center selected (zoho.com, zoho.eu, etc.)",
  ],
  credentialFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "datacenter", label: "Data Center", type: "select", options: ["zoho.com (US)", "zoho.eu (EU)", "zoho.in (IN)", "zoho.com.au (AU)"], required: true },
    { key: "redirectUri", label: "Redirect URI", type: "url", required: true },
  ],
  syncModules: [
    { id: "accounts", name: "Accounts", direction: "bidirectional", frequency: "15min", enabled: false },
    { id: "contacts", name: "Contacts", direction: "bidirectional", frequency: "15min", enabled: false },
    { id: "deals", name: "Deals", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "sales_orders", name: "Sales Orders", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// WMS Providers

const manhattanAssociates: IntegrationProvider = {
  id: "manhattan-associates",
  name: "Manhattan Associates",
  shortName: "Manhattan",
  category: "wms",
  status: "not_configured",
  description: "Advanced warehouse management for complex distribution",
  authMethod: "OAuth 2.0 / API Key",
  prerequisites: [
    "API credentials obtained from Manhattan support",
    "Warehouse/facility mapping configured",
    "Event subscriptions set up for shipment and receipt events",
  ],
  credentialFields: [
    { key: "apiBaseUrl", label: "API Base URL", type: "url", required: true },
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "facilityCode", label: "Facility/Warehouse Code", type: "text", required: true },
    { key: "tenantId", label: "Tenant ID", type: "text", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Positions", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "shipments", name: "Shipment Confirmations", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "receiving", name: "Receiving Confirmations", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "outbound_orders", name: "Outbound Orders", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const blueYonder: IntegrationProvider = {
  id: "blue-yonder",
  name: "Blue Yonder",
  shortName: "Blue Yonder",
  category: "wms",
  status: "not_configured",
  description: "AI-powered supply chain and warehouse management",
  authMethod: "OAuth 2.0 (Luminate)",
  prerequisites: [
    "Application registered in Luminate Control Tower",
    "Inbound/outbound order interfaces configured",
    "Inventory visibility feeds set up",
  ],
  credentialFields: [
    { key: "luminateUrl", label: "Luminate Platform URL", type: "url", required: true },
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "orgId", label: "Organization ID", type: "text", required: true },
    { key: "facilityCode", label: "Facility Code", type: "text", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Visibility", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "shipments", name: "Shipment Status", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "orders", name: "Outbound Orders", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const sapEwm: IntegrationProvider = {
  id: "sap-ewm",
  name: "SAP EWM",
  shortName: "SAP EWM",
  category: "wms",
  status: "not_configured",
  description: "SAP Extended Warehouse Management for advanced logistics",
  authMethod: "RFC / OData",
  prerequisites: [
    "EWM ↔ ERP integration configured",
    "Delivery-based triggers set up",
    "OData services enabled for inventory queries",
  ],
  credentialFields: [
    { key: "systemId", label: "System ID (SID)", type: "text", required: true },
    { key: "clientNumber", label: "Client Number", type: "text", required: true },
    { key: "appServerHost", label: "Application Server Host", type: "url", required: true },
    { key: "warehouseNumber", label: "Warehouse Number", type: "text", required: true },
    { key: "username", label: "Username", type: "text", required: true },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Warehouse Inventory", direction: "inbound", frequency: "15min", enabled: false },
    { id: "delivery", name: "Delivery Confirmations", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "pick_lists", name: "Pick Lists", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const oracleWms: IntegrationProvider = {
  id: "oracle-wms",
  name: "Oracle WMS Cloud",
  shortName: "Oracle WMS",
  category: "wms",
  status: "not_configured",
  description: "Cloud warehouse management with Oracle ecosystem integration",
  authMethod: "OAuth 2.0",
  prerequisites: [
    "REST/SOAP endpoint obtained from Oracle",
    "Inbound shipment and outbound order interfaces configured",
    "Inventory snapshot feeds set up",
  ],
  credentialFields: [
    { key: "wmsUrl", label: "Oracle WMS Cloud URL", type: "url", required: true },
    { key: "username", label: "Username", type: "text", required: true },
    { key: "password", label: "Password", type: "password", required: true },
    { key: "facilityCode", label: "Facility Code", type: "text", required: true },
    { key: "companyCode", label: "Company Code", type: "text", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Snapshots", direction: "inbound", frequency: "15min", enabled: false },
    { id: "shipments", name: "Shipment Confirmations", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "orders", name: "Outbound Orders", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "receiving", name: "Receiving Confirmations", direction: "inbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// MRP Providers

const sapPP: IntegrationProvider = {
  id: "sap-pp",
  name: "SAP Production Planning",
  shortName: "SAP PP",
  category: "mrp",
  status: "not_configured",
  description: "Production planning, scheduling, and BOM management",
  authMethod: "RFC / OData",
  prerequisites: [
    "Production Order IDocs configured",
    "MRP list extract access available",
    "BOM explosion BAPI permissions granted",
  ],
  credentialFields: [
    { key: "systemId", label: "System ID (SID)", type: "text", required: true },
    { key: "clientNumber", label: "Client Number", type: "text", required: true },
    { key: "appServerHost", label: "Application Server Host", type: "url", required: true },
    { key: "username", label: "Username", type: "text", required: true },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  syncModules: [
    { id: "production_orders", name: "Production Orders", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "planned_orders", name: "Planned Orders", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "bom", name: "Bill of Materials", direction: "inbound", frequency: "daily", enabled: false },
    { id: "demand", name: "Demand Signals", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const oracleManufacturing: IntegrationProvider = {
  id: "oracle-manufacturing",
  name: "Oracle Manufacturing Cloud",
  shortName: "Oracle Mfg",
  category: "mrp",
  status: "not_configured",
  description: "Cloud manufacturing with work orders and quality management",
  authMethod: "OAuth 2.0",
  prerequisites: [
    "Manufacturing REST APIs enabled",
    "Integration user with appropriate data roles created",
    "Business Events configured for work order status changes",
  ],
  credentialFields: [
    { key: "cloudUrl", label: "Oracle Cloud URL", type: "url", required: true },
    { key: "identityDomain", label: "Identity Domain", type: "text", required: true },
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
  ],
  syncModules: [
    { id: "work_orders", name: "Work Orders", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "production_schedule", name: "Production Scheduling", direction: "inbound", frequency: "daily", enabled: false },
    { id: "quality", name: "Quality Inspection Results", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "demand", name: "Demand Signals", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const plexRockwell: IntegrationProvider = {
  id: "plex-rockwell",
  name: "Plex (Rockwell Automation)",
  shortName: "Plex",
  category: "mrp",
  status: "not_configured",
  description: "Cloud-native smart manufacturing platform",
  authMethod: "API Key / OAuth 2.0",
  prerequisites: [
    "API credentials obtained from Plex admin",
    "Data Source calls configured for specific data",
  ],
  credentialFields: [
    { key: "cloudUrl", label: "Plex Cloud URL", type: "url", required: true },
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "companyCode", label: "Company Code", type: "text", required: true },
  ],
  syncModules: [
    { id: "inventory", name: "Inventory Transactions", direction: "inbound", frequency: "15min", enabled: false },
    { id: "production", name: "Production Monitoring", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "quality", name: "Quality Module", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "schedules", name: "Production Schedules", direction: "inbound", frequency: "daily", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const delmiaworks: IntegrationProvider = {
  id: "delmiaworks",
  name: "DELMIAworks",
  shortName: "DELMIA",
  category: "mrp",
  status: "not_configured",
  description: "Manufacturing ERP for mid-market manufacturers",
  authMethod: "API Key + Basic Auth",
  prerequisites: [
    "API access enabled in DELMIAworks admin",
    "Data extraction configured for work orders, inventory, quality",
  ],
  credentialFields: [
    { key: "serverUrl", label: "Server URL", type: "url", required: true },
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "database", label: "Company Database", type: "text", required: true },
  ],
  syncModules: [
    { id: "work_orders", name: "Work Orders", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "inventory", name: "Inventory", direction: "inbound", frequency: "15min", enabled: false },
    { id: "quality", name: "Quality Data", direction: "inbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// Accounting Providers

const quickbooks: IntegrationProvider = {
  id: "quickbooks",
  name: "QuickBooks Online",
  shortName: "QuickBooks",
  category: "accounting",
  status: "error",
  description: "Cloud accounting for invoices, bills, and financial reporting",
  authMethod: "OAuth 2.0",
  lastSync: "3 hours ago",
  errorRate: 100,
  connectedSince: "2026-01-10",
  prerequisites: [
    "App created on Intuit Developer portal",
    "OAuth redirect configured",
    "QuickBooks Online Plus or Advanced subscription",
  ],
  credentialFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "realmId", label: "Realm ID (Company ID)", type: "text", required: true },
    { key: "redirectUri", label: "Redirect URI", type: "url", required: true },
  ],
  syncModules: [
    { id: "invoices", name: "Sales Invoices", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "bills", name: "Purchase Bills", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "credit_memos", name: "Credit Memos (Claims)", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "payments", name: "Payment Status", direction: "inbound", frequency: "hourly", enabled: true },
    { id: "tax_codes", name: "Tax Codes", direction: "inbound", frequency: "daily", enabled: false },
  ],
  fieldMappings: [
    { hexaField: "order.total", providerField: "Invoice.TotalAmt", status: "mapped" },
    { hexaField: "customer.company", providerField: "Customer.DisplayName", status: "mapped" },
    { hexaField: "lineItem.unitPrice", providerField: "SalesItemLine.UnitPrice", status: "mapped" },
    { hexaField: "claim.creditAmount", providerField: "CreditMemo.TotalAmt", status: "mapped" },
  ],
  syncLogs: [
    { id: "qb1", timestamp: "2026-03-11T11:30:00Z", direction: "outbound", entityType: "Invoices", recordCount: 5, status: "failed", duration: "2.1s", errorMessage: "OAuth token expired. Please re-authenticate to refresh your QuickBooks connection." },
    { id: "qb2", timestamp: "2026-03-11T11:00:00Z", direction: "outbound", entityType: "Invoices", recordCount: 5, status: "failed", duration: "1.9s", errorMessage: "OAuth token expired. Please re-authenticate to refresh your QuickBooks connection." },
    { id: "qb3", timestamp: "2026-03-11T10:30:00Z", direction: "outbound", entityType: "Credit Memos", recordCount: 1, status: "failed", duration: "2.0s", errorMessage: "OAuth token expired. Please re-authenticate to refresh your QuickBooks connection." },
    { id: "qb4", timestamp: "2026-03-10T18:00:00Z", direction: "outbound", entityType: "Invoices", recordCount: 8, status: "success", duration: "3.4s" },
  ],
};

const xero: IntegrationProvider = {
  id: "xero",
  name: "Xero",
  shortName: "Xero",
  category: "accounting",
  status: "not_configured",
  description: "Cloud accounting with strong multi-currency support",
  authMethod: "OAuth 2.0 (PKCE)",
  prerequisites: [
    "App created in Xero Developer portal",
    "OAuth flow with scope selection completed",
    "Organization (tenant) selected",
  ],
  credentialFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "redirectUri", label: "Redirect URI", type: "url", required: true },
    { key: "tenantId", label: "Xero Tenant ID", type: "text" },
  ],
  syncModules: [
    { id: "invoices", name: "Invoices", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "purchase_orders", name: "Purchase Orders", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "credit_notes", name: "Credit Notes", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "contacts", name: "Contacts", direction: "bidirectional", frequency: "daily", enabled: false },
    { id: "payments", name: "Payments", direction: "inbound", frequency: "hourly", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const sageIntacct: IntegrationProvider = {
  id: "sage-intacct",
  name: "Sage Intacct",
  shortName: "Sage",
  category: "accounting",
  status: "not_configured",
  description: "Enterprise-grade cloud financial management",
  authMethod: "Web Services Credentials",
  prerequisites: [
    "Web Services user created in Sage Intacct",
    "Company access configured",
    "Sender ID and password registered",
  ],
  credentialFields: [
    { key: "companyId", label: "Company ID", type: "text", required: true },
    { key: "entityId", label: "Entity ID", type: "text" },
    { key: "userId", label: "User ID", type: "text", required: true },
    { key: "userPassword", label: "User Password", type: "password", required: true },
    { key: "senderId", label: "Sender ID", type: "text", required: true },
    { key: "senderPassword", label: "Sender Password", type: "password", required: true },
  ],
  syncModules: [
    { id: "invoices", name: "Sales Documents", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "purchase_docs", name: "Purchase Documents", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "adjustments", name: "AP Adjustments (Credits)", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "payments", name: "Payment Status", direction: "inbound", frequency: "hourly", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// E-commerce Providers

const shopify: IntegrationProvider = {
  id: "shopify",
  name: "Shopify",
  shortName: "Shopify",
  category: "ecommerce",
  status: "connected",
  description: "E-commerce and B2B catalog, orders, and inventory sync",
  authMethod: "Admin API Access Token",
  lastSync: "1 min ago",
  nextSync: "4 min",
  syncedRecords24h: 2_156,
  errorRate: 0,
  connectedSince: "2025-10-20",
  prerequisites: [
    "Custom app created in Shopify admin",
    "Admin API scopes configured (read_products, write_orders, read_inventory)",
    "Webhook endpoints registered for order events",
  ],
  credentialFields: [
    { key: "shopDomain", label: "Shop Domain", type: "text", placeholder: "yourstore.myshopify.com", required: true },
    { key: "apiKey", label: "API Key", type: "text", required: true },
    { key: "apiSecret", label: "API Secret Key", type: "password", required: true },
    { key: "accessToken", label: "Admin Access Token", type: "password", required: true },
    { key: "apiVersion", label: "API Version", type: "select", options: ["2026-01", "2025-10", "2025-07", "2025-04"], required: true },
  ],
  syncModules: [
    { id: "products", name: "Product Catalog", direction: "outbound", frequency: "hourly", enabled: true },
    { id: "orders", name: "Marketplace Orders", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "inventory", name: "Inventory Levels", direction: "outbound", frequency: "15min", enabled: true },
    { id: "fulfillment", name: "Fulfillment Updates", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "pricing", name: "B2B Pricing", direction: "outbound", frequency: "daily", enabled: false },
  ],
  fieldMappings: [
    { hexaField: "catalogSku", providerField: "Product.Variant.SKU", status: "mapped" },
    { hexaField: "product.name", providerField: "Product.Title", status: "mapped" },
    { hexaField: "product.unitPrice", providerField: "Product.Variant.Price", status: "mapped" },
    { hexaField: "lineItem.parsedQuantity", providerField: "LineItem.Quantity", status: "mapped" },
    { hexaField: "order.poNumber", providerField: "Order.PO_Number (metafield)", status: "custom" },
  ],
  syncLogs: [
    { id: "sh1", timestamp: "2026-03-11T14:34:00Z", direction: "outbound", entityType: "Inventory", recordCount: 342, status: "success", duration: "4.7s" },
    { id: "sh2", timestamp: "2026-03-11T14:22:00Z", direction: "inbound", entityType: "Orders", recordCount: 1, status: "success", duration: "0.3s" },
    { id: "sh3", timestamp: "2026-03-11T14:19:00Z", direction: "outbound", entityType: "Inventory", recordCount: 342, status: "success", duration: "4.5s" },
    { id: "sh4", timestamp: "2026-03-11T13:00:00Z", direction: "outbound", entityType: "Products", recordCount: 1847, status: "success", duration: "32.1s" },
  ],
};

const amazonSpApi: IntegrationProvider = {
  id: "amazon-sp-api",
  name: "Amazon Seller Central",
  shortName: "Amazon",
  category: "ecommerce",
  status: "not_configured",
  description: "Amazon marketplace orders, catalog, and FBA inventory",
  authMethod: "OAuth 2.0 + AWS IAM",
  prerequisites: [
    "Registered as Developer in Amazon Seller Central",
    "Selling Partner API application created",
    "AWS IAM role configured for API access",
    "Self-authorized or authorization from selling partner obtained",
  ],
  credentialFields: [
    { key: "clientId", label: "SP-API Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "refreshToken", label: "Refresh Token", type: "password", required: true },
    { key: "awsAccessKey", label: "AWS Access Key", type: "text", required: true },
    { key: "awsSecretKey", label: "AWS Secret Key", type: "password", required: true },
    { key: "roleArn", label: "Role ARN", type: "text", placeholder: "arn:aws:iam::123456:role/SellingPartner", required: true },
    { key: "marketplaceId", label: "Marketplace ID", type: "text", required: true },
  ],
  syncModules: [
    { id: "orders", name: "Marketplace Orders", direction: "inbound", frequency: "15min", enabled: false },
    { id: "catalog", name: "Catalog Items", direction: "outbound", frequency: "daily", enabled: false },
    { id: "inventory", name: "Inventory (FBA & MFN)", direction: "bidirectional", frequency: "hourly", enabled: false },
    { id: "fulfillment", name: "Fulfillment Outbound", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const bigcommerce: IntegrationProvider = {
  id: "bigcommerce",
  name: "BigCommerce",
  shortName: "BigCommerce",
  category: "ecommerce",
  status: "not_configured",
  description: "B2B e-commerce with customer groups and quote management",
  authMethod: "OAuth 2.0 / API Token",
  prerequisites: [
    "API Account created in BigCommerce admin",
    "OAuth scopes selected",
    "Store Hash available",
  ],
  credentialFields: [
    { key: "storeHash", label: "Store Hash", type: "text", required: true },
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "accessToken", label: "Access Token", type: "password", required: true },
  ],
  syncModules: [
    { id: "products", name: "Product Catalog", direction: "outbound", frequency: "daily", enabled: false },
    { id: "orders", name: "Orders", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "inventory", name: "Inventory", direction: "outbound", frequency: "15min", enabled: false },
    { id: "pricing", name: "Customer Group Pricing", direction: "outbound", frequency: "daily", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// Communication Providers

const microsoftOutlook: IntegrationProvider = {
  id: "microsoft-outlook",
  name: "Microsoft Outlook / 365",
  shortName: "Outlook",
  category: "communication",
  status: "connected",
  description: "Email monitoring for orders, RFQ responses, and claim communication",
  authMethod: "OAuth 2.0 (Azure AD / Graph API)",
  lastSync: "30 sec ago",
  nextSync: "Real-time",
  syncedRecords24h: 347,
  errorRate: 0,
  connectedSince: "2025-08-01",
  prerequisites: [
    "App registered in Azure Active Directory",
    "Microsoft Graph API permissions granted (Mail.Read, Mail.Send)",
    "Admin consent for organization-wide access",
    "Monitored mailbox address configured",
  ],
  credentialFields: [
    { key: "tenantId", label: "Azure AD Tenant ID", type: "text", required: true },
    { key: "clientId", label: "Application (Client) ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "mailbox", label: "Monitored Mailbox", type: "text", placeholder: "orders@yourcompany.com", required: true },
    { key: "redirectUri", label: "Redirect URI", type: "url", required: true },
  ],
  syncModules: [
    { id: "incoming_orders", name: "Incoming Order Emails", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "rfq_responses", name: "Supplier RFQ Responses", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "claim_emails", name: "Claim Emails", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "rfq_emails", name: "RFQ Emails", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "order_confirmations", name: "Order Confirmations", direction: "outbound", frequency: "realtime", enabled: true },
  ],
  fieldMappings: [
    { hexaField: "order.rawEmailBody", providerField: "Message.Body.Content", status: "mapped" },
    { hexaField: "order.attachments", providerField: "Message.Attachments", status: "mapped" },
    { hexaField: "customer.email", providerField: "Message.From.EmailAddress", status: "mapped" },
    { hexaField: "order.subject", providerField: "Message.Subject", status: "mapped" },
  ],
  syncLogs: [
    { id: "ol1", timestamp: "2026-03-11T14:35:00Z", direction: "inbound", entityType: "Emails Processed", recordCount: 3, status: "success", duration: "0.8s" },
    { id: "ol2", timestamp: "2026-03-11T14:20:00Z", direction: "outbound", entityType: "Claim Email", recordCount: 1, status: "success", duration: "1.2s" },
    { id: "ol3", timestamp: "2026-03-11T14:05:00Z", direction: "inbound", entityType: "Emails Processed", recordCount: 7, status: "success", duration: "2.1s" },
    { id: "ol4", timestamp: "2026-03-11T13:45:00Z", direction: "outbound", entityType: "Order Confirmation", recordCount: 2, status: "success", duration: "0.9s" },
  ],
};

const gmail: IntegrationProvider = {
  id: "gmail",
  name: "Gmail / Google Workspace",
  shortName: "Gmail",
  category: "communication",
  status: "not_configured",
  description: "Gmail-based order ingestion and communication",
  authMethod: "OAuth 2.0 (Google)",
  prerequisites: [
    "Project created in Google Cloud Console",
    "Gmail API enabled",
    "OAuth consent screen configured",
    "Domain-wide delegation set up (for server-to-server)",
  ],
  credentialFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "redirectUri", label: "Redirect URI", type: "url", required: true },
    { key: "emailAddress", label: "Gmail Address", type: "text", placeholder: "orders@yourcompany.com", required: true },
  ],
  syncModules: [
    { id: "incoming_orders", name: "Incoming Order Emails", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "claim_emails", name: "Claim Emails", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "rfq_emails", name: "RFQ Emails", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const slack: IntegrationProvider = {
  id: "slack",
  name: "Slack",
  shortName: "Slack",
  category: "communication",
  status: "not_configured",
  description: "Notifications, alerts, and approval workflows via Slack",
  authMethod: "OAuth 2.0 (Slack App)",
  prerequisites: [
    "Slack App created at api.slack.com",
    "Bot Token Scopes configured",
    "App installed to workspace",
  ],
  credentialFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "botToken", label: "Bot Token", type: "password", placeholder: "xoxb-...", required: true },
    { key: "signingSecret", label: "Signing Secret", type: "password", required: true },
    { key: "defaultChannel", label: "Default Notification Channel", type: "text", placeholder: "#hexa-alerts", required: true },
  ],
  syncModules: [
    { id: "procurement_alerts", name: "Procurement Alerts", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "claim_notifications", name: "Claim Notifications", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "order_updates", name: "Order Status Updates", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "approvals", name: "Approval Workflows", direction: "bidirectional", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const microsoftTeams: IntegrationProvider = {
  id: "microsoft-teams",
  name: "Microsoft Teams",
  shortName: "Teams",
  category: "communication",
  status: "not_configured",
  description: "Teams notifications, adaptive cards, and approval workflows",
  authMethod: "OAuth 2.0 (Azure AD / Bot Framework)",
  prerequisites: [
    "Bot registered in Azure Bot Service",
    "Teams app manifest created",
    "Messaging endpoint configured",
    "App installed in Teams",
  ],
  credentialFields: [
    { key: "tenantId", label: "Azure AD Tenant ID", type: "text", required: true },
    { key: "clientId", label: "Application (Client) ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "botId", label: "Bot ID", type: "text", required: true },
    { key: "teamId", label: "Team ID", type: "text", required: true },
    { key: "channelId", label: "Notification Channel ID", type: "text", required: true },
  ],
  syncModules: [
    { id: "procurement_alerts", name: "Procurement Alerts", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "claim_notifications", name: "Claim Notifications", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "approvals", name: "Approval Workflows", direction: "bidirectional", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// Shipping Providers

const ups: IntegrationProvider = {
  id: "ups",
  name: "UPS",
  shortName: "UPS",
  category: "shipping",
  status: "not_configured",
  description: "Shipping rates, labels, tracking, and proof of delivery",
  authMethod: "OAuth 2.0",
  prerequisites: [
    "App created on UPS Developer portal",
    "APIs added (Rating, Shipping, Tracking)",
    "Shipper account details available",
  ],
  credentialFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "accountNumber", label: "Account Number", type: "text", required: true },
    { key: "shipperNumber", label: "Shipper Number", type: "text", required: true },
  ],
  syncModules: [
    { id: "rates", name: "Rate Quotes", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "shipping", name: "Label Generation", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "tracking", name: "Tracking Updates", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "pod", name: "Proof of Delivery", direction: "inbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const fedex: IntegrationProvider = {
  id: "fedex",
  name: "FedEx",
  shortName: "FedEx",
  category: "shipping",
  status: "not_configured",
  description: "Shipping rates, labels, tracking, and pickup scheduling",
  authMethod: "OAuth 2.0",
  prerequisites: [
    "Project created on FedEx Developer portal",
    "API access registered (Rate, Ship, Track)",
    "Account and return address configured",
  ],
  credentialFields: [
    { key: "clientId", label: "API Key (Client ID)", type: "text", required: true },
    { key: "clientSecret", label: "Secret Key (Client Secret)", type: "password", required: true },
    { key: "accountNumber", label: "Account Number", type: "text", required: true },
  ],
  syncModules: [
    { id: "rates", name: "Rate Quotes", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "shipping", name: "Label Generation", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "tracking", name: "Tracking Updates", direction: "inbound", frequency: "hourly", enabled: false },
    { id: "pickup", name: "Pickup Scheduling", direction: "outbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const dhl: IntegrationProvider = {
  id: "dhl",
  name: "DHL",
  shortName: "DHL",
  category: "shipping",
  status: "not_configured",
  description: "International express, eCommerce, and parcel shipping",
  authMethod: "API Key / Basic Auth",
  prerequisites: [
    "Registered on DHL Developer Portal",
    "API Key obtained for specific services",
    "Account details configured",
  ],
  credentialFields: [
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "siteId", label: "Site ID (DHL Express)", type: "text", required: true },
    { key: "password", label: "Password", type: "password", required: true },
    { key: "accountNumber", label: "Account Number", type: "text", required: true },
    { key: "service", label: "Service Type", type: "select", options: ["DHL Express", "DHL eCommerce", "DHL Parcel", "DHL Freight"], required: true },
  ],
  syncModules: [
    { id: "rates", name: "Rate Requests", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "shipping", name: "Shipment Requests", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "tracking", name: "Tracking", direction: "inbound", frequency: "hourly", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

const shipstation: IntegrationProvider = {
  id: "shipstation",
  name: "ShipStation",
  shortName: "ShipStation",
  category: "shipping",
  status: "not_configured",
  description: "Multi-carrier shipping aggregator (UPS, FedEx, USPS, DHL, 60+)",
  authMethod: "API Key + Secret",
  prerequisites: [
    "API credentials generated in ShipStation Settings > API Settings",
    "Stores/marketplaces configured within ShipStation",
  ],
  credentialFields: [
    { key: "apiKey", label: "API Key", type: "text", required: true },
    { key: "apiSecret", label: "API Secret", type: "password", required: true },
  ],
  syncModules: [
    { id: "orders", name: "Orders", direction: "outbound", frequency: "realtime", enabled: false },
    { id: "shipments", name: "Shipment Updates", direction: "inbound", frequency: "15min", enabled: false },
    { id: "rates", name: "Rate Shopping", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "warehouses", name: "Warehouse Mapping", direction: "bidirectional", frequency: "daily", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [],
};

// Data Import/Export

const csvUpload: IntegrationProvider = {
  id: "csv-upload",
  name: "CSV Upload",
  shortName: "CSV Upload",
  category: "data",
  status: "connected",
  description: "Bulk import orders, catalog, customers, and inventory from CSV files",
  authMethod: "N/A",
  lastSync: "1 day ago",
  syncedRecords24h: 0,
  prerequisites: [],
  credentialFields: [],
  syncModules: [
    { id: "orders", name: "Orders Import", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "catalog", name: "Product Catalog Import", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "customers", name: "Customer Import", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "inventory", name: "Inventory Update", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "price_lists", name: "Price List Import", direction: "inbound", frequency: "realtime", enabled: false },
    { id: "suppliers", name: "Supplier List Import", direction: "inbound", frequency: "realtime", enabled: false },
  ],
  fieldMappings: [],
  syncLogs: [
    { id: "cu1", timestamp: "2026-03-10T09:00:00Z", direction: "inbound", entityType: "Product Catalog", recordCount: 1847, status: "success", duration: "12.3s" },
    { id: "cu2", timestamp: "2026-03-08T14:30:00Z", direction: "inbound", entityType: "Orders", recordCount: 45, status: "partial", duration: "3.1s", errorMessage: "2 rows skipped: missing required field 'SKU' in rows 23, 41" },
  ],
};

const csvDownload: IntegrationProvider = {
  id: "csv-download",
  name: "CSV Download",
  shortName: "CSV Export",
  category: "data",
  status: "connected",
  description: "Export orders, procurement, claims, and supplier data to CSV/Excel",
  authMethod: "N/A",
  prerequisites: [],
  credentialFields: [],
  syncModules: [
    { id: "orders", name: "Orders Export", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "line_items", name: "Line Items Export", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "procurement", name: "Procurement Queue Export", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "claims", name: "Claims & SLA Export", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "suppliers", name: "Supplier Scorecards Export", direction: "outbound", frequency: "realtime", enabled: true },
    { id: "inventory", name: "Inventory Snapshot Export", direction: "outbound", frequency: "realtime", enabled: true },
  ],
  fieldMappings: [],
  syncLogs: [
    { id: "cd1", timestamp: "2026-03-11T12:00:00Z", direction: "outbound", entityType: "Claims Export", recordCount: 234, status: "success", duration: "1.8s" },
    { id: "cd2", timestamp: "2026-03-11T09:00:00Z", direction: "outbound", entityType: "Orders Export", recordCount: 1247, status: "success", duration: "4.2s" },
  ],
};

const apiAccess: IntegrationProvider = {
  id: "api-access",
  name: "API Access",
  shortName: "REST API",
  category: "data",
  status: "connected",
  description: "Programmatic access to all Hexa data via REST API with webhook support",
  authMethod: "API Key (Bearer Token)",
  connectedSince: "2025-08-01",
  prerequisites: [],
  credentialFields: [
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "rateLimit", label: "Rate Limit", type: "text", placeholder: "1000 req/min" },
    { key: "ipAllowlist", label: "IP Allowlist", type: "text", placeholder: "e.g., 192.168.1.0/24" },
  ],
  syncModules: [
    { id: "orders_api", name: "Orders API", direction: "bidirectional", frequency: "realtime", enabled: true },
    { id: "products_api", name: "Products API", direction: "bidirectional", frequency: "realtime", enabled: true },
    { id: "inventory_api", name: "Inventory API", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "procurement_api", name: "Procurement API", direction: "bidirectional", frequency: "realtime", enabled: true },
    { id: "suppliers_api", name: "Suppliers API", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "claims_api", name: "Claims API", direction: "inbound", frequency: "realtime", enabled: true },
    { id: "webhooks", name: "Webhooks", direction: "outbound", frequency: "realtime", enabled: true },
  ],
  fieldMappings: [],
  syncLogs: [
    { id: "api1", timestamp: "2026-03-11T14:33:00Z", direction: "inbound", entityType: "GET /api/orders", recordCount: 1, status: "success", duration: "45ms" },
    { id: "api2", timestamp: "2026-03-11T14:30:00Z", direction: "outbound", entityType: "Webhook: order.created", recordCount: 1, status: "success", duration: "120ms" },
    { id: "api3", timestamp: "2026-03-11T14:28:00Z", direction: "inbound", entityType: "GET /api/inventory", recordCount: 1, status: "success", duration: "38ms" },
  ],
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const integrationCategories: IntegrationCategory[] = [
  {
    id: "erp",
    name: "ERP Systems",
    description: "Enterprise resource planning for inventory, orders, and financials",
    icon: "Database",
    providers: [sapS4Hana, oracleNetsuite, msDynamics365, epicorKinetic, inforCloudsuite],
  },
  {
    id: "crm",
    name: "CRM Systems",
    description: "Customer relationship management and sales pipeline",
    icon: "Users",
    providers: [salesforce, hubspot, msDynamicsCrm, zohoCrm],
  },
  {
    id: "wms",
    name: "Warehouse Management",
    description: "Real-time inventory positions, fulfillment, and receiving",
    icon: "Warehouse",
    providers: [manhattanAssociates, blueYonder, sapEwm, oracleWms],
  },
  {
    id: "mrp",
    name: "Manufacturing & MRP",
    description: "Production planning, scheduling, BOMs, and quality management",
    icon: "Factory",
    providers: [sapPP, oracleManufacturing, plexRockwell, delmiaworks],
  },
  {
    id: "accounting",
    name: "Accounting & Finance",
    description: "Invoices, purchase bills, credit notes, and payment tracking",
    icon: "Calculator",
    providers: [quickbooks, xero, sageIntacct],
  },
  {
    id: "ecommerce",
    name: "E-commerce & Marketplace",
    description: "Product catalog sync, marketplace orders, and fulfillment",
    icon: "ShoppingBag",
    providers: [shopify, amazonSpApi, bigcommerce],
  },
  {
    id: "communication",
    name: "Communication",
    description: "Email monitoring, notifications, and approval workflows",
    icon: "Mail",
    providers: [microsoftOutlook, gmail, slack, microsoftTeams],
  },
  {
    id: "shipping",
    name: "Shipping & Logistics",
    description: "Rates, labels, tracking, and proof of delivery",
    icon: "Package",
    providers: [ups, fedex, dhl, shipstation],
  },
  {
    id: "data",
    name: "Data Import / Export",
    description: "CSV upload, export, and programmatic API access",
    icon: "FileSpreadsheet",
    providers: [csvUpload, csvDownload, apiAccess],
  },
];

export const allProviders: IntegrationProvider[] = integrationCategories.flatMap(
  (c) => c.providers
);
