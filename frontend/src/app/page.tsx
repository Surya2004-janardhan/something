'use client';

import { useMemo, useState } from 'react';
import styles from './page.module.css';
import { providerOptions, workflowBlueprints } from '../lib/providerCatalog';

const navigation = [
  { label: 'Studio', meta: 'Design and run', active: true },
  { label: 'Agents', meta: '7 templates' },
  { label: 'Workflows', meta: '3 blueprints' },
  { label: 'Runs', meta: '12 today' },
  { label: 'Usage', meta: 'Quota + cost' },
  { label: 'Settings', meta: 'Provider keys' },
];

const agentCards = [
  {
    title: 'Research Analyst',
    description: 'Break down a topic, fetch references, and draft a short executive brief.',
    badges: ['Research', 'Citations', 'Fast'],
  },
  {
    title: 'Support Copilot',
    description: 'Classify tickets, summarize history, and prepare a ready-to-send reply.',
    badges: ['Support', 'Triage', 'Auto-draft'],
  },
  {
    title: 'Ops Router',
    description: 'Route tasks to the right workflow and keep an audit trail by default.',
    badges: ['Automation', 'Audit', 'Rules'],
  },
];

const runFeed = [
  {
    title: 'Lead enrichment workflow',
    status: 'live',
    detail: '3-step enrichment flow completed in 2.9s using Groq + OpenRouter.',
  },
  {
    title: 'Daily support digest',
    status: 'idle',
    detail: 'Summaries generated from 48 tickets and routed to Slack.',
  },
  {
    title: 'Research brief',
    status: 'warning',
    detail: 'Waiting on citations pass before publishing to the team workspace.',
  },
];

