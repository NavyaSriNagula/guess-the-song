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
  const [currentSong, setCurrentSong] = useState('');

  const timerRef = useRef(null);

  // Start the countdown timer
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
          handleTimeOut();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Handle timeout
  const handleTimeOut = async () => {
    setIsDisabled(true);
    setResult(`⏳ Time's up!`);
    await fetchCorrectAnswer(); // ✅ Fetch only after timeout
  };

  // Generate snippet
  const generateSnippet = async () => {
    try {
      const response = await axios.get('http://localhost:5000/generate-snippet');
      setSnippet(response.data.snippet);
      setCurrentSong(response.data.currentSong);
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
      const correctTitle = currentSong.split(' - ')[0];

      if (guess.toLowerCase() === correctTitle.toLowerCase()) {
        const message = '✅ Correct! 🎉';
        clearInterval(timerRef.current);
        setResult(message);
        setIsDisabled(true);
      } else {
        const  message=`❌ Incorrect.".`;
        setChancesLeft((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current);
            setIsDisabled(true);
            setResult(`❌ Out of chances!`);
            fetchCorrectAnswer();
            return 0;
          }
          return prev - 1;
        });

        setResult(message);
      }

    } catch (error) {
      console.error('Error checking guess:', error.message);
      setResult('❌ Failed to check answer.');
    }
  };

  // ✅ Fetch correct answer after last chance or timeout
  const fetchCorrectAnswer = async () => {
    try {
      const correctTitle = currentSong.split(' - ')[0];
      setResult(`The correct song was "${correctTitle}"`);
    } catch (error) {
      console.error('Error fetching correct answer:', error.message);
    }
  };

  // Cleanup timer on unmount
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

      <button onClick={generateSnippet} disabled={timeLeft !== null && timeLeft > 0}>
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
