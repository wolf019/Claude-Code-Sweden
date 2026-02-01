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
  const adminPanel = document.getElementById('admin-panel');
  const userPanel = document.getElementById('user-panel');
  const participantList = document.getElementById('participant-list');
  const nextQuestionForm = document.getElementById('next-question-form');
  const nextQuestionInput = document.getElementById('next-question-input');
  const nextQuestionBtn = document.getElementById('next-question-btn');
  const adminFeedback = document.getElementById('admin-feedback');

  // State
  let socket = null;
  let isConnected = false;
  let isFullscreen = false;
  let isAdmin = false;
  let participantName = '';
  let submitTimeout = null;
  let previousParticipants = [];

  // Admin credentials
  const ADMIN_NAME = 'admin-123';

  /**
   * Create floating animation
   * @param {string} text - The text to animate
   * @param {string} color - The color (default green)
   * @param {string} position - 'left', 'center', or 'right'
   */
  function createFloatingText(text, color, position) {
    if (typeof anime === 'undefined' || !anime.animate) return;

    var animateFn = anime.animate;

    // Default color
    color = color || '#84fba2';

    // Create floating element
    const floater = document.createElement('div');
    floater.className = 'floating-text';
    floater.textContent = text;
    floater.style.cssText = `
      position: fixed;
      font-size: 1.5rem;
      font-weight: bold;
      color: ${color};
      text-shadow: 0 0 10px ${color}80;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
    `;

    // Position based on parameter
    let startX;
    if (position === 'center') {
      startX = window.innerWidth / 2 - 50;
    } else if (position === 'right') {
      startX = window.innerWidth * 0.6 + Math.random() * 100;
    } else {
      // left (default)
      startX = 50 + Math.random() * 100;
    }
    const startY = window.innerHeight * 0.3 + Math.random() * (window.innerHeight * 0.4);
    floater.style.left = startX + 'px';
    floater.style.top = startY + 'px';

    document.body.appendChild(floater);

    // Animate with anime.js v4
    animateFn(floater, {
      translateX: [0, 30 + Math.random() * 50],
      translateY: [0, -100 - Math.random() * 100],
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1.2, 1],
      rotate: [-10 + Math.random() * 20, 0],
      duration: 2500,
      ease: 'outQuart',
      onComplete: function() {
        floater.remove();
      }
    });
  }

  /**
   * Create floating name animation (admin only)
   * @param {string} name - The name to animate
   */
  function createFloatingName(name) {
    if (!isAdmin) return;
    createFloatingText(name, '#84fba2', 'left');
  }

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
    socket.on('participant-list', handleParticipantList);
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
    isAdmin = participantName === ADMIN_NAME;

    // Switch to vote screen
    joinScreen.classList.add('d-none');
    voteScreen.classList.remove('d-none');

    if (isAdmin) {
      // Admin view: show wordcloud + participant list, hide vote form
      adminPanel.classList.remove('d-none');
      adminPanel.classList.add('d-flex');
      userPanel.classList.add('d-none');
      voteForm.classList.add('d-none');
      rightPanel.classList.remove('d-none');
    } else {
      // Regular user: show vote form, hide wordcloud
      adminPanel.classList.add('d-none');
      userPanel.classList.remove('d-none');
      voteForm.classList.remove('d-none');
      rightPanel.classList.add('d-none');
      // Make left panel full width for non-admin
      leftPanel.classList.remove('col-lg-4');
      leftPanel.classList.add('col-lg-12');
      // Remove flex-grow to prevent huge gap on mobile
      leftPanel.classList.remove('flex-grow-1');
      const card = leftPanel.querySelector('.card');
      const cardBody = leftPanel.querySelector('.card-body');
      if (card) card.classList.remove('flex-grow-1');
      if (cardBody) cardBody.classList.remove('flex-grow-1', 'd-flex', 'flex-column');
      // Remove mt-auto from form so it sits right under the question
      voteForm.classList.remove('mt-auto');
      voteForm.classList.add('mt-3');
    }

    // Update question if provided
    if (data.question) {
      updateQuestion(data.question);
    }

    // Render wordcloud if words are provided (admin only sees it)
    if (data.words && isAdmin) {
      renderWordcloud(data.words);
    }

    // For regular users: scroll to top, then focus input
    if (!isAdmin) {
      window.scrollTo(0, 0);
      // Small delay to let scroll complete before focusing
      setTimeout(() => {
        wordInput.focus({ preventScroll: true });
      }, 100);
    }
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
    // Floating animation instead of alert
    createFloatingText('Submitted!', '#84fba2', 'center');
    wordInput.value = '';
    submitBtn.textContent = 'Submit Vote';

    // Rate limit: disable submit for 5 seconds
    submitBtn.disabled = true;
    submitTimeout = setTimeout(() => {
      submitBtn.disabled = false;
      wordInput.focus({ preventScroll: true });
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
    console.log('[CLIENT] Received question-updated:', data);
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
    // Only render wordcloud for admin
    if (isAdmin && data && data.words) {
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
   * Fetches the new question from server (Firestore) to handle multi-instance Cloud Run
   */
  async function handleSessionReset() {
    // Clear the wordcloud by rendering empty words
    renderWordcloud([]);

    // Fetch the current question from server (reads from Firestore, works across instances)
    try {
      const res = await fetch('/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.currentQuestion) {
          console.log('[CLIENT] Fetched question from server:', data.currentQuestion);
          updateQuestion(data.currentQuestion);
        }
      }
    } catch (error) {
      console.error('[CLIENT] Failed to fetch question:', error);
    }
  }

  /**
   * Handle participant list update (admin only)
   */
  function handleParticipantList(data) {
    if (!isAdmin || !participantList) return;

    const participants = data.participants || [];

    // Find new participants and animate them
    const newParticipants = participants.filter(name => !previousParticipants.includes(name));
    newParticipants.forEach(name => {
      createFloatingName(name + ' joined!');
    });

    // Update previous list
    previousParticipants = [...participants];

    // Render participant list
    participantList.innerHTML = '';
    participants.forEach(function (name) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.style.background = 'rgba(53, 45, 62, 0.9)';
      li.style.color = '#f8f8f2';
      li.style.borderColor = 'rgba(189, 147, 249, 0.3)';
      li.textContent = name;
      participantList.appendChild(li);
    });
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
   * Handle next question form submission (admin only)
   */
  async function handleNextQuestionSubmit(event) {
    event.preventDefault();

    const question = nextQuestionInput.value.trim();
    if (!question) {
      showAdminFeedback('Please enter a question', 'warning');
      return;
    }

    nextQuestionBtn.disabled = true;
    nextQuestionBtn.textContent = 'Updating...';

    try {
      // First reset all words
      const resetRes = await fetch('/admin/reset', { method: 'POST' });
      if (!resetRes.ok) throw new Error('Failed to reset');

      // Then change the question
      const questionRes = await fetch('/admin/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question })
      });
      if (!questionRes.ok) throw new Error('Failed to change question');

      // Floating animation for success
      createFloatingText('Question updated!', '#ff8adb', 'left');
      nextQuestionInput.value = '';
    } catch (error) {
      createFloatingText('Error: ' + error.message, '#ff6b6b', 'left');
    } finally {
      nextQuestionBtn.disabled = false;
      nextQuestionBtn.textContent = 'Reset & Change Question';
    }
  }

  /**
   * Show admin feedback message
   */
  function showAdminFeedback(message, type) {
    if (!adminFeedback) return;
    adminFeedback.textContent = message;
    adminFeedback.className = `alert alert-${type} mt-2`;
    adminFeedback.classList.remove('d-none');
    setTimeout(() => {
      adminFeedback.classList.add('d-none');
    }, 3000);
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

    // Admin: next question form
    if (nextQuestionForm) {
      nextQuestionForm.addEventListener('submit', handleNextQuestionSubmit);
    }

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
