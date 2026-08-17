import { useCodeGeneration } from './hooks/useCodeGeneration';
import PromptForm from './components/PromptForm';
import CodeDisplay from './components/CodeDisplay';
import { FiAlertCircle, FiCheckCircle, FiClock, FiCpu, FiLayers, FiZap } from 'react-icons/fi';

const capabilityCards = [
  { icon: FiLayers, label: 'Prompt detail', value: 'UI, data, states' },
  { icon: FiCpu, label: 'Output modes', value: 'Frontend to API' },
  { icon: FiCheckCircle, label: 'Review step', value: 'Copy or preview' },
];

const starterIdeas = [
  'Landing page with responsive pricing cards',
  'Dashboard table with filters and empty states',
  'Express endpoint with validation and errors',
  'Full-stack contact form wired to an API',
];

function App() {
  const { code, loading, error, generationType, generate, reset } = useCodeGeneration();

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
              <FiZap aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Website Builder
              </p>
              <h1 className="text-2xl font-semibold text-white">AI Code Generator</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              React preview
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              Express output
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              Powered by Groq
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
        <section className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/30">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">Describe the build</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Give the generator the product goal, important UI states, data shape, and any constraints.
              </p>
            </div>
            <PromptForm onSubmit={generate} loading={loading} onReset={reset} />
          </div>

          {error && (
            <div className="flex gap-3 rounded-lg border border-red-400/30 bg-red-950/50 p-4 text-sm text-red-100">
              <FiAlertCircle className="mt-0.5 shrink-0 text-red-300" aria-hidden="true" />
              <div>
                <p className="font-medium">Generation stopped</p>
                <p className="mt-1 text-red-100/80">{error}</p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {capabilityCards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <Icon className="mb-3 text-cyan-200" aria-hidden="true" />
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-1 text-xs text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          {loading && (
            <div className="rounded-lg border border-cyan-300/20 bg-slate-900/80 p-10">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10">
                  <FiClock className="animate-pulse text-2xl text-cyan-200" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold text-white">Generating your project code</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The model is translating your brief into runnable code. This usually takes a few seconds.
                </p>
              </div>
            </div>
          )}

          {code && !loading && <CodeDisplay code={code} type={generationType} />}

          {!code && !loading && !error && (
            <div className="rounded-lg border border-dashed border-white/15 bg-slate-900/60 p-8 sm:p-12">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Ready when you are
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  Turn a rough idea into a usable starting point.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                  Start with a clear product request, then preview React components or copy server code into your project.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {starterIdeas.map((idea) => (
                    <div key={idea} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                      {idea}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
