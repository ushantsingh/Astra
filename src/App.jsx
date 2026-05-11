import React, { useContext } from 'react'
import "./App.css"
import VA from "./assets/ai.png"
import { FaMicrophoneAlt } from "react-icons/fa"
import { dataContext } from './components/UserContext'
import speakimg from './assets/speak.gif'
import aigif from "./assets/aiVoice.mp4"
import aiOpen from "./assets/ai_open.png"
import ReactMarkdown from 'react-markdown'



const App = () => {

  let {recognition, speaking, setSpeaking, prompt, response, setPrompt, setResponse, mouthOpen} = useContext(dataContext)


  return (
    <div className='main'>
      <img src={VA} alt="" id='Astra' className={mouthOpen ? 'speaking-bounce' : ''}/>
      <span>I'm Astra, Your Advanced Virtual Assistant </span>
      {!speaking ?
        <button onClick={() => {
          setPrompt("Listening...")
          setSpeaking(true)
          setResponse(false)
          if(recognition) recognition.start()
      }}>Click here <FaMicrophoneAlt /></button>
        : 
        <div className='response'>
          {!response ?
            <img src={speakimg} alt="" id='speak' />
            :
            <video src={aigif} id='aivoice' autoPlay loop muted playsInline></video>
          }
          
          <div className="markdown-wrapper">
            <ReactMarkdown>{prompt}</ReactMarkdown>
          </div>
        </div>
      }
    </div>
  )
}

export default App
