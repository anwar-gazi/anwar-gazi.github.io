// Minimal CV data object for client-side rendering
(function () {
  const cv = {
    name: 'Minhajul Anwar',
    title: 'Senior Backend / Full-Stack Engineer – Payments, SaaS, GovTech',
    contact: {
      phone: '+880 1716-734974',
      email: 'minhaj.me.bd@gmail.com',
      location: 'Dhaka, Bangladesh',
      links: {
        github: 'https://github.com/anwar-gazi',
        portfolio: 'https://anwar-gazi.github.io',
      },
    },
    summary:
      'Senior software engineer with ~8+ years designing, building, and debugging production systems across fintech, GovTech, logistics, and digital media. Backend-focused (Node.js, PHP/Laravel, Python) with modern frontends (React/Next.js, Vue), strong SQL foundations, payment integrations, multi-tenant SaaS, and production hardening via caching, observability mindset, and secure integrations.',
    skills: {
      backend: [
        'Node.js (Express/microservice-style APIs)',
        'PHP (Laravel)',
        'Python (Django, Flask)',
        'REST APIs',
        'Background jobs & webhooks',
        'Secure integrations',
        'Async workflows',
      ],
      frontend: [
        'React',
        'Next.js',
        'Vue.js',
        'TypeScript/JavaScript (ES6+)',
        'HTML5/CSS3',
        'Responsive layouts',
        'SPA dashboards',
      ],
      data: [
        'PostgreSQL',
        'MySQL',
        'MongoDB (working proficiency)',
        'Redis',
        'Schema design & migrations',
        'Indexes & query optimization',
        'Reporting queries',
        'Multi-tenant data patterns',
      ],
      messaging: ['Kafka', 'RabbitMQ', 'Payment gateways', 'Twilio', 'Asterisk', '3rd-party APIs, webhooks/callbacks'],
      architecture: [
        'Monoliths and microservice-style backends',
        'Multi-tenant SaaS',
        'Docker/Docker Compose',
        'Linux (CentOS/Debian)',
        'Nginx',
        'Git/GitHub',
        'CI-friendly workflows',
      ],
      quality: [
        'Defensive coding for payments/GovTech',
        'Input validation',
        'OWASP basics',
        'Secure secret handling',
        'Log-driven debugging',
        'Code review & refactoring',
      ],
      waysOfWorking: [
        'System design & architecture discussions',
        'Mentoring and code review',
        'Agile/Scrum',
        'Collaborating with product and non-technical stakeholders',
      ],
    },
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'AmiProbashi (BanglaTrac Group)',
        location: 'Dhaka, Bangladesh',
        period: '2025',
        bullets: [
          'Delivered critical fixes and features for a national migrant GovTech SaaS (~7M records) in Laravel/Vue/MySQL.',
          'Stabilised core workflows and protected a multi-year government revenue channel.',
        ],
      },
      {
        title: 'Senior Software Engineer',
        company: 'Doptor Ltd',
        location: 'Dhaka, Bangladesh',
        period: '2023 – 2025',
        bullets: [
          'Led development of a multi-tenant news portal SaaS using Next.js, TypeScript, Laravel, MongoDB, and MySQL.',
          'Launched multiple media tenants and streamlined go-live for new publishers.',
        ],
      },
      {
        title: 'Senior Software Engineer',
        company: 'ShurjoPay Ltd. (Payment Gateway)',
        location: 'Dhaka, Bangladesh',
        period: '2022',
        bullets: [
          'Resolved a critical payment gateway failure in a PHP/Laravel/Vue/MySQL platform.',
          'Restored stable card-on-file payments and enabled growth in customer acquisition and partner trust.',
        ],
      },
      {
        title: 'Software Engineer',
        company: 'Concitus.com',
        location: 'Dhaka, Bangladesh',
        period: '2017 – 2020',
        bullets: [
          'Built logistics, healthcare, and IVR systems including a freight forwarding portal (Django/React/PostgreSQL).',
          'Delivered Twilio/Asterisk IVR flows that reduced manual support workload.',
        ],
      },
    ],
    domains: [
      'FinTech & payments',
      'GovTech & public-sector SaaS',
      'Digital media & publishing',
      'Logistics & freight forwarding',
      'Telephony/IVR',
      'Healthcare operations',
    ],
    education: [
      {
        school: 'Bangladesh University of Engineering and Technology (BUET)',
        location: 'Dhaka, Bangladesh',
        degree: 'BSc, Mechanical Engineering',
        period: '2007 – 2012',
      },
    ],
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.cvData = cv;
  } else if (typeof globalThis !== 'undefined') {
    globalThis.cvData = cv;
  }
})();
