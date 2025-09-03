import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

export default function ModernGeneratorUI() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const API_KEY = "AIzaSyAYIn86j-FdhSF3wEi6gcjfHImcL8tyoj4"; 
  const MODEL = "gemini-2.0-flash";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  async function askGemini(message) {
    const body = {
      contents: [{ parts: [{ text: message }] }]
    };

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  const handleGenerate = async () => {
    if (!input1.trim() || !input2.trim()) return;
    
    setGenerating(true);
    try {
      // Reset fileData for each new generation
      const fileData = await saveRepoFile(input1, input2);
      
      if (!fileData.trim()) {
        throw new Error('No code files found in the repository');
      }
      
      let readme = await askGemini(`Write a comprehensive README.md file for this repository based on the following code files:\n\n${fileData}`);
      setOutput(readme);

    } catch (error) {
      console.error('❌ Error generating readme:', error);
      setOutput(`Error: ${error.message}`);
    }
    
    setGenerating(false);
  };

  async function saveRepoFile(owner, repo, path = "") {
    let fileData = ""; // Local variable to avoid scope issues
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    console.log(`📁 Found ${files.length} items in ${path || 'root'}`);

    // Allowed code/text file extensions
    const allowedExtensions = [
      "js", "ts", "jsx", "tsx", "html", "css", "md", "json", "txt", "py", "java", "cpp", "c", "go", "rs"
    ];

    for (const file of files) {
      if (file.type === "file") {
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (allowedExtensions.includes(extension)) {
          try {
            const data = await fetch(file.download_url);
            const text = await data.text();
            fileData += `\n=== ${file.name} ===\n\n`;
            fileData += `${text}\n\n`;
          } catch (error) {
            console.error(`Error fetching ${file.name}:`, error);
          }
        }
      } else if (file.type === "dir") {
        console.log(`📂 Entering directory: ${file.name}`);
        const subDirData = await saveRepoFile(owner, repo, file.path);
        fileData += subDirData;
      }
    }
    
    return fileData;
  }

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Repo Readme Generator</h1>
          <p className="text-slate-600">Enter github username and repo-name</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          {/* Input Fields */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label htmlFor="input1" className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="input1"
                type="text"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                placeholder="Am-i-Selected"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-slate-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="input2" className="block text-sm font-medium text-slate-700">
                Repo Name
              </label>
              <input
                id="input2"
                type="text"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                placeholder="in-BYTE-society?"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-slate-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleGenerate}
              disabled={generating || (!input1.trim() || !input2.trim())}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                generating || (!input1.trim() || !input2.trim())
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Readme'}
            </button>
          </div>
        </div>

        {/* Output Box */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Generated Output</h3>
            {output && (
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  copied
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Data
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-6">
            {output ? (
              <div className="bg-slate-50 rounded-xl p-6 min-h-48">
                <pre className="whitespace-pre-wrap text-slate-700 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-12 min-h-48 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-600 mb-2">No content generated yet</h4>
                <p className="text-slate-500">Fill in the inputs above and click generate to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}