/**
 * Skill and role vocabulary for the profile tech-stack editor.
 *
 * Grouped so the typeahead can show where a suggestion comes from, and so a
 * broad term ("full stack") can pull in the concrete technologies that usually
 * come with it — typing "full" should offer "Full Stack Developer" and the
 * stack behind it, not just an exact string match.
 *
 * Automotive and Mercedes-specific engineering terms sit alongside the general
 * software ones because this platform serves both sides of PT-TH.
 */

export interface SkillEntry {
  /** Canonical label added to the profile. */
  name: string;
  group: string;
  /** Extra search terms — abbreviations, alternative spellings, related roles. */
  aliases?: string[];
}

export const SKILL_CATALOGUE: SkillEntry[] = [
  // ── Roles and disciplines ───────────────────────────────────────────────
  { name: 'Full Stack Developer', group: 'Role', aliases: ['fullstack', 'full stack', 'full-stack', 'web developer'] },
  { name: 'Frontend Developer', group: 'Role', aliases: ['front end', 'front-end', 'ui developer', 'web'] },
  { name: 'Backend Developer', group: 'Role', aliases: ['back end', 'back-end', 'server side', 'api developer'] },
  { name: 'Mobile Developer', group: 'Role', aliases: ['ios', 'android', 'app developer'] },
  { name: 'DevOps Engineer', group: 'Role', aliases: ['devops', 'sre', 'site reliability', 'platform engineer'] },
  { name: 'Cloud Architect', group: 'Role', aliases: ['cloud', 'solution architect', 'infrastructure architect'] },
  { name: 'Data Engineer', group: 'Role', aliases: ['data', 'etl', 'pipeline engineer'] },
  { name: 'Data Scientist', group: 'Role', aliases: ['data science', 'analytics', 'statistics'] },
  { name: 'AI / ML Engineer', group: 'Role', aliases: ['ai', 'ml', 'machine learning', 'deep learning'] },
  { name: 'QA / Test Engineer', group: 'Role', aliases: ['qa', 'testing', 'quality assurance', 'sdet'] },
  { name: 'Security Engineer', group: 'Role', aliases: ['security', 'appsec', 'infosec', 'cyber'] },
  { name: 'Embedded Engineer', group: 'Role', aliases: ['embedded', 'firmware', 'ecu'] },
  { name: 'Systems Engineer', group: 'Role', aliases: ['systems', 'integration'] },
  { name: 'UX / UI Designer', group: 'Role', aliases: ['ux', 'ui', 'design', 'product design'] },
  { name: 'Product Manager', group: 'Role', aliases: ['pm', 'product owner', 'po'] },
  { name: 'Project Manager', group: 'Role', aliases: ['pmp', 'delivery manager', 'programme manager'] },
  { name: 'Business Analyst', group: 'Role', aliases: ['ba', 'requirements'] },
  { name: 'Simulation & CAE Engineer', group: 'Role', aliases: ['cae', 'simulation', 'fea', 'cfd'] },
  { name: 'Calibration Engineer', group: 'Role', aliases: ['calibration', 'powertrain controls'] },
  { name: 'Functional Safety Engineer', group: 'Role', aliases: ['safety', 'asil', 'iso 26262'] },

  // ── Languages ───────────────────────────────────────────────────────────
  { name: 'JavaScript', group: 'Language', aliases: ['js', 'ecmascript', 'full stack', 'frontend'] },
  { name: 'TypeScript', group: 'Language', aliases: ['ts', 'full stack', 'frontend'] },
  { name: 'Python', group: 'Language', aliases: ['py', 'data', 'ml', 'scripting'] },
  { name: 'Java', group: 'Language', aliases: ['jvm', 'backend'] },
  { name: 'Kotlin', group: 'Language', aliases: ['android', 'jvm'] },
  { name: 'C', group: 'Language', aliases: ['embedded'] },
  { name: 'C++', group: 'Language', aliases: ['cpp', 'embedded', 'autosar'] },
  { name: 'C#', group: 'Language', aliases: ['csharp', 'dotnet', '.net'] },
  { name: 'Go', group: 'Language', aliases: ['golang', 'backend'] },
  { name: 'Rust', group: 'Language', aliases: ['systems programming'] },
  { name: 'Swift', group: 'Language', aliases: ['ios', 'mobile'] },
  { name: 'Ruby', group: 'Language', aliases: ['rails'] },
  { name: 'PHP', group: 'Language', aliases: ['laravel', 'web'] },
  { name: 'Scala', group: 'Language', aliases: ['jvm', 'spark'] },
  { name: 'R', group: 'Language', aliases: ['statistics', 'data'] },
  { name: 'Bash / Shell', group: 'Language', aliases: ['shell', 'scripting', 'zsh'] },
  { name: 'SQL', group: 'Language', aliases: ['queries', 'database', 'data'] },
  { name: 'MATLAB', group: 'Language', aliases: ['matlab', 'simulation'] },

  // ── Frontend ────────────────────────────────────────────────────────────
  { name: 'React', group: 'Frontend', aliases: ['reactjs', 'full stack', 'frontend', 'hooks'] },
  { name: 'Next.js', group: 'Frontend', aliases: ['nextjs', 'ssr', 'react', 'full stack'] },
  { name: 'Vue.js', group: 'Frontend', aliases: ['vue', 'nuxt', 'frontend'] },
  { name: 'Angular', group: 'Frontend', aliases: ['angularjs', 'frontend'] },
  { name: 'Svelte', group: 'Frontend', aliases: ['sveltekit', 'frontend'] },
  { name: 'HTML / CSS', group: 'Frontend', aliases: ['html', 'css', 'markup', 'frontend'] },
  { name: 'Tailwind CSS', group: 'Frontend', aliases: ['tailwind', 'css', 'frontend'] },
  { name: 'Redux', group: 'Frontend', aliases: ['state management', 'react'] },
  { name: 'React Native', group: 'Frontend', aliases: ['mobile', 'cross platform'] },
  { name: 'Flutter', group: 'Frontend', aliases: ['dart', 'mobile', 'cross platform'] },
  { name: 'Accessibility (WCAG)', group: 'Frontend', aliases: ['a11y', 'wcag', 'accessible'] },

  // ── Backend & APIs ──────────────────────────────────────────────────────
  { name: 'Node.js', group: 'Backend', aliases: ['node', 'nodejs', 'full stack', 'backend'] },
  { name: 'Express', group: 'Backend', aliases: ['expressjs', 'node', 'api'] },
  { name: 'NestJS', group: 'Backend', aliases: ['nest', 'node', 'backend'] },
  { name: 'Spring Boot', group: 'Backend', aliases: ['spring', 'java', 'backend'] },
  { name: 'Django', group: 'Backend', aliases: ['python', 'backend'] },
  { name: 'FastAPI', group: 'Backend', aliases: ['python', 'api', 'backend'] },
  { name: 'Flask', group: 'Backend', aliases: ['python', 'backend'] },
  { name: '.NET', group: 'Backend', aliases: ['dotnet', 'csharp', 'backend'] },
  { name: 'REST APIs', group: 'Backend', aliases: ['rest', 'api', 'http'] },
  { name: 'GraphQL', group: 'Backend', aliases: ['apollo', 'api'] },
  { name: 'gRPC', group: 'Backend', aliases: ['protobuf', 'rpc', 'api'] },
  { name: 'Microservices', group: 'Backend', aliases: ['distributed systems', 'architecture'] },
  { name: 'WebSockets', group: 'Backend', aliases: ['realtime', 'socket.io'] },

  // ── Data & storage ──────────────────────────────────────────────────────
  { name: 'PostgreSQL', group: 'Data', aliases: ['postgres', 'psql', 'database', 'sql'] },
  { name: 'MySQL', group: 'Data', aliases: ['mariadb', 'database', 'sql'] },
  { name: 'MongoDB', group: 'Data', aliases: ['mongo', 'nosql', 'database'] },
  { name: 'Redis', group: 'Data', aliases: ['cache', 'key value'] },
  { name: 'Elasticsearch', group: 'Data', aliases: ['elastic', 'search', 'opensearch'] },
  { name: 'Kafka', group: 'Data', aliases: ['streaming', 'events', 'pubsub'] },
  { name: 'Spark', group: 'Data', aliases: ['pyspark', 'big data'] },
  { name: 'Airflow', group: 'Data', aliases: ['orchestration', 'dags', 'pipelines'] },
  { name: 'dbt', group: 'Data', aliases: ['analytics engineering', 'transformations'] },
  { name: 'Snowflake', group: 'Data', aliases: ['data warehouse', 'warehouse'] },
  { name: 'Databricks', group: 'Data', aliases: ['lakehouse', 'spark'] },
  { name: 'Data Pipelines', group: 'Data', aliases: ['etl', 'elt', 'ingestion'] },
  { name: 'Power BI', group: 'Data', aliases: ['bi', 'reporting', 'dashboards'] },
  { name: 'Tableau', group: 'Data', aliases: ['bi', 'visualisation'] },
  { name: 'Telemetry Analytics', group: 'Data', aliases: ['telemetry', 'vehicle data'] },

  // ── Cloud & platform ────────────────────────────────────────────────────
  { name: 'AWS', group: 'Cloud', aliases: ['amazon web services', 'ec2', 's3', 'cloud'] },
  { name: 'Azure', group: 'Cloud', aliases: ['microsoft azure', 'aks', 'cloud'] },
  { name: 'Google Cloud', group: 'Cloud', aliases: ['gcp', 'cloud'] },
  { name: 'Kubernetes', group: 'Cloud', aliases: ['k8s', 'eks', 'aks', 'gke', 'orchestration'] },
  { name: 'Docker', group: 'Cloud', aliases: ['containers', 'containerisation'] },
  { name: 'Terraform', group: 'Cloud', aliases: ['iac', 'infrastructure as code', 'hcl'] },
  { name: 'Helm', group: 'Cloud', aliases: ['kubernetes', 'charts'] },
  { name: 'Ansible', group: 'Cloud', aliases: ['configuration management', 'iac'] },
  { name: 'CI/CD', group: 'Cloud', aliases: ['pipelines', 'continuous integration', 'continuous delivery'] },
  { name: 'GitHub Actions', group: 'Cloud', aliases: ['ci', 'workflows', 'actions'] },
  { name: 'GitLab CI', group: 'Cloud', aliases: ['ci', 'pipelines'] },
  { name: 'Jenkins', group: 'Cloud', aliases: ['ci', 'build server'] },
  { name: 'Linux', group: 'Cloud', aliases: ['unix', 'ubuntu', 'rhel'] },
  { name: 'Observability', group: 'Cloud', aliases: ['monitoring', 'prometheus', 'grafana', 'tracing'] },
  { name: 'Service Mesh', group: 'Cloud', aliases: ['istio', 'linkerd'] },

  // ── AI & ML ─────────────────────────────────────────────────────────────
  { name: 'LLMs', group: 'AI', aliases: ['large language models', 'gpt', 'generative ai', 'genai'] },
  { name: 'RAG Architecture', group: 'AI', aliases: ['retrieval augmented generation', 'rag', 'vector search'] },
  { name: 'Prompt Engineering', group: 'AI', aliases: ['prompting', 'genai'] },
  { name: 'PyTorch', group: 'AI', aliases: ['torch', 'deep learning'] },
  { name: 'TensorFlow', group: 'AI', aliases: ['keras', 'deep learning'] },
  { name: 'scikit-learn', group: 'AI', aliases: ['sklearn', 'machine learning'] },
  { name: 'Computer Vision', group: 'AI', aliases: ['cv', 'opencv', 'image processing', 'perception'] },
  { name: 'NLP', group: 'AI', aliases: ['natural language processing', 'text'] },
  { name: 'MLOps', group: 'AI', aliases: ['model deployment', 'mlflow', 'model serving'] },
  { name: 'Vector Databases', group: 'AI', aliases: ['pinecone', 'weaviate', 'embeddings'] },
  { name: 'Knowledge Graphs', group: 'AI', aliases: ['graph', 'ontology', 'neo4j'] },

  // ── Automotive & embedded ───────────────────────────────────────────────
  { name: 'AUTOSAR', group: 'Automotive', aliases: ['classic autosar', 'adaptive autosar', 'ecu'] },
  { name: 'Embedded C', group: 'Automotive', aliases: ['firmware', 'microcontroller', 'mcu'] },
  { name: 'CAN Bus', group: 'Automotive', aliases: ['can', 'can-fd', 'in-vehicle network'] },
  { name: 'LIN / FlexRay', group: 'Automotive', aliases: ['lin', 'flexray', 'bus'] },
  { name: 'Automotive Ethernet', group: 'Automotive', aliases: ['someip', 'ethernet', 'in-vehicle network'] },
  { name: 'ISO 26262', group: 'Automotive', aliases: ['functional safety', 'asil', 'hara', 'safety'] },
  { name: 'ASPICE', group: 'Automotive', aliases: ['automotive spice', 'process'] },
  { name: 'UDS / Diagnostics', group: 'Automotive', aliases: ['uds', 'obd', 'diagnostics'] },
  { name: 'Hardware-in-the-Loop', group: 'Automotive', aliases: ['hil', 'test bench', 'rig'] },
  { name: 'dSPACE', group: 'Automotive', aliases: ['hil', 'controldesk'] },
  { name: 'Vector CANoe', group: 'Automotive', aliases: ['canoe', 'canalyzer', 'vector'] },
  { name: 'INCA / CANape', group: 'Automotive', aliases: ['inca', 'canape', 'measurement', 'calibration'] },
  { name: 'ECU Calibration', group: 'Automotive', aliases: ['calibration', 'powertrain', 'tuning'] },
  { name: 'Simulink', group: 'Automotive', aliases: ['model based design', 'matlab', 'mbd'] },
  { name: 'Motor Control', group: 'Automotive', aliases: ['inverter', 'e-motor', 'foc'] },
  { name: 'Battery Management', group: 'Automotive', aliases: ['bms', 'high voltage', 'cell'] },
  { name: 'Fuel Cell Systems', group: 'Automotive', aliases: ['hydrogen', 'fcev'] },
  { name: 'Thermal Management', group: 'Automotive', aliases: ['cooling', 'thermal', 'hvac'] },
  { name: 'ADAS / Autonomous Driving', group: 'Automotive', aliases: ['adas', 'ad', 'self driving', 'perception'] },
  { name: 'ROS2', group: 'Automotive', aliases: ['ros', 'robotics'] },
  { name: 'MB.OS', group: 'Automotive', aliases: ['mbos', 'vehicle os', 'mercedes'] },
  { name: 'Digital Twin', group: 'Automotive', aliases: ['simulation', 'virtual validation'] },
  { name: 'CAD / CAE', group: 'Automotive', aliases: ['catia', 'ansys', 'fea', 'cfd', 'simulation'] },

  // ── Security ────────────────────────────────────────────────────────────
  { name: 'Application Security', group: 'Security', aliases: ['appsec', 'owasp', 'secure coding'] },
  { name: 'Threat Modeling', group: 'Security', aliases: ['stride', 'risk assessment', 'security'] },
  { name: 'Penetration Testing', group: 'Security', aliases: ['pentest', 'ethical hacking', 'red team'] },
  { name: 'ISO 21434', group: 'Security', aliases: ['automotive cybersecurity', 'cyber security'] },
  { name: 'IAM / OAuth', group: 'Security', aliases: ['oauth', 'oidc', 'sso', 'identity', 'auth'] },
  { name: 'Cryptography', group: 'Security', aliases: ['pki', 'encryption', 'certificates'] },

  // ── Ways of working ─────────────────────────────────────────────────────
  { name: 'Agile / Scrum', group: 'Practice', aliases: ['agile', 'scrum', 'kanban', 'sprint'] },
  { name: 'SAFe', group: 'Practice', aliases: ['scaled agile', 'pi planning'] },
  { name: 'Technical Writing', group: 'Practice', aliases: ['documentation', 'docs'] },
  { name: 'Mentoring', group: 'Practice', aliases: ['coaching', 'onboarding', 'teaching'] },
  { name: 'Architecture Review', group: 'Practice', aliases: ['design review', 'architecture'] },
  { name: 'Code Review', group: 'Practice', aliases: ['review', 'pull request'] },
  { name: 'Requirements Engineering', group: 'Practice', aliases: ['requirements', 'doors'] },
  { name: 'Test Automation', group: 'Practice', aliases: ['selenium', 'playwright', 'cypress', 'automation'] },
  { name: 'Performance Testing', group: 'Practice', aliases: ['load testing', 'jmeter', 'k6'] },
  { name: 'Figma', group: 'Practice', aliases: ['design', 'prototyping', 'ux'] }
];

