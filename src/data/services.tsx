import { 
    CheckCircle2, LayoutTemplate, Layers, Cpu, ShieldCheck, Mail,
    Code2, Smartphone, Terminal, Activity, FileJson, Sparkles, Workflow, Zap, Database, Cloud, Palette, ChevronDown
} from "lucide-react";
import React from "react";

export type ServiceDetail = {
    title: string;
    category: string;
    lottie: string;
    description: string;
    descBg: string;
    demoUrl?: string;
    banner?: string;
    
    // Custom rich elements per service
    longDescription: string;
    deliverables: Array<{
        title: string;
        desc: string;
        icon: string;
    }>;
    process: Array<{
        num: string;
        title: string;
        desc: string;
    }>;
    techStack: string[];
    faqs: Array<{
        question: string;
        answer: string;
    }>;
};

// Dynamic icon mapper helper
export const IconHelper = ({ name, className }: { name: string; className?: string }) => {
    switch (name) {
        case "layout": return <LayoutTemplate className={className} />;
        case "layers": return <Layers className={className} />;
        case "shield": return <ShieldCheck className={className} />;
        case "code": return <Code2 className={className} />;
        case "phone": return <Smartphone className={className} />;
        case "terminal": return <Terminal className={className} />;
        case "activity": return <Activity className={className} />;
        case "json": return <FileJson className={className} />;
        case "sparkles": return <Sparkles className={className} />;
        case "workflow": return <Workflow className={className} />;
        case "zap": return <Zap className={className} />;
        case "database": return <Database className={className} />;
        case "cloud": return <Cloud className={className} />;
        case "palette": return <Palette className={className} />;
        default: return <CheckCircle2 className={className} />;
    }
};

