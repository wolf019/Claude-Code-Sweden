'use strict';

/**
 * Wordcloud Renderer Module
 * Renders an interactive wordcloud using wordcloud2.js
 */

var WordcloudRenderer = (function () {
  // Lazer Wave color palette (7 vibrant neon colors)
  var colors = [
    '#bd93f9', // Purple/Magenta - Primary
    '#ff8adb', // Hot Pink - Accent
    '#93b4ff', // Sky Blue - Secondary
    '#84fba2', // Neon Green - Success
    '#f3e4a2', // Yellow - Warning
    '#ffb793', // Orange
    '#86bbcb', // Cyan
  ];

  // Background color matching Lazer Wave theme
  var backgroundColor = '#27212e';

  /**
   * Get a random color from the palette
   */
  function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Render the wordcloud
   * @param {Array} words - Array of [word, count] tuples
   * @param {string} containerId - ID of the container element
   */
  function render(words, containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
      console.error('Wordcloud container not found:', containerId);
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Handle empty word list
    if (!words || words.length === 0) {
      container.innerHTML = '<p class="text-muted">Waiting for votes...</p>';
      return;
    }

    // Limit to top 50 words by frequency
    var sortedWords = words.slice().sort(function (a, b) {
      return b[1] - a[1];
    });
    var topWords = sortedWords.slice(0, 50);

    // Check if WordCloud library is available
    if (typeof WordCloud === 'undefined') {
      console.warn('WordCloud library not available, using fallback');
      renderFallback(topWords, container);
      return;
    }

    // Create canvas element
    var canvas = document.createElement('canvas');
    canvas.id = 'wordcloud-canvas';
    container.appendChild(canvas);

    // Size canvas to fill container
    var containerWidth = container.clientWidth;
    var containerHeight = container.clientHeight;

    // Ensure minimum dimensions
    containerWidth = Math.max(containerWidth, 300);
    containerHeight = Math.max(containerHeight, 300);

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Calculate min/max counts for scaling
    var counts = topWords.map(function (w) { return w[1]; });
    var minCount = Math.min.apply(null, counts);
    var maxCount = Math.max.apply(null, counts);

    // Try to render wordcloud with error handling
    try {
      WordCloud(canvas, {
        list: topWords,
        gridSize: 8,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: getRandomColor,
        backgroundColor: backgroundColor,
        rotateRatio: 0.1, // Keep low for readability
        minSize: 16,
        shrinkToFit: true,
        drawOutOfBound: false,
        hover: null,
        weightFactor: function (size) {
          // Scale sizes: single vote = 16px, max votes = 60px
          if (maxCount === minCount) {
            // All words have same count - make them medium size
            return 24;
          }
          // Map count to font size range (16px to 60px)
          var ratio = (size - minCount) / (maxCount - minCount);
          return 16 + ratio * 44;
        },
      });
    } catch (e) {
      console.error('WordCloud rendering failed:', e);
      renderFallback(topWords, container);
    }
  }

  /**
   * Render fallback word list when Canvas fails
   * @param {Array} words - Array of [word, count] tuples
   * @param {HTMLElement} container - Container element
   */
  function renderFallback(words, container) {
    container.innerHTML = '';

    var list = document.createElement('ul');
    list.className = 'list-group wordcloud-fallback';
    list.style.maxHeight = '400px';
    list.style.overflowY = 'auto';

    words.forEach(function (item) {
      var word = item[0];
      var count = item[1];

      var li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.style.background = 'rgba(53, 45, 62, 0.9)';
      li.style.color = '#f8f8f2';
      li.style.borderColor = 'rgba(189, 147, 249, 0.3)';

      var wordSpan = document.createElement('span');
      wordSpan.textContent = word;
      wordSpan.style.color = getRandomColor();

      var badge = document.createElement('span');
      badge.className = 'badge rounded-pill';
      badge.style.background = 'rgba(189, 147, 249, 0.3)';
      badge.style.color = '#bd93f9';
      badge.textContent = count;

      li.appendChild(wordSpan);
      li.appendChild(badge);
      list.appendChild(li);
    });

    container.appendChild(list);
  }

  /**
   * Check if Canvas is supported
   */
  function isCanvasSupported() {
    var canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  }

  // Public API
  return {
    render: render,
    renderFallback: renderFallback,
    isCanvasSupported: isCanvasSupported,
  };
})();
