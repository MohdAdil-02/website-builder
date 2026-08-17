import { useMemo, useState } from 'react';
import { FiCode, FiCpu, FiDatabase, FiLayers, FiRefreshCw, FiSend } from 'react-icons/fi';

const MAX_PROMPT_LENGTH = 10000;

const CODE_TYPES = [
  {
    value: 'frontend',
    label: 'Frontend',
    description: 'React component with preview',
    icon: FiCode,
  },
  {
    value: 'backend',
    label: 'Backend',
    description: 'Express server or route set',
    icon: FiDatabase,
  },
  {
    value: 'fullstack',
    label: 'Full stack',
    description: 'Client and API together',
    icon: FiLayers,
  },
  {
    value: 'api',
    label: 'API handler',
    description: 'Controller logic only',
    icon: FiCpu,
  },
];

const EXAMPLE_PROMPT =
  'Build a responsive SaaS pricing section with monthly/yearly toggle, highlighted plan, FAQ accordion, and accessible buttons.';

const PromptForm = ({ onSubmit, loading, onReset }) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('frontend');
  const [promptError, setPromptError] = useState('');

  const trimmedPrompt = prompt.trim();
  const charactersRemaining = MAX_PROMPT_LENGTH - prompt.length;
  const isPromptReady = trimmedPrompt.length >= 5 && prompt.length <= MAX_PROMPT_LENGTH;

  const promptTone = useMemo(() => {
    if (prompt.length > MAX_PROMPT_LENGTH) return 'text-red-300';
    if (prompt.length > MAX_PROMPT_LENGTH * 0.9) return 'text-amber-300';
    return 'text-slate-500';
  }, [prompt.length]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!trimmedPrompt) {
      setPromptError('Enter a prompt before generating.');
      return;
    }
    if (trimmedPrompt.length < 5) {
      setPromptError('Add a little more detail so the model has enough context.');
      return;
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      setPromptError(`Keep the prompt under ${MAX_PROMPT_LENGTH.toLocaleString()} characters.`);
      return;
    }

    setPromptError('');
    onSubmit(trimmedPrompt, type);
  };

  const handleReset = () => {
    setPrompt('');
    setType('frontend');
    setPromptError('');
    onReset();
  };

  const useExample = () => {
    setPrompt(EXAMPLE_PROMPT);
    setPromptError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="prompt" className="text-sm font-medium text-slate-200">
            Project prompt
          </label>
          <button
            type="button"
            onClick={useExample}
            disabled={loading}
            className="text-xs font-medium text-cyan-200 transition hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use example
          </button>
        </div>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            if (promptError) setPromptError('');
          }}
          placeholder="Example: Build a booking dashboard with calendar filters, upcoming reservations, cancellation flow, and mobile-friendly cards."
          rows={8}
          disabled={loading}
          aria-describedby="prompt-help prompt-count"
          className={`min-h-48 w-full resize-y rounded-lg border bg-slate-950/80 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-600 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            promptError
              ? 'border-red-400/70 focus:border-red-300 focus:ring-red-400/20'
              : 'border-white/10 focus:border-cyan-300/70 focus:ring-cyan-300/20'
          }`}
        />
        {promptError ? (
          <p className="mt-2 text-sm text-red-300">{promptError}</p>
        ) : (
          <p id="prompt-help" className="mt-2 text-xs leading-5 text-slate-500">
            Strong prompts mention layout, interactions, empty states, validation, and responsive behavior.
          </p>
        )}
        <p id="prompt-count" className={`mt-1 text-right text-xs ${promptTone}`}>
          {charactersRemaining.toLocaleString()} characters remaining
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-200">Output type</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {CODE_TYPES.map(({ value, label, description, icon: Icon }) => {
            const selected = type === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                disabled={loading}
                aria-pressed={selected}
                className={`flex min-h-16 items-center gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? 'border-cyan-300/70 bg-cyan-300/10 text-white shadow-lg shadow-cyan-950/30'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${selected ? 'bg-cyan-300/15 text-cyan-100' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading || !isPromptReady}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <FiSend aria-hidden="true" />
          {loading ? 'Generating...' : 'Generate code'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading && !prompt}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw aria-hidden="true" />
          Reset
        </button>
      </div>
    </form>
  );
};

export default PromptForm;
