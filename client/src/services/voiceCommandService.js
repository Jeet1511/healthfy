/**
 * Enhanced Voice Commands Service
 * Multi-language support, continuous recognition, confidence scoring
 * Handles emergency voice triggers: "SOS", "Call police", "Record", "Location", etc.
 */

const VOICE_COMMANDS = {
  // Emergency triggers
  SOS: {
    keywords: ["sos", "help", "emergency", "distress", "mayday"],
    action: "TRIGGER_SOS",
    priority: "CRITICAL",
    languages: ["en", "es", "fr", "de", "hi"],
  },
  CALL_POLICE: {
    keywords: ["call police", "police", "emergency call", "cop", "help"],
    action: "CALL_POLICE",
    priority: "HIGH",
    languages: ["en", "es", "fr"],
  },
  CALL_AMBULANCE: {
    keywords: ["ambulance", "medical", "hospital", "doctor", "emergency medical"],
    action: "CALL_AMBULANCE",
    priority: "HIGH",
    languages: ["en", "es", "fr"],
  },
  RECORD: {
    keywords: ["start recording", "record", "record audio", "begin recording"],
    action: "START_RECORDING",
    priority: "MEDIUM",
    languages: ["en"],
  },
  STOP_RECORDING: {
    keywords: ["stop recording", "stop", "end recording"],
    action: "STOP_RECORDING",
    priority: "MEDIUM",
    languages: ["en"],
  },
  LOCATION: {
    keywords: ["send location", "share location", "location", "gps"],
    action: "SHARE_LOCATION",
    priority: "MEDIUM",
    languages: ["en"],
  },
  SILENT_ALARM: {
    keywords: ["silent alarm", "quiet alarm", "silent sos"],
    action: "SILENT_ALARM",
    priority: "HIGH",
    languages: ["en"],
  },
  HELP: {
    keywords: ["help", "assist", "support", "first aid", "what to do"],
    action: "SHOW_HELP",
    priority: "LOW",
    languages: ["en"],
  },
};

// Confidence thresholds
const CONFIDENCE_THRESHOLDS = {
  CRITICAL: 0.7, // 70% confidence required for critical actions
  HIGH: 0.75,
  MEDIUM: 0.8,
  LOW: 0.85,
};

/**
 * VoiceCommandProcessor class
 * Handles speech recognition, command matching, and action dispatching
 */
export class VoiceCommandProcessor {
  constructor(options = {}) {
    this.isListening = false;
    this.isProcessing = false;
    this.language = options.language || "en";
    this.onCommandDetected = options.onCommandDetected || (() => {});
    this.onTranscript = options.onTranscript || (() => {});
    this.onError = options.onError || (() => {});
    this.confidenceThreshold = options.confidenceThreshold || 0.75;

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.continuous = true; // Keep listening
    this.recognition.interimResults = true;
    this.recognition.language = this.language;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log("Voice command listening started");
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Send interim transcript for UI display
      this.onTranscript({
        interim: interimTranscript,
        final: finalTranscript,
        isFinal: finalTranscript.length > 0,
      });

      // Process final transcript
      if (finalTranscript) {
        this.processCommand(finalTranscript, event.results[event.results.length - 1][0].confidence);
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.onError({
        error: event.error,
        message: this.getErrorMessage(event.error),
      });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log("Voice command listening ended");
    };
  }

  /**
   * Start continuous voice command listening
   */
  start() {
    if (!this.recognition) {
      console.warn("Speech Recognition not supported");
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      return false;
    }
  }

  /**
   * Stop voice command listening
   */
  stop() {
    if (!this.recognition) return false;

    try {
      this.recognition.stop();
      return true;
    } catch (error) {
      console.error("Failed to stop voice recognition:", error);
      return false;
    }
  }

  /**
   * Process recognized speech and match against commands
   */
  processCommand(transcript, confidence) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const normalizedTranscript = transcript.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;

    // Find best matching command
    for (const [commandName, commandConfig] of Object.entries(VOICE_COMMANDS)) {
      for (const keyword of commandConfig.keywords) {
        const score = this.calculateMatchScore(normalizedTranscript, keyword);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            command: commandName,
            config: commandConfig,
            score,
            confidence,
          };
        }
      }
    }

    // Validate against confidence threshold and match score
    if (bestMatch && bestScore >= 0.7) {
      const threshold = CONFIDENCE_THRESHOLDS[bestMatch.config.priority] || 0.8;

      if (confidence >= threshold) {
        this.dispatchCommand(bestMatch);
      } else {
        // Low confidence - request user confirmation
        this.onCommandDetected({
          type: "CONFIRMATION_NEEDED",
          command: bestMatch.command,
          confidence,
          transcript,
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Calculate similarity score between transcript and keyword
   * Uses fuzzy matching algorithm
   */
  calculateMatchScore(transcript, keyword) {
    // Exact match
    if (transcript.includes(keyword)) {
      return 1.0;
    }

    // Partial match with word boundaries
    const words = transcript.split(/\s+/);
    const keywordWords = keyword.split(/\s+/);

    if (keywordWords.every((kw) => words.some((w) => w.includes(kw)))) {
      return 0.9;
    }

    // Levenshtein distance for typos
    const distance = this.levenshteinDistance(transcript, keyword);
    const maxLength = Math.max(transcript.length, keyword.length);
    const similarity = 1 - distance / maxLength;

    return Math.max(0, similarity);
  }

  /**
   * Levenshtein distance algorithm for fuzzy matching
   */
  levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[str2.length][str1.length];
  }

  /**
   * Dispatch matched command
   */
  dispatchCommand(match) {
    this.onCommandDetected({
      type: "COMMAND_DETECTED",
      command: match.command,
      action: match.config.action,
      priority: match.config.priority,
      confidence: match.confidence,
      matchScore: match.score,
      timestamp: new Date().toISOString(),
    });

    // Log command for analytics
    console.log("Voice command detected:", {
      command: match.command,
      action: match.config.action,
      confidence: match.confidence,
    });
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    const errorMessages = {
      "no-speech": "No speech detected. Please try again.",
      "audio-capture": "Microphone not available. Check permissions.",
      "network": "Network error. Check your internet connection.",
      "not-allowed": "Microphone access denied. Enable in settings.",
      "service-not-allowed": "Speech recognition service not available.",
    };

    return errorMessages[error] || `Error: ${error}`;
  }

  /**
   * Change language for recognition
   */
  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.language = language;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    const languages = new Set();
    for (const command of Object.values(VOICE_COMMANDS)) {
      command.languages.forEach((lang) => languages.add(lang));
    }
    return Array.from(languages);
  }
}

/**
 * Voice command confirmation UI helper
 * Shows user-friendly confirmation dialog for low-confidence commands
 */
export async function showVoiceCommandConfirmation(commandName, confidence) {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "voice-confirmation-dialog";
    dialog.innerHTML = `
      <div class="confirmation-content">
        <h3>Confirm Command</h3>
        <p>Did you say: <strong>${commandName}</strong>?</p>
        <p class="confidence">Confidence: ${(confidence * 100).toFixed(0)}%</p>
        <div class="confirmation-buttons">
          <button class="confirm-btn">Yes, confirm</button>
          <button class="cancel-btn">No, cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector(".confirm-btn").onclick = () => {
      dialog.remove();
      resolve(true);
    };

    dialog.querySelector(".cancel-btn").onclick = () => {
      dialog.remove();
      resolve(false);
    };
  });
}

export default VoiceCommandProcessor;