export const serviceDataMap: Record<string, ServiceDetail> = {
    "custom-software-development": { 
        title: "Custom Software", 
        category: "Engineering", 
        lottie: "/lottie/software-development-green.json", 
        description: "Bespoke software solutions built for scale and performance. We engineer systems that fit your exact business logic.", 
        descBg: "bg-orange-50/40",
        longDescription: "We design and develop tailor-made software applications that align perfectly with your operations. From complex internal dashboards and database integrations to enterprise-grade web portals, we ensure your software is fast, secure, and ready to scale.",
        deliverables: [
            { title: "Discovery Scopes", desc: "Deep dive into your business logic, mapping data schemas and visual wireframes.", icon: "layout" },
            { title: "Custom API Architecture", desc: "High-throughput REST/GraphQL APIs connecting frontend engines with backends.", icon: "json" },
            { title: "Scalable Codebases", desc: "Fully typed code with exhaustive developer documentation and clean module borders.", icon: "code" }
        ],
        process: [
            { num: "01", title: "Technical Scoping", desc: "Conduct architectural planning sessions to map exact software boundaries." },
            { num: "02", title: "Sprints & Review", desc: "Iterative development cycles with bi-weekly live demos and code adjustments." },
            { num: "03", title: "Security Hardening", desc: "Comprehensive pen-testing, authentication audits, and load testing runs." },
            { num: "04", title: "Production Go-Live", desc: "Zero-downtime containerized deployments with active performance alerts." }
        ],
        techStack: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
        faqs: [
            { question: "How do you handle project handover?", answer: "We provide complete source code ownership, full deployment manifests (Docker/Kubernetes), API documentation, and direct developer training during handover." },
            { question: "Can you integrate with our legacy databases?", answer: "Yes. We specialize in building secure gateway APIs and data sync adapters that interface seamlessly with older systems without disrupting your active business workflows." },
            { question: "What is your approach to security?", answer: "We use industry-standard authentication (OAuth/JWT), sanitize all inputs to prevent XSS/SQL Injection, implement Row Level Security (RLS) on database layers, and conduct routine dependency vulnerability audits." }
        ]
    },
    "mobile-app-development": { 
        title: "Mobile Apps", 
        category: "Product", 
        lottie: "/lottie/mobile-app-promo/animations/12345.json", 
        description: "High-performance native and cross-platform mobile applications for iOS and Android.", 
        descBg: "bg-blue-50/40",
        longDescription: "Deliver premium mobile experiences that load instantly and work flawlessly. We build responsive iOS and Android applications utilizing modern cross-platform engines or native swift/kotlin codebases with full offline support and hardware integrations.",
        deliverables: [
            { title: "UI/UX Prototypes", desc: "Fidelity design layouts engineered for thumbs, gestures, and smooth framerates.", icon: "palette" },
            { title: "Offline Sync Engine", desc: "Robust local database caching that updates automatically when connections restore.", icon: "database" },
            { title: "Store Submissions", desc: "Complete setup of Apple App Store and Google Play Store listings with compliance audits.", icon: "phone" }
        ],
        process: [
            { num: "01", title: "Interface Mapping", desc: "Wireframing tactile touch states, gestures, and application transitions." },
            { num: "02", title: "Hybrid/Native Build", desc: "Developing modular application flows using React Native or Native SDKs." },
            { num: "03", title: "Devices Simulation", desc: "Simulating layouts across 40+ dynamic screen sizes, aspect ratios, and OS levels." },
            { num: "04", title: "Store Compliance", desc: "Navigating App Store metadata requirements, privacy policies, and launch approval steps." }
        ],
        techStack: ["React Native", "Expo", "Swift", "Kotlin", "Firebase", "Redux", "GraphQL"],
        faqs: [
            { question: "Do you build for both iOS and Android simultaneously?", answer: "Yes. We primarily leverage React Native and Expo to build a single, highly performant codebase that compiles to both platforms natively, reducing costs and timelines by 40%." },
            { question: "Will the app work offline?", answer: "Absolutely. We heavily utilize SQLite or WatermelonDB to construct persistent local storage layers, allowing the application to function completely offline and sync silently when reconnected." },
            { question: "Do you manage the App Store release?", answer: "Yes. We handle the entire release pipeline, including certificate generation, TestFlight deployments for beta testers, metadata preparation, and direct correspondence with Apple/Google reviewers." }
        ]
    },
    "saas-product-development": { 
        title: "SaaS Products", 
        category: "Platform", 
        lottie: "/lottie/saas.json", 
        description: "Subscription-based platforms with multi-tenant architectures and automated billing cycles.", 
        descBg: "bg-fuchsia-50/40",
        longDescription: "Transform your industry knowledge into a scalable software product. We build complete SaaS platforms featuring secure multi-tenant user isolation, complex subscription billing logic, and beautiful administrative dashboards.",
        deliverables: [
            { title: "Multi-Tenant Logic", desc: "Data architectures isolating accounts, user roles, and organizational permissions.", icon: "layers" },
            { title: "Billing Orchestration", desc: "Stripe/Paddle integrations handling metered usage, trials, and pro-rated upgrades.", icon: "zap" },
            { title: "Analytics Dashboards", desc: "Real-time usage charts, data tables, and CSV exports for your product's administrators.", icon: "activity" }
        ],
        process: [
            { num: "01", title: "Product Blueprinting", desc: "Defining core MVP feature loops, user personas, and subscription tiers." },
            { num: "02", title: "Auth & Core Engines", desc: "Building the underlying user identity providers and payment gateway hooks." },
            { num: "03", title: "Interface Polishing", desc: "Creating addictive, responsive frontend experiences using modern design systems." },
            { num: "04", title: "Beta & Scaling", desc: "Launching to an initial cohort, tracking error logs, and scaling the infrastructure." }
        ],
        techStack: ["Next.js", "Tailwind CSS", "Prisma", "Stripe", "Supabase", "Vercel", "Resend"],
        faqs: [
            { question: "How do you handle multi-tenant data privacy?", answer: "We implement Row Level Security (RLS) directly at the database level. Even if an API flaw occurs, queries are cryptographically blocked from fetching another tenant's data." },
            { question: "Can we track user behavior in the SaaS?", answer: "Yes. We integrate post-hog or custom event tracking layers. You can monitor exactly which features are adopted, track session durations, and analyze conversion funnels." },
            { question: "What happens if a user's subscription fails?", answer: "We configure automated webhook listeners. If a payment fails, the system automatically triggers dunning emails, gracefully restricts account access, and prompts for payment updates without manual intervention." }
        ]
    },
    "ai-agent-development": { 
        title: "AI Agents", 
        category: "AI & ML", 
        lottie: "/lottie/ai-assistant-animation.json", 
        description: "Autonomous AI agents that execute complex business tasks 24/7. Transform operational efficiency.", 
        descBg: "bg-purple-50/40",
        longDescription: "Step beyond simple chat assistants. We build goal-driven AI agents capable of calling custom APIs, parsing complex documents, executing background database workflows, and coordinating autonomously to solve operational bottlenecks.",
        deliverables: [
            { title: "Logic Orchestrator", desc: "Multi-agent systems leveraging structured prompting and memory states.", icon: "sparkles" },
            { title: "Dynamic RAG Pipelines", desc: "Vector search systems that inject proprietary data into LLM contexts in real-time.", icon: "database" },
            { title: "Performance Monitor", desc: "Rigorous logging of token consumption, response latencies, and agent accuracy.", icon: "activity" }
        ],
        process: [
            { num: "01", title: "Prompt Profiling", desc: "Documenting exact roles, tools, safety parameters, and expected agent outputs." },
            { num: "02", title: "Model Fine-Tuning", desc: "Injecting custom data stores, indexes, and vector embeddings into context paths." },
            { num: "03", title: "Sandbox Testing", desc: "Running parallel simulations to measure task accuracy and resolve logical loops." },
            { num: "04", title: "Orchestration Launch", desc: "Connecting active agent loops to your primary business tools and alert channels." }
        ],
        techStack: ["Python", "LangChain", "OpenAI", "Anthropic", "Pinecone", "pgvector", "FastAPI"],
        faqs: [
            { question: "How do you prevent AI hallucinations?", answer: "We enforce strict Retrieval-Augmented Generation (RAG) and validate outputs against structural JSON schemas, limiting agent responses to verified source documents." },
            { question: "Are our corporate data records secure?", answer: "Yes. We configure private VPC access to model endpoints and implement secure data isolation, ensuring your business records are never used for public model training." },
            { question: "What APIs can these agents connect with?", answer: "They can connect with any REST, GraphQL, or database API. We commonly build integrations for Slack, email systems, CRMs (HubSpot/Salesforce), and internal databases." }
        ]
    },
    "workflow-automation": { 
        title: "Automation", 
        category: "Optimization", 
        lottie: "/lottie/live_chatbot.json", 
        description: "Eliminate manual operational bottlenecks with intelligent, end-to-end automated workflows.", 
        descBg: "bg-emerald-50/40",
        longDescription: "Connect your scattered software ecosystem into a single unified workspace. We automate repetitive data syncs, invoice generations, customer alerts, and report updates so your team can focus on creative operations.",
        deliverables: [
            { title: "Event Listeners", desc: "Real-time webhooks that trigger instantly upon software events or database rows changing.", icon: "zap" },
            { title: "Data Transformers", desc: "Middleware scripts that parse, format, and translate data structures between incompatible platforms.", icon: "workflow" },
            { title: "Error Dead-Lettering", desc: "Failsafe mechanisms that catch API timeouts, log the failed payload, and alert administrators.", icon: "shield" }
        ],
        process: [
            { num: "01", title: "Bottleneck Auditing", desc: "Identifying the manual operations draining the most administrative time." },
            { num: "02", title: "API Mapping", desc: "Reviewing endpoint documentation for the software systems we need to bridge." },
            { num: "03", title: "Logic Scripting", desc: "Writing the secure backend functions that handle the active data transfer." },
            { num: "04", title: "Live Simulation", desc: "Running test payloads through the pipeline to ensure 100% data fidelity before production." }
        ],
        techStack: ["Node.js", "AWS Lambda", "Make.com", "Zapier", "Webhooks", "Puppeteer", "Cron Jobs"],
        faqs: [
            { question: "Is this built with Zapier or custom code?", answer: "We recommend the right tool for the job. For simple bridging, we utilize robust no-code platforms like Make or Zapier. For high-throughput or complex parsing, we build custom serverless functions on AWS Lambda." },
            { question: "What happens if a connected API goes down?", answer: "We engineer resilient pipelines. If an external service is unreachable, our automation gracefully pauses, queues the pending tasks, and attempts automatic retries using exponential backoff strategies." },
            { question: "Can automation handle physical documents?", answer: "Yes. By integrating OCR (Optical Character Recognition) APIs, we can create workflows that automatically read incoming PDF invoices, extract key text figures, and insert them directly into your accounting software." }
        ]
    }
};
