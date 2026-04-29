export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'cohere'
  | 'groq'
  | 'together'
  | 'fireworks'
  | 'perplexity'
  | 'openrouter'
  | 'azure'
  | 'ollama'
  | 'openai-compatible';

export type ProviderOption = {
  id: ProviderId;
  name: string;
  label: string;
  accent: string;
  models: string[];
};

export const providerOptions: ProviderOption[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    label: 'Fast general-purpose chat',
    accent: 'var(--accent-cyan)',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini', 'o1-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    label: 'Long context and reasoning',
    accent: 'var(--accent-amber)',
    models: ['claude-3-5-sonnet-20240620', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  },
  {
    id: 'google',
    name: 'Gemini',
    label: 'Multimodal and fast',
    accent: 'var(--accent-lime)',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    label: 'Efficient open models',
    accent: 'var(--accent-sky)',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mixtral-8x7b'],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    label: 'Enterprise assistants',
    accent: 'var(--accent-rose)',
    models: ['command-r-plus', 'command-r', 'command'],
  },
  {
    id: 'groq',
    name: 'Groq',
    label: 'Ultra-low latency inference',
    accent: 'var(--accent-violet)',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  {
    id: 'together',
    name: 'Together',
    label: 'Open-weight model cloud',
    accent: 'var(--accent-cyan)',
    models: ['meta-llama/Llama-3.1-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct', 'mistralai/Mixtral-8x22B-Instruct-v0.1'],
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    label: 'Production-grade open models',
    accent: 'var(--accent-amber)',
    models: ['accounts/fireworks/models/llama-v3p1-70b-instruct', 'accounts/fireworks/models/qwen2p5-72b-instruct'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    label: 'Search-assisted responses',
    accent: 'var(--accent-lime)',
    models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    label: 'One API for many models',
    accent: 'var(--accent-sky)',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct'],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    label: 'Enterprise OpenAI deployments',
    accent: 'var(--accent-rose)',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    label: 'Local models on your machine',
    accent: 'var(--accent-violet)',
    models: ['llama3.1:8b', 'qwen2.5:7b', 'mistral:7b'],
  },
  {
    id: 'openai-compatible',
    name: 'Custom',
    label: 'OpenAI-compatible endpoint',
    accent: 'var(--accent-cyan)',
    models: ['custom-model'],
  },
];

export const workflowBlueprints = [
  {
    id: 'research',
    title: 'Research brief',
    steps: ['Ask', 'Gather', 'Synthesize', 'Package'],
    gradient: ['#66e3ff', '#9c7bff'],
  },
  {
    id: 'support',
    title: 'Support triage',
    steps: ['Classify', 'Retrieve', 'Draft', 'Escalate'],
    gradient: ['#ffd36e', '#ff7a90'],
  },
  {
    id: 'ops',
    title: 'Ops automation',
    steps: ['Detect', 'Plan', 'Execute', 'Log'],
    gradient: ['#8ef0b5', '#3ce3d9'],
  },
];
