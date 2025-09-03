const API_KEY = "AIzaSyAYIn86j-FdhSF3wEi6gcjfHImcL8tyoj4"; 
const MODEL = "gemini-2.0-flash";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function askGemini(message) {
  const body = {
    contents: [{ parts: [{ text: message }] }]
  };

  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log(data.candidates[0].content.parts[0]);
}

askGemini("hello, can you help me write a readme.md file for a github repo");
