export const blogPosts = [
    {
        id: "1",
        title: "How AI Agents Are Changing Business Automation",
        slug: "ai-agents-business-automation",
        excerpt: "Explore how modern AI agents are revolutionizing the way businesses handle repetitive workflows and decision-making.",
        content: `
      <h2>Introduction</h2>
      <p>AI agents are no longer science fiction. In 2026, they are the backbone of modern business automation. From handling customer queries to orchestrating complex multi-step workflows, AI agents are transforming how companies operate.</p>
      
      <h2>What Are AI Agents?</h2>
      <p>Unlike simple chatbots, AI agents can plan, reason, and take actions autonomously. They can browse the web, write code, send emails, and interact with APIs — all without human intervention.</p>
      
      <h2>Real Business Impact</h2>
      <p>Companies using AI agents report up to 60% reduction in manual processing time and significant cost savings in operations. At JANTRA, we have helped clients deploy AI agents that handle thousands of tasks daily.</p>
      
      <h2>Getting Started</h2>
      <p>The best way to start is with a small, well-defined workflow. Pick one repetitive process in your business and automate it with an AI agent. Then scale from there.</p>
      
      <h2>Conclusion</h2>
      <p>AI agents are not replacing humans — they are freeing humans to focus on creative and strategic work. The future belongs to businesses that embrace this shift early.</p>
    `,
        category: "AI",
        tags: ["AI", "Automation", "Business"],
        readTime: 5,
        publishedAt: "2026-03-01",
        author: {
            name: "JANTRA Team",
            role: "Engineering Team",
            avatar: ""
        },
        featured: true
    },
    {
        id: "2",
        title: "Building Scalable SaaS Products in 2026",
        slug: "building-scalable-saas-2026",
        excerpt: "Key architectural decisions that make or break SaaS products when scaling to thousands of users.",
        content: `
      <h2>Introduction</h2>
      <p>Building a SaaS product is one thing. Building one that scales is another. In this article we share lessons learned from shipping multiple SaaS products at JANTRA.</p>
      
      <h2>Database Architecture</h2>
      <p>The most critical decision is your database strategy. Multi-tenant databases with proper row-level security, connection pooling, and read replicas are essential from day one.</p>
      
      <h2>API Design</h2>
      <p>Design your API with versioning from the start. Use REST for simplicity or GraphQL for flexibility — but be consistent. Document everything with OpenAPI specs.</p>
      
      <h2>Authentication and Security</h2>
      <p>Never build auth from scratch. Use proven solutions and focus on your core product. Implement proper rate limiting and audit logging from the beginning.</p>
      
      <h2>Monitoring</h2>
      <p>You cannot improve what you cannot measure. Set up error tracking, performance monitoring, and business metrics dashboards before you launch.</p>
    `,
        category: "Software",
        tags: ["SaaS", "Architecture", "Scaling"],
        readTime: 7,
        publishedAt: "2026-02-15",
        author: {
            name: "JANTRA Team",
            role: "Engineering Team",
            avatar: ""
        },
        featured: false
    },
    {
        id: "3",
        title: "Why Agentic Workflows Are the Future",
        slug: "agentic-workflows-future",
        excerpt: "The shift from simple rule-based automation to intelligent agentic systems that can reason and adapt.",
        content: `
      <h2>Introduction</h2>
      <p>Traditional automation follows rigid rules. Agentic workflows are different — they can reason about problems, adapt to new situations, and make decisions like a human would.</p>
      
      <h2>The Difference</h2>
      <p>A traditional automation says: if email contains X, do Y. An agentic workflow says: understand this email, decide the best response, check the CRM, draft a reply, and send it — all autonomously.</p>
      
      <h2>Real Examples</h2>
      <p>We built an agentic workflow for a logistics client that reduced processing errors by 98%. The agent reads shipment data, detects anomalies, reroutes automatically, and notifies the right people — all in seconds.</p>
      
      <h2>How to Implement</h2>
      <p>Start with LangChain or CrewAI for your agent framework. Use OpenAI GPT-4 as the reasoning engine. Connect your existing tools via API. Test extensively before deploying to production.</p>
    `,
        category: "Automation",
        tags: ["Automation", "AI", "Workflows"],
        readTime: 4,
        publishedAt: "2026-02-01",
        author: {
            name: "JANTRA Team",
            role: "Engineering Team",
            avatar: ""
        },
        featured: false
    }
]

export const getBlogPostBySlug = (slug: string) =>
    blogPosts.find(p => p.slug === slug)

export const getFeaturedPost = () =>
    blogPosts.find(p => p.featured)

export const getAllPosts = () => blogPosts
