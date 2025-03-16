import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [snippet, setSnippet] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [chancesLeft, setChancesLeft] = useState(3);
  
  // ✅ Use ref for currentSong
  const currentSongRef = useRef('');
  const timerRef = useRef(null);

  // ✅ Start the countdown timer
  const startTimer = () => {
    setTimeLeft(30);
    setIsDisabled(false);
    setChancesLeft(3);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut(); // ✅ Trigger timeout when timer hits zero
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // ✅ Handle timeout
  const handleTimeOut = async () => {
    setIsDisabled(true);
    setResult(`⏳ Time's up!`);
    fetchCorrectAnswer(); // ✅ Fetch answer after timeout
  };

  // ✅ Generate snippet
  const generateSnippet = async () => {
    try {
      const response = await axios.get('https://guess-the-song-dx1o.onrender.com/generate-snippet');
      setSnippet(response.data.snippet);

      // ✅ Store currentSong in ref (not state)
      currentSongRef.current = response.data.currentSong;

      setGuess('');
      setResult('');
      startTimer();
    } catch (error) {
      console.error('Error fetching snippet:', error.message);
      setResult('❌ Failed to generate snippet.');
    }
  };

  // ✅ Check the user's guess
  const checkGuess = async () => {
    if (chancesLeft <= 0) return;

    try {
      const correctTitle = currentSongRef.current.split(' - ')[0]; // ✅ Access from ref

      if (guess.toLowerCase() === correctTitle.toLowerCase()) {
        clearInterval(timerRef.current);
        setResult('✅ Correct! 🎉');
        setIsDisabled(true);
      } else {
        setChancesLeft((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current);
            setIsDisabled(true);
            setResult(`❌ Out of chances!`);
            fetchCorrectAnswer(); // ✅ Fetch only after last chance
            return 0;
          }
          return prev - 1;
        });

        setResult(`❌ Incorrect.`);
      }
    } catch (error) {
      console.error('Error checking guess:', error.message);
      setResult('❌ Failed to check answer.');
    }
  };

  // ✅ Fetch correct answer after last chance or timeout
  const fetchCorrectAnswer = async () => {
    try {
      if (currentSongRef.current) {
        const correctTitle = currentSongRef.current.split(' - ')[0];
        setResult(`The correct song was "${correctTitle}"`);
      } else {
        setResult(`Could not retrieve the correct answer.`);
      }
    } catch (error) {
      console.error('Error fetching correct answer:', error.message);
    }
  };

  // ✅ Cleanup timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="App">
      <h1>🎵 Lyric Match 🎵</h1>

      {/* Timer Display */}
      {timeLeft !== null && (
        <div className="timer-container">
          ⏱️ <span className="timer">{timeLeft}s</span>
        </div>
      )}

      {/* Chances Display */}
      {chancesLeft > 0 ? (
        <p className="chances">❤️ Chances left: {chancesLeft}</p>
      ) : (
        <p className="chances out-of-chances">💔 No chances left!</p>
      )}

      <button className='generate-snippet' onClick={generateSnippet} disabled={timeLeft !== null && timeLeft > 0}>
        Generate Lyric Snippet
      </button>
      
      {snippet && <p className="snippet">{snippet}</p>}

      <input
        type="text"
        placeholder="Enter song title"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={isDisabled || chancesLeft <= 0}
      />
      <button onClick={checkGuess} disabled={isDisabled || chancesLeft <= 0}>
        Check Answer
      </button>

      {result && <p className="result">{result}</p>}
    </div>
  );
}

export default App;
