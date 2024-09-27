import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Alert, AlertTitle, AlertDescription, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea } from '@/components/ui/card';
import { Mic, StopCircle, AlertCircle, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Simulated NLP service
const simulateNLP = (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sentiment: Math.random() * 100,
        keywords: ['product', 'efficiency', 'cost-saving'].filter(() => Math.random() > 0.5),
        entities: ['John', 'XYZ Company', '30%'].filter(() => Math.random() > 0.5),
      });
    }, 500);
  });
};

// Simulated real-time transcription service
const simulateRealTimeTranscription = (onTranscript) => {
  const phrases = [
    "Hello, this is John from XYZ company.",
    "I'm calling to discuss our new product line.",
    "It could really benefit your business.",
    "Do you have a few minutes to chat?",
    "Our latest software has shown to increase efficiency by up to 30%.",
    "What challenges are you currently facing in your operations?",
  ];

  phrases.forEach((phrase, index) => {
    setTimeout(() => {
      onTranscript(phrase);
    }, index * 2000);
  });
};

const SalesCallAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [effectiveness, setEffectiveness] = useState(0);
  const [sentimentData, setSentimentData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [callSegments, setCallSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState('introduction');
  const [managerScore, setManagerScore] = useState(0);
  const [managerNotes, setManagerNotes] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      // Reset previous analysis
      setTranscript('');
      setAnalysis(null);
      setEffectiveness(0);
      setSentimentData([]);
      setCallSegments([]);
      setCurrentSegment('introduction');

      // Start real-time transcription
      simulateRealTimeTranscription(handleNewTranscript);
    } catch (err) {
      setError("Failed to start recording. Please check your microphone permissions.");
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNewTranscript = async (newPhrase) => {
    setTranscript(prev => prev + ' ' + newPhrase);
    const nlpResult = await simulateNLP(newPhrase);
    updateAnalysis(newPhrase, nlpResult);
  };

  const updateAnalysis = (text, nlpResult) => {
    const words = text.split(' ');
    const newSegment = {
      text,
      sentiment: nlpResult.sentiment,
      keywords: nlpResult.keywords,
      entities: nlpResult.entities,
    };
    setCallSegments(prev => [...prev, newSegment]);

    const allText = callSegments.map(seg => seg.text).join(' ') + ' ' + text;
    const allWords = allText.split(' ');

    const containsProductMention = nlpResult.keywords.includes('product');
    const containsValueProposition = nlpResult.keywords.includes('efficiency') || nlpResult.keywords.includes('cost-saving');
    const mentionsStatistics = nlpResult.entities.some(entity => entity.includes('%'));
    const asksQuestions = text.includes('?');
    
    let effectivenessScore = 0;
    if (containsProductMention) effectivenessScore += 15;
    if (containsValueProposition) effectivenessScore += 20;
    if (mentionsStatistics) effectivenessScore += 20;
    if (asksQuestions) effectivenessScore += 20;
    
    setEffectiveness(prev => Math.min(100, prev + effectivenessScore));

    setAnalysis(prev => ({
      ...prev,
      wordCount: allWords.length,
      containsProductMention,
      containsValueProposition,
      mentionsStatistics,
      asksQuestions,
      averageWordLength: allWords.reduce((sum, word) => sum + word.length, 0) / allWords.length,
      keywords: [...new Set([...(prev?.keywords || []), ...nlpResult.keywords])],
      entities: [...new Set([...(prev?.entities || []), ...nlpResult.entities])],
    }));

    setSentimentData(prev => [
      ...prev,
      { time: prev.length * 2, sentiment: nlpResult.sentiment } // Assuming each segment is roughly 2 seconds
    ]);
  };

  const playPauseAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = URL.createObjectURL(audioBlob);
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetAudio = () => {
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const saveToGoHighLevelCRM = () => {
    // Simulate saving to CRM
    console.log('Saving to Go High Level CRM:', {
      transcript,
      analysis,
      effectiveness,
      managerScore,
      managerNotes,
    });
    alert('Call data saved to Go High Level CRM!');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Advanced Sales Call Analyzer</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recording Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex-1 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isRecording ? <StopCircle className="mr-2" /> : <Mic className="mr-2" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            {audioBlob && (
              <>
                <Button onClick={playPauseAudio} className="flex-1 bg-blue-500 hover:bg-blue-600">
                  {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={resetAudio} className="flex-1 bg-gray-500 hover:bg-gray-600">
                  <RotateCcw className="mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
          {audioBlob && (
            <Progress 
              value={(currentTime / audioRef.current.duration) * 100} 
              className="mb-4"
            />
          )}
          <Select value={currentSegment} onValueChange={setCurrentSegment}>
            <SelectTrigger>
              <SelectValue placeholder="Select call segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="introduction">Introduction</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="handling-objections">Handling Objections</SelectItem>
              <SelectItem value="closing">Closing</SelectItem>
            </SelectContent>
          </Select>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Real-time Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{transcript || 'No transcript available yet.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NLP Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div>
                <ul className="mb-4 space-y-2">
                  <li><strong>Word Count:</strong> {analysis.wordCount}</li>
                  <li><strong>Average Word Length:</strong> {analysis.averageWordLength.toFixed(2)} characters</li>
                  <li><strong>Contains Product Mention:</strong> {analysis.containsProductMention ? 'Yes' : 'No'}</li>
                  <li><strong>Contains Value Proposition:</strong> {analysis.containsValueProposition ? 'Yes' : 'No'}</li>
                  <li><strong>Mentions Statistics:</strong> {analysis.mentionsStatistics ? 'Yes' : 'No'}</li>
                  <li><strong>Asks Questions:</strong> {analysis.asksQuestions ? 'Yes' : 'No'}</li>
                  <li><strong>Keywords:</strong> {analysis.keywords.join(', ')}</li>
                  <li><strong>Entities:</strong> {analysis.entities.join(', ')}</li>
                </ul>
                <div>
                  <h3 className="font-semibold mb-2">Call Effectiveness Score: {effectiveness}%</h3>
                  <Progress value={effectiveness} className="w-full" />
                </div>
              </div>
            ) : (
              <p>No analysis available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sentiment Analysis Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No sentiment data available yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manager Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block mb-2">Manager Score (0-100):</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={managerScore} 
              onChange={(e) => setManagerScore(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Manager Notes:</label>
            <Textarea 
              value={managerNotes} 
              onChange={(e) => setManagerNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
          <Button onClick={saveToGoHighLevelCRM} className="w-full bg-purple-500 hover:bg-purple-600">
            <Save className="mr-2" />
            Save to Go High Level CRM
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesCallAnalyzer;
