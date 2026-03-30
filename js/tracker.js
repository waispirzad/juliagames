var SUPABASE_URL = 'https://hvlpgqpesdveqrfyhjrt.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bHBncXBlc2R2ZXFyZnloanJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjQ1MjgsImV4cCI6MjA5MDQ0MDUyOH0.ik0E_0uIm83G7keixtPvzzgx4f6ZtVsfdr5DOErGubk';

var trackerSessionId = null;
var eventQueue = [];
var flushInterval = null;

function initTracker() {
  trackerSessionId = crypto.randomUUID();
  flushInterval = setInterval(flushEvents, 5000);

  // Flush on page hide (user switches app / closes tab)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') flushEvents();
  });

  return trackerSessionId;
}

function trackEvent(game, eventType, data) {
  data = data || {};
  eventQueue.push({
    game: game,
    event_type: eventType,
    x: data.x != null ? data.x : null,
    y: data.y != null ? data.y : null,
    target: data.target || null,
    session_id: trackerSessionId,
    duration_ms: data.duration_ms || null,
  });
}

function flushEvents() {
  if (eventQueue.length === 0) return;

  var events = eventQueue.slice();
  eventQueue = [];

  // Try sendBeacon first (works even when page is closing)
  if (navigator.sendBeacon) {
    var blob = new Blob([JSON.stringify(events)], { type: 'application/json' });
    var url = SUPABASE_URL + '/rest/v1/game_events';
    // sendBeacon doesn't support custom headers, so fall back to fetch
  }

  fetch(SUPABASE_URL + '/rest/v1/game_events', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(events),
    keepalive: true,
  }).catch(function() {
    // Silent fail — re-queue events for next flush
    eventQueue = events.concat(eventQueue);
  });
}

function endSession(game, durationMs) {
  trackEvent(game, 'session_end', { duration_ms: durationMs });
  flushEvents();
}
