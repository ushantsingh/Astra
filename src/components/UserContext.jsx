import React, { createContext, useState, useRef, useEffect } from 'react'
import run from '../gemini';

export const dataContext = createContext()

const UserContext = ({ children }) => {

  let [speaking, setSpeaking] = useState(false)
  let [prompt, setPrompt] = useState("Listening...")
  let [response, setResponse] = useState(false)
  let [mouthOpen, setMouthOpen] = useState(false)
  let [availableVoices, setAvailableVoices] = useState([])
  let typingInterval = useRef(null)

  useEffect(() => {
    const fetchVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
  }, [])

  function showTypingEffect(text) {
    clearInterval(typingInterval.current)
    setPrompt("") // Clear instantly before typing starts
    let i = 0
    typingInterval.current = setInterval(() => {
      setPrompt(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(typingInterval.current)
      }
    }, 40)
  }

  function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text)
    text_speak.volume = 1;
    text_speak.rate = 1;
    text_speak.pitch = 1;

    // 1. Try to find an Indian/Hindi Male voice first (if installed)
    let maleIndianVoice = availableVoices.find(voice => 
      (voice.lang.includes('hi') || voice.lang.includes('en-IN')) && 
      (voice.name.includes('Male') || voice.name.includes('Rishi') || voice.name.includes('Aman') || voice.name.includes('Hemant'))
    );
    
    // 2. If no Indian Male exists on the PC, find ANY standard Male voice (UK/US)
    let anyMaleVoice = availableVoices.find(voice => 
      voice.name.includes('Male') || 
      voice.name.includes('Daniel') || // Mac British Male
      voice.name.includes('Arthur') || // Mac British Male
      voice.name.includes('Alex')      // Mac US Male
    );

    // Apply the male voice
    if (maleIndianVoice) {
      console.log("Using Indian Male Voice:", maleIndianVoice.name);
      text_speak.voice = maleIndianVoice;
    } else if (anyMaleVoice) {
      console.log("Using Fallback Male Voice:", anyMaleVoice.name);
      text_speak.voice = anyMaleVoice;
    } else {
      console.log("No explicit male voice found. Falling back to en-IN language code.");
      text_speak.lang = "en-IN"; // Set language to Indian English as final fallback
    }
    
    // Fire on every word boundary to simulate lip sync
    text_speak.onboundary = (event) => {
      if (event.name === 'word') {
        setMouthOpen(true);
        setTimeout(() => setMouthOpen(false), 150);
      }
    };

    text_speak.onend = () => {
      setSpeaking(false)
      setMouthOpen(false)
    }
    window.speechSynthesis.speak(text_speak)
  }

  async function aiResponse(prompt) {
    try {
      let text = await run(prompt)
      let newText = text.replace(/google/gi, "Ushant Singh") // Keep markdown syntax!
      showTypingEffect(newText)
      speak(newText)
      setResponse(true)
    } catch (err) {
      console.error("Gemini API Error:", err)
      if (err.message.includes("429")) {
        setPrompt("Google API Quota Exceeded! You have used all your free requests for now. Please wait about 15 minutes for your quota to reset, or generate a new API key.");
      } else {
        setPrompt("Error: " + err.message)
      }
      setTimeout(() => setSpeaking(false), 8000)
    }
  }

  let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let recognition = speechRecognition ? new speechRecognition() : null
  
  if (recognition) {
    recognition.onresult = (e) => {
      let currentIndex = e.resultIndex
      let transcript = e.results[currentIndex][0].transcript
      setPrompt(transcript)
      takeCommand(transcript.toLowerCase())
    }
  }

  function takeCommand(command) {
    if (command.includes("open") && command.includes("youtube")) {
      window.open("https://www.youtube.com/", "_blank")
      speak("Opening Youtube")
      setResponse(true)
      showTypingEffect("Opening Youtube...")
      setTimeout(() => {
        setSpeaking(false)
      },5000)
    } else if (command.includes("open") && command.includes("google")) {
      window.open("https://www.google.com/", "_blank")
      speak("Opening Google")
      setResponse(true)
      showTypingEffect("Opening Google...")
      setTimeout(() => {
        setSpeaking(false)
      }, 5000)
    } else if (command.includes("open") && command.includes("instagram")) {
      window.open("https://www.instagram.com/", "_blank")
      speak("Opening Instagram")
      setResponse(true)
      showTypingEffect("Opening Instagram...")
      setTimeout(() => {
        setSpeaking(false)
      }, 5000)
    } else if (command.includes("open") && command.includes("linkedin")) {
      window.open("https://www.linkedin.com/", "_blank")
      speak("Opening LinkedIn")
      setResponse(true)
      showTypingEffect("Opening LinkedIn...")
      setTimeout(() => {
        setSpeaking(false)
      }, 5000)
    }else if (command.includes("open") && command.includes("uber")) {
      window.open("https://www.uber.com/", "_blank")
      speak("Opening Uber")
      setResponse(true)
      showTypingEffect("Opening Uber...")
      setTimeout(() => {
        setSpeaking(false)
      }, 5000)
    } else if (command.includes("date")) {
      let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" })
      speak(date)
      setResponse(true)
      showTypingEffect(date)
      setTimeout(() => {
        setSpeaking(false)
      }, 5000)
    } else if (command.includes("weather")) {
      getWeather()
    } else if (command.includes("time")) {
      let time = new Date().toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true })
      speak(time)
      setResponse(true)
      showTypingEffect(time)
      setTimeout(() => {
        setSpeaking(false)
      }, 5000)
    }
    else {
      aiResponse(command)
    }
  }

  async function getWeather() {
    setResponse(true);
    let fetchingMsg = "Fetching live weather data...";
      showTypingEffect(fetchingMsg);
      speak(fetchingMsg);
    
    if (!navigator.geolocation) {
      let msg = "Geolocation is not supported by your browser.";
      showTypingEffect(msg);
      speak(msg);
      setTimeout(() => setSpeaking(false), 5000);
      return;
    }
  
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        
        const tempC = data.current_weather.temperature;
        const msg = `The current temperature is ${tempC} degrees Celsius.`;
        showTypingEffect(msg);
        speak(msg);
        setTimeout(() => setSpeaking(false), 5000);
      } catch (error) {
        let msg = "I couldn't fetch the weather right now.";
        showTypingEffect(msg);
        speak(msg);
        setTimeout(() => setSpeaking(false), 5000);
      }
    }, (error) => {
      let msg = "I need location permissions to check the weather.";
      showTypingEffect(msg);
      speak(msg);
      setTimeout(() => setSpeaking(false), 5000);
    });
  }

  let value = {
    recognition,
    speaking,
    setSpeaking,
    prompt,
    setPrompt,
    response,
    setResponse,
    mouthOpen
  }

  return (
    <div>
      <dataContext.Provider value={value}>
        {children}
      </dataContext.Provider>
    </div>
  )
}

export default UserContext
