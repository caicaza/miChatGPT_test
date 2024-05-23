// speech-recognition.d.ts
interface SpeechRecognition {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onspeechend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    start(): void;
    stop(): void;
  }
  
  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
  }
  
  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
  }
  
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
  
  interface SpeechRecognitionErrorEvent {
    error: string;
  }
  
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  