/** Flat list of canonical names, for anywhere that just needs the vocabulary. */
export const ALL_SKILLS = SKILL_CATALOGUE.map((e) => e.name);

/**
 * Rank the catalogue against what the user has typed.
 *
 * Matches on the canonical name and on aliases, so "full" surfaces
 * "Full Stack Developer" plus React, Node.js and TypeScript, and "k8s"
 * finds Kubernetes. Ordering puts prefix matches above substring matches
 * above alias-only matches, so the most literal answer is always first.
 */
export function searchSkills(query: string, exclude: string[] = [], limit = 8): SkillEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const taken = new Set(exclude.map((t) => t.toLowerCase()));

  const scored: Array<{ entry: SkillEntry; rank: number }> = [];
  for (const entry of SKILL_CATALOGUE) {
    if (taken.has(entry.name.toLowerCase())) continue;
    const name = entry.name.toLowerCase();
    let rank = Infinity;

    if (name.startsWith(q)) rank = 0;
    else if (name.includes(q)) rank = 1;
    else if (entry.aliases?.some((a) => a.toLowerCase().startsWith(q))) rank = 2;
    else if (entry.aliases?.some((a) => a.toLowerCase().includes(q))) rank = 3;
    else if (entry.group.toLowerCase().startsWith(q)) rank = 4;

    if (rank !== Infinity) scored.push({ entry, rank });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((s) => s.entry);
}
