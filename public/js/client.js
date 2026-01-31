'use strict';

/**
 * Live Wordcloud Client
 * Handles Socket.io connection, form validation, and UI state management
 */

(function () {
  // DOM Elements
  const joinScreen = document.getElementById('join-screen');
  const voteScreen = document.getElementById('vote-screen');
  const joinForm = document.getElementById('join-form');
  const voteForm = document.getElementById('vote-form');
  const nameInput = document.getElementById('name-input');
  const wordInput = document.getElementById('word-input');
  const joinBtn = document.getElementById('join-btn');
  const submitBtn = document.getElementById('submit-btn');
  const joinError = document.getElementById('join-error');
  const voteFeedback = document.getElementById('vote-feedback');
  const connectionStatus = document.getElementById('connection-status');
  const participantCount = document.getElementById('participant-count');
  const questionEl = document.getElementById('question');
  const wordcloudQuestion = document.getElementById('wordcloud-question');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const fullscreenIcon = document.getElementById('fullscreen-icon');
  const exitFullscreenIcon = document.getElementById('exit-fullscreen-icon');
  const leftPanel = document.getElementById('left-panel');
  const rightPanel = document.getElementById('right-panel');

  // State
  let socket = null;
  let isConnected = false;
  let isFullscreen = false;
  let participantName = '';
  let submitTimeout = null;

  // Rate limiting: 5 seconds between votes
  const RATE_LIMIT_MS = 5000;

  /**
   * Initialize Socket.io connection
   */
  function initSocket() {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    // Connection events
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Application events
    socket.on('join-success', handleJoinSuccess);
    socket.on('join-error', handleJoinError);
    socket.on('vote-success', handleVoteSuccess);
    socket.on('vote-error', handleVoteError);
    socket.on('connection-count', handleConnectionCount);
    socket.on('question-updated', handleQuestionUpdated);
    socket.on('wordcloud-update', handleWordcloudUpdate);
    socket.on('session-reset', handleSessionReset);
  }

  /**
   * Handle successful connection
   */
  function handleConnect() {
    isConnected = true;
    updateConnectionStatus(true);
    console.log('Connected to server');
  }

  /**
   * Handle disconnection
   */
  function handleDisconnect(reason) {
    isConnected = false;
    updateConnectionStatus(false);
    console.log('Disconnected:', reason);
  }

  /**
   * Handle connection error
   */
  function handleConnectError(error) {
    console.error('Connection error:', error);
    updateConnectionStatus(false);
  }

  /**
   * Update connection status indicator
   */
  function updateConnectionStatus(connected) {
    if (connected) {
      connectionStatus.classList.remove('disconnected');
      connectionStatus.innerHTML = '<span class="status-dot"></span>Connected';
    } else {
      connectionStatus.classList.add('disconnected');
      connectionStatus.innerHTML = '<span class="status-dot"></span>Disconnected';
    }
  }

  /**
   * Handle successful join
   */
  function handleJoinSuccess(data) {
    participantName = data.name || participantName;

    // Switch to vote screen
    joinScreen.classList.add('d-none');
    voteScreen.classList.remove('d-none');

    // Update question if provided
    if (data.question) {
      updateQuestion(data.question);
    }

    // Render wordcloud if words are provided
    if (data.words) {
      renderWordcloud(data.words);
    }

    // Focus word input
    wordInput.focus();
  }

  /**
   * Handle join error
   */
  function handleJoinError(data) {
    joinError.textContent = data.message || 'Failed to join session';
    joinError.classList.remove('d-none');
    joinBtn.disabled = false;
    joinBtn.textContent = 'Join Session';
  }

  /**
   * Handle successful vote
   */
  function handleVoteSuccess(data) {
    showVoteFeedback('Submitted!', 'success');
    wordInput.value = '';
    submitBtn.textContent = 'Submit Vote';

    // Rate limit: disable submit for 5 seconds
    submitBtn.disabled = true;
    submitTimeout = setTimeout(() => {
      submitBtn.disabled = false;
      wordInput.focus();
    }, RATE_LIMIT_MS);
  }

  /**
   * Handle vote error
   */
  function handleVoteError(data) {
    showVoteFeedback(data.message || 'Failed to submit vote', 'danger');
    submitBtn.disabled = false;
  }

  /**
   * Show vote feedback message
   */
  function showVoteFeedback(message, type) {
    voteFeedback.textContent = message;
    voteFeedback.className = `alert alert-${type} mt-3`;
    voteFeedback.classList.remove('d-none');

    // Auto-hide after 3 seconds
    setTimeout(() => {
      voteFeedback.classList.add('d-none');
    }, 3000);
  }

  /**
   * Handle participant count update
   */
  function handleConnectionCount(data) {
    const count = data.count || 0;
    participantCount.textContent = `${count} participant${count !== 1 ? 's' : ''}`;
  }

  /**
   * Handle question update
   */
  function handleQuestionUpdated(data) {
    if (data.question) {
      updateQuestion(data.question);
    }
  }

  /**
   * Update question in both locations
   */
  function updateQuestion(question) {
    questionEl.textContent = question;
    wordcloudQuestion.textContent = question;
  }

  /**
   * Handle wordcloud update
   * @param {Object} data - Contains words array of [word, count] tuples
   */
  function handleWordcloudUpdate(data) {
    if (data && data.words) {
      renderWordcloud(data.words);
    }
  }

  /**
   * Render wordcloud using WordcloudRenderer
   * @param {Array} words - Array of [word, count] tuples
   */
  function renderWordcloud(words) {
    if (typeof WordcloudRenderer !== 'undefined') {
      WordcloudRenderer.render(words, 'wordcloud-container');
    } else {
      console.warn('WordcloudRenderer not available');
    }
  }

  /**
   * Handle session reset
   */
  function handleSessionReset() {
    // Clear the wordcloud by rendering empty words
    renderWordcloud([]);
  }

  /**
   * Toggle fullscreen mode
   */
  function toggleFullscreen() {
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
      document.body.classList.add('fullscreen-mode');
      fullscreenIcon.classList.add('d-none');
      exitFullscreenIcon.classList.remove('d-none');
      fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
      fullscreenIcon.classList.remove('d-none');
      exitFullscreenIcon.classList.add('d-none');
      fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen mode');
    }
  }

  /**
   * Validate name input
   */
  function validateName(name) {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  }

  /**
   * Strip emojis and special characters from word
   * Allows: alphanumeric, spaces, basic punctuation, Swedish/Nordic characters
   */
  function normalizeWord(word) {
    if (typeof word !== 'string') return '';

    // Remove emojis and special characters
    let normalized = word.replace(/[^a-zA-Z0-9\s.,!?'\-åäöÅÄÖéÉèÈüÜ]/g, '');

    // Collapse multiple spaces into single space
    normalized = normalized.replace(/\s+/g, ' ');

    return normalized.trim();
  }

  /**
   * Validate word input (1-50 characters after trimming)
   */
  function validateWord(word) {
    const trimmed = word.trim();
    return trimmed.length >= 1 && trimmed.length <= 50;
  }

  /**
   * Handle join form submission
   */
  function handleJoinSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();

    if (!validateName(name)) {
      nameInput.classList.add('is-invalid');
      return;
    }

    nameInput.classList.remove('is-invalid');
    joinError.classList.add('d-none');
    joinBtn.disabled = true;
    joinBtn.textContent = 'Joining...';

    participantName = name;
    socket.emit('join', { name: name });
  }

  /**
   * Handle vote form submission
   */
  function handleVoteSubmit(event) {
    event.preventDefault();

    // Normalize the word (strip emojis/special chars)
    const rawWord = wordInput.value;
    const word = normalizeWord(rawWord);

    // Update input with normalized value
    wordInput.value = word;

    if (!validateWord(word)) {
      wordInput.classList.add('is-invalid');
      showVoteFeedback('Please enter a word (1-50 characters)', 'warning');
      return;
    }

    wordInput.classList.remove('is-invalid');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    socket.emit('vote', { word: word });

    // Reset button text after a short delay
    setTimeout(() => {
      submitBtn.textContent = 'Submit Vote';
    }, 500);
  }

  /**
   * Handle input validation on change
   */
  function handleNameInput() {
    if (validateName(nameInput.value)) {
      nameInput.classList.remove('is-invalid');
    }
  }

  function handleWordInput() {
    if (validateWord(wordInput.value)) {
      wordInput.classList.remove('is-invalid');
    }
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    joinForm.addEventListener('submit', handleJoinSubmit);
    voteForm.addEventListener('submit', handleVoteSubmit);
    nameInput.addEventListener('input', handleNameInput);
    wordInput.addEventListener('input', handleWordInput);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard shortcut for fullscreen (Escape to exit)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    });
  }

  /**
   * Initialize the application
   */
  function init() {
    initSocket();
    initEventListeners();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
