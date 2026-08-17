import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCheck, FiCode, FiCopy, FiEye, FiFileText } from 'react-icons/fi';

const typeLabels = {
  frontend: 'React frontend',
  backend: 'Express backend',
  fullstack: 'Full-stack bundle',
  api: 'API handler',
};

const stripCodeFences = (value) =>
  value
    .replace(/```jsx?/g, '')
    .replace(/```javascript/g, '')
    .replace(/```js/g, '')
    .replace(/```/g, '')
    .trim();

const getLanguage = (type) => {
  switch (type) {
    case 'frontend':
      return 'jsx';
    case 'backend':
    case 'fullstack':
    case 'api':
      return 'javascript';
    default:
      return 'javascript';
  }
};

const LivePreview = ({ code }) => {
  const cleanCode = useMemo(() => stripCodeFences(code), [code]);
  const componentName = cleanCode.match(/function\s+(\w+)\s*\(/)?.[1] || 'App';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }
        #root { min-height: 100vh; }
        #error-message {
          display: none;
          margin: 16px;
          padding: 16px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <div id="error-message"></div>

      <script type="text/babel">
        window.onerror = function(msg, url, line) {
          var errorDiv = document.getElementById('error-message');
          errorDiv.style.display = 'block';
          errorDiv.textContent = 'Preview error: ' + msg + '\\nLine: ' + line;
          return true;
        };

        try {
          var useState = React.useState;
          var useEffect = React.useEffect;
          var useRef = React.useRef;
          var useContext = React.useContext;
          var useReducer = React.useReducer;
          var useCallback = React.useCallback;
          var useMemo = React.useMemo;

          ${cleanCode}

          var ComponentToRender = typeof ${componentName} !== 'undefined' ? ${componentName} : null;

          if (ComponentToRender) {
            ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ComponentToRender));
          } else {
            var errorDiv = document.getElementById('error-message');
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'No named React component was found in the generated code.';
          }
        } catch (error) {
          var errorDiv = document.getElementById('error-message');
          errorDiv.style.display = 'block';
          errorDiv.textContent = 'Preview error: ' + error.message;
        }
      </script>
    </body>
    </html>
  `;

  return (
    <iframe
      srcDoc={htmlContent}
      className="h-[640px] w-full border-0 bg-white"
      sandbox="allow-scripts"
      title="Generated React preview"
    />
  );
};

const CodeDisplay = ({ code, type }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [viewMode, setViewMode] = useState('code');

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const canPreview = type === 'frontend';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError('');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Clipboard permission was blocked. Select the code manually.');
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
              <FiFileText aria-hidden="true" />
              {typeLabels[type] || 'Generated code'}
            </span>
            <span className="text-xs text-slate-500">{lineCount} lines</span>
          </div>
          {copyError && <p className="mt-2 text-xs text-amber-200">{copyError}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPreview && (
            <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                  viewMode === 'code' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiCode aria-hidden="true" />
                Code
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                  viewMode === 'preview' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiEye aria-hidden="true" />
                Preview
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            {copied ? (
              <>
                <FiCheck className="text-emerald-300" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <FiCopy aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {canPreview && viewMode === 'preview' ? (
        <LivePreview code={code} />
      ) : (
        <div className="max-h-[640px] overflow-auto">
          <SyntaxHighlighter
            language={getLanguage(type)}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              background: 'transparent',
              fontSize: '13px',
              lineHeight: '1.65',
            }}
            showLineNumbers
            lineNumberStyle={{
              color: '#64748b',
              minWidth: '2.5em',
              paddingRight: '1em',
              textAlign: 'right',
              userSelect: 'none',
            }}
            wrapLongLines
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default CodeDisplay;