export default function HomePage() {
  const [providerId, setProviderId] = useState(providerOptions[1].id);
  const [model, setModel] = useState(providerOptions[1].models[0]);
  const [temperature, setTemperature] = useState(0.3);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [workflowMode, setWorkflowMode] = useState('Research brief');
  const [prompt, setPrompt] = useState(
    'Turn a rough product idea into a clear, actionable workflow with roles, steps, and a concise output format.',
  );

  const provider = useMemo(
    () => providerOptions.find((option) => option.id === providerId) ?? providerOptions[0],
    [providerId],
  );

  const shortModel = model.length > 28 ? `${model.slice(0, 28)}…` : model;

  return (
    <main className={`${styles.page} shell-grid`}>
      <aside className={`${styles.sidebar} card`}>
        <div className={styles.brandRow}>
          <div className={styles.brandMark} />
          <div>
            <h1 className={styles.brandTitle}>Vector Studio</h1>
            <p className={styles.brandSub}>Dify-style AI workflows, rebuilt for this stack</p>
          </div>
        </div>

        <div>
          <div className={styles.sectionTitle}>Workspace</div>
          <div className={styles.navList}>
            {navigation.map((item) => (
              <div
                key={item.label}
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
              >
                <span>{item.label}</span>
                <span className={styles.navMeta}>{item.meta}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.sectionTitle}>Daily pulse</div>
          <div className={styles.metricList}>
            <div className={styles.metricCard}>
              <p className={styles.metricValue}>24</p>
              <p className={styles.metricLabel}>workflow runs queued today</p>
            </div>
            <div className={styles.metricCard}>
              <p className={styles.metricValue}>1.8k</p>
              <p className={styles.metricLabel}>tokens saved with local memory</p>
            </div>
            <div className={styles.metricCard}>
              <p className={styles.metricValue}>99.4%</p>
              <p className={styles.metricLabel}>provider availability observed</p>
            </div>
          </div>
        </div>
      </aside>

      <section className={styles.center}>
        <div className={`${styles.heroCard} card glow`}>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <div className={styles.heroKicker}>
                <span className="badge badgeLive">Live studio</span>
                <span>Fast, multi-provider, workflow-first</span>
              </div>
              <h2 className={`${styles.heroTitle} gradient-text`}>
                Design agents, compose workflows, and ship them like a product.
              </h2>
              <p className={styles.heroText}>
                This interface is built to feel closer to a polished AI ops console than a plain admin panel.
                It is optimized for quick prompt drafting, provider switching, workflow orchestration, and run visibility.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.buttonPrimary}>Create workflow</button>
                <button className={styles.buttonSecondary}>Run selected agent</button>
                <button className={styles.buttonGhost}>Open usage</button>
              </div>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statBox}>
                <div className={styles.statTop}>
                  <span className={styles.statLabel}>Provider</span>
                  <span className="pill">{provider.name}</span>
                </div>
                <p className={styles.statValue}>{shortModel}</p>
                <p className={styles.statNote}>
                  {provider.label}. Swap models instantly without leaving the studio.
                </p>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statTop}>
                  <span className={styles.statLabel}>Workflow mode</span>
                  <span className="pill">{workflowMode}</span>
                </div>
                <p className={styles.statValue}>4 steps</p>
                <p className={styles.statNote}>Minimal handoff, visible state, clear output contract.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.editorGrid}>
          <div className={styles.studioCard}>
            <div className={styles.historyHeader}>
              <div>
                <p className={styles.sectionTitle}>Prompt studio</p>
                <h3 className={styles.historyTitle}>Compose a task or workflow input</h3>
              </div>
              <span className="pill">Claude-like flow</span>
            </div>

            <div className={styles.promptBox}>
              <textarea
                className={styles.promptInput}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the task, include constraints, and define the output format."
              />

              <div className={styles.toolbar}>
                <div className={styles.chipRow}>
                  <span className={styles.chip}>Memory on</span>
                  <span className={styles.chip}>Tool use</span>
                  <span className={styles.chip}>Audit log</span>
                  <span className={styles.chip}>Retries</span>
                </div>
                <button className={styles.buttonPrimary}>Send to {workflowMode}</button>
              </div>
            </div>
          </div>

          <div className={styles.configCard}>
            <div className={styles.historyHeader}>
              <div>
                <p className={styles.sectionTitle}>Model control</p>
                <h3 className={styles.historyTitle}>Provider and execution settings</h3>
              </div>
            </div>

            <div className={styles.configStack}>
              <label className={styles.control}>
                <span className={styles.label}>Provider</span>
                <select
                  className={styles.select}
                  value={providerId}
                  onChange={(event) => {
                    const nextProvider = providerOptions.find((option) => option.id === event.target.value) ?? providerOptions[0];
                    setProviderId(nextProvider.id);
                    setModel(nextProvider.models[0]);
                  }}
                >
                  {providerOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.control}>
                <span className={styles.label}>Model</span>
                <select className={styles.select} value={model} onChange={(event) => setModel(event.target.value)}>
                  {provider.models.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.control}>
                <span className={styles.label}>Temperature: {temperature.toFixed(1)}</span>
                <input
                  className={styles.slider}
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(event) => setTemperature(Number(event.target.value))}
                />
              </label>

              <div className={styles.toggleRow}>
                <div className={styles.toggleText}>
                  <span className={styles.toggleTitle}>Conversation memory</span>
                  <span className={styles.toggleDesc}>Persist short context across runs for this user.</span>
                </div>
                <button
                  type="button"
                  className={`${styles.switch} ${memoryEnabled ? styles.switchOn : ''}`}
                  onClick={() => setMemoryEnabled((value) => !value)}
                  aria-label="Toggle memory"
                />
              </div>

              <label className={styles.control}>
                <span className={styles.label}>Workflow template</span>
                <select className={styles.select} value={workflowMode} onChange={(event) => setWorkflowMode(event.target.value)}>
                  {workflowBlueprints.map((workflow) => (
                    <option key={workflow.id} value={workflow.title}>
                      {workflow.title}
                    </option>
                  ))}
                </select>
              </label>

              <button className={styles.buttonSecondary}>Preview run plan</button>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.historyHeader}>
            <div>
              <p className={styles.sectionTitle}>Workflow blueprints</p>
              <h3 className={styles.historyTitle}>Start from a polished Dify-style template</h3>
            </div>
            <span className="pill">Drag, edit, run</span>
          </div>
          <div className={styles.workflowGrid}>
            {workflowBlueprints.map((workflow) => (
              <div key={workflow.id} className={styles.workflowCard}>
                <div className={styles.workflowBar} style={{ background: `linear-gradient(90deg, ${workflow.gradient[0]}, ${workflow.gradient[1]})` }} />
                <div className={styles.agentTop}>
                  <div>
                    <p className={styles.agentName}>{workflow.title}</p>
                    <p className={styles.agentDesc}>Built for quick orchestration and readable outputs.</p>
                  </div>
                  <span className="pill">{workflow.steps.length} steps</span>
                </div>
                <div className={styles.workflowSteps}>
                  {workflow.steps.map((step) => (
                    <span key={step} className={styles.workflowStep}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.historyHeader}>
            <div>
              <p className={styles.sectionTitle}>Agents</p>
              <h3 className={styles.historyTitle}>Template catalog for fast starts</h3>
            </div>
          </div>
          <div className={styles.agentList}>
            {agentCards.map((agent) => (
              <div key={agent.title} className={styles.agentCard}>
                <div className={styles.agentTop}>
                  <div>
                    <p className={styles.agentName}>{agent.title}</p>
                    <p className={styles.agentDesc}>{agent.description}</p>
                  </div>
                  <button className={styles.buttonGhost}>Open</button>
                </div>
                <div className={styles.agentMeta}>
                  {agent.badges.map((badge) => (
                    <span key={badge} className={styles.metaPill}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <h3>Execution safety</h3>
            <p>Retries, memory, usage tracking, and provider selection are exposed without extra clicks.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Fast iteration</h3>
            <p>The prompt box, model picker, and workflow templates keep the path from idea to run short.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Product feel</h3>
            <p>The layout is designed to feel like a premium AI operations console rather than a generic admin page.</p>
          </div>
        </div>
      </section>

      <aside className={styles.right}>
        <div className={styles.chatCard}>
          <div className={styles.historyHeader}>
            <div>
              <p className={styles.sectionTitle}>Run feed</p>
              <h3 className={styles.historyTitle}>Latest executions</h3>
            </div>
          </div>
          <div className={styles.runList}>
            {runFeed.map((run) => (
              <div key={run.title} className={styles.runCard}>
                <div className={styles.runTop}>
                  <div>
                    <p className={styles.runTitle}>{run.title}</p>
                    <p className={styles.runText}>{run.detail}</p>
                  </div>
                  <span
                    className={`badge ${
                      run.status === 'live'
                        ? 'badgeLive'
                        : run.status === 'idle'
                          ? 'badgeIdle'
                          : 'badgeWarn'
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.configCard}>
          <div className={styles.historyHeader}>
            <div>
              <p className={styles.sectionTitle}>Provider matrix</p>
              <h3 className={styles.historyTitle}>All supported LLMs</h3>
            </div>
          </div>
          <div className={styles.agentList}>
            {providerOptions.slice(0, 6).map((option) => (
              <div key={option.id} className={styles.agentCard}>
                <div className={styles.agentTop}>
                  <div>
                    <p className={styles.agentName}>{option.name}</p>
                    <p className={styles.agentDesc}>{option.label}</p>
                  </div>
                  <span style={{ color: option.accent }}>●</span>
                </div>
                <div className={styles.agentMeta}>
                  {option.models.slice(0, 2).map((item) => (
                    <span key={item} className={styles.metaPill}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
