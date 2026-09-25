/**
 * CetinLM Live Model — OpenAI GPT-4o Fullscreen Immersive Voice & Text Experience
 * Pure Vanilla JavaScript · Modular Architecture · Zero Dependencies · High Performance
 *
 * Includes:
 * - Step 1: "Meet Voice" Onboarding Modal (OpenAI 1:1)
 * - Step 2: "Choose a voice" Carousel Screen with live audition (OpenAI 1:1)
 * - Step 3: Fullscreen Edge-to-Edge Live Voice Canvas with 60fps Living Orb
 * - Built-in OpenAI Message Composer in Live Voice
 * - Dynamic Island Floating Companion Mini-Player
 * - Web Audio API, Speech Synthesis, Web Speech Recognition & Timbre Cloning
 */

class CetinLMLiveModel {
  constructor() {
    this.isOpen = false;
    this.isMinimized = false;
    this.state = 'idle'; // 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'
    this.isMuted = false;
    this.isVisionActive = false;
    this.activeVoiceIndex = 0; // index in presetVoices
    this.interruptAllowed = true;
    this.subtitlesEnabled = true;

    // Web Audio API
    this.audioCtx = null;
    this.micStream = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationFrameId = null;

    // Smoothed audio volume (Exponential Moving Average)
    this.smoothedVolume = 0;
    this.shockwaves = [];
    this.particles = [];

    // Vision Stream
    this.visionStream = null;

    // Speech Engine
    this.recognition = null;
    this.isRecognizing = false;
    this.speechSynth = window.speechSynthesis || null;
    this.currentUtterance = null;

    // Live session dialogue buffer (to save back to active chat)
    this.sessionTurns = [];

    // Event hooks
    this.listeners = {
      stateChange: [],
      userSpeech: [],
      assistantSpeak: [],
      audioDelta: [],
      error: []
    };

    // Preset Voice Personas (Matched with OpenAI GPT-4o Voice lineup + Turkish Native)
    this.presetVoices = [
      { id: 'alp', name: 'Alp', tag: 'Doğal Türkçe ve akıcı', lang: 'tr-TR', pitch: 1.0, rate: 1.02, colorClass: 'alp', desc: 'Akıcı, samimi ve dengeli Türkçe tonu' },
      { id: 'vale', name: 'Vale', tag: 'Bright and inquisitive', lang: 'en-US', pitch: 1.05, rate: 1.02, colorClass: 'vale', desc: 'Bright, curious and clear presence' },
      { id: 'sol', name: 'Sol', tag: 'Savvy and relaxed', lang: 'en-US', pitch: 0.98, rate: 1.0, colorClass: 'sol', desc: 'Savvy, composed and easygoing pace' },
      { id: 'maple', name: 'Maple', tag: 'Cheerful and candid', lang: 'en-US', pitch: 1.12, rate: 1.04, colorClass: 'maple', desc: 'Upbeat, friendly and candid tone' },
      { id: 'ember', name: 'Ember', tag: 'Warm and conversational', lang: 'en-US', pitch: 0.95, rate: 1.0, colorClass: 'ember', desc: 'Warm, natural and empathetic' },
      { id: 'breeze', name: 'Breeze', tag: 'Soft and empathetic', lang: 'en-US', pitch: 1.08, rate: 0.98, colorClass: 'breeze', desc: 'Gentle, soothing cadence' }
    ];

    this.customVoices = this.loadCustomVoices();
    this.initParticles();
  }

  get activeVoice() {
    return this.presetVoices[this.activeVoiceIndex] || this.presetVoices[0];
  }

  get activeVoiceId() {
    return this.activeVoice.id;
  }

  init() {
    this.renderOnboardingModalsDOM();
    this.renderModalDOM();
    this.renderDynamicIslandDOM();
    this.setupEventListeners();
    this.setupOrbCanvas();

    // Check saved voice preference
    const savedVoiceId = localStorage.getItem('cetinlm_selected_voice_id');
    if (savedVoiceId) {
      const idx = this.presetVoices.findIndex(v => v.id === savedVoiceId);
      if (idx !== -1) this.activeVoiceIndex = idx;
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        angle: (i / 24) * Math.PI * 2,
        dist: 135 + Math.random() * 50,
        speed: 0.007 + Math.random() * 0.012,
        size: 1.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  /* --- Storage Helpers --- */
  loadCustomVoices() {
    try {
      const data = localStorage.getItem('cetinlm_custom_voices');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCustomVoices() {
    try {
      localStorage.setItem('cetinlm_custom_voices', JSON.stringify(this.customVoices));
    } catch (e) {
      console.error('Failed to save custom voices', e);
    }
  }

  /* ==========================================================================
     Onboarding: "Meet Voice" & "Choose a voice" DOM Injection
     ========================================================================== */
  renderOnboardingModalsDOM() {
    if (document.getElementById('live-meet-modal')) return;

    const onboardingHTML = `
      <!-- Step 1: "Meet Voice" Modal (OpenAI Reference 1:1) -->
      <div id="live-meet-modal" class="live-onboarding-backdrop" onclick="LiveModelSystem.handleMeetBackdropClick(event)">
        <div class="meet-voice-card">
          <button class="meet-voice-close-btn" onclick="LiveModelSystem.closeOnboarding()" title="Close">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <div class="meet-voice-orb-preview"></div>

          <h2 class="meet-voice-title">Meet Voice</h2>

          <div class="meet-voice-points">
            <div class="meet-voice-point-item">
              <div class="meet-voice-icon-wrap">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="3" y1="10" x2="3" y2="14"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="13" y1="3" x2="13" y2="21"/><line x1="18" y1="7" x2="18" y2="17"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
              </div>
              <div class="meet-voice-text">
                Say what's on your mind. CetinLM listens, responds, and keeps the conversation flowing naturally.
              </div>
            </div>

            <div class="meet-voice-point-item">
              <div class="meet-voice-icon-wrap">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <div class="meet-voice-text">
                Audio recordings and live transcripts are synchronized directly with your chat. <a href="javascript:void(0)" onclick="LiveModelSystem.showPrivacyInfo()">Learn more</a>.
              </div>
            </div>
          </div>

          <button class="meet-voice-continue-btn" onclick="LiveModelSystem.proceedToVoiceChooser()">
            Continue
          </button>
        </div>
      </div>

      <!-- Step 2: "Choose a voice" Carousel Screen (OpenAI Reference 1:1) -->
      <div id="live-choose-voice-modal" class="choose-voice-screen">
        <div class="choose-voice-header">
          <h2 class="choose-voice-title">Choose a voice</h2>
        </div>

        <div class="choose-voice-stage">
          <!-- Fluid Voice Aura Sphere -->
          <div id="choose-voice-orb" class="choose-voice-orb vale"></div>

          <!-- Carousel Controls (Left < Active > Right) -->
          <div class="choose-voice-carousel-row">
            <div class="carousel-voice-item side" id="voice-carousel-prev" onclick="LiveModelSystem.prevVoice()">
              <span class="carousel-voice-name" id="voice-prev-name">Maple</span>
              <span class="carousel-voice-tag" id="voice-prev-tag">Cheerful and candid</span>
            </div>

            <button class="carousel-nav-btn" onclick="LiveModelSystem.prevVoice()" title="Previous voice">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            <div class="carousel-voice-item active" id="voice-carousel-curr" onclick="LiveModelSystem.auditionCurrentVoice()">
              <span class="carousel-voice-name" id="voice-curr-name">Vale</span>
              <span class="carousel-voice-tag" id="voice-curr-tag">Bright and inquisitive</span>
            </div>

            <button class="carousel-nav-btn" onclick="LiveModelSystem.nextVoice()" title="Next voice">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <div class="carousel-voice-item side" id="voice-carousel-next" onclick="LiveModelSystem.nextVoice()">
              <span class="carousel-voice-name" id="voice-next-name">Sol</span>
              <span class="carousel-voice-tag" id="voice-next-tag">Savvy and relaxed</span>
            </div>
          </div>
        </div>

        <div class="choose-voice-actions">
          <button class="choose-voice-done-btn" onclick="LiveModelSystem.confirmVoiceChoiceAndStart()">
            Done
          </button>
          <button class="choose-voice-cancel-btn" onclick="LiveModelSystem.closeOnboarding()">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', onboardingHTML);
  }

  /* --- Fullscreen Live Voice Stage DOM --- */
  renderModalDOM() {
    if (document.getElementById('live-model-modal')) return;

    const modalHTML = `
    <div id="live-model-modal" class="live-modal-backdrop">
      <div id="live-ambient-glow" class="live-ambient-glow idle"></div>

      <div class="live-modal-container">
        <!-- Top Navigation Bar -->
        <header class="live-modal-header">
          <div class="live-header-brand">
            <div class="live-brand-badge">
              <span class="live-pulse-dot"></span>
              <span>CetinLM Live</span>
            </div>
            <div class="live-status-pill">
              <span class="indicator-dot" id="live-status-dot"></span>
              <span id="live-status-label">Standby</span>
            </div>
          </div>

          <div class="live-header-actions">
            <!-- Voice Selector Trigger (re-opens Choose a voice carousel) -->
            <button class="live-voice-badge-btn" onclick="LiveModelSystem.openVoiceChooser()" title="Change voice persona">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              <span id="live-active-voice-name">Alp · Voice</span>
            </button>

            <!-- Subtitles Toggle -->
            <button class="live-icon-btn active" id="live-subtitles-btn" onclick="LiveModelSystem.toggleSubtitles()" title="Toggle live captions">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="18" y2="15"/></svg>
            </button>

            <!-- Minimize to Floating Island -->
            <button class="live-icon-btn" onclick="LiveModelSystem.minimize()" title="Minimize to Floating Island">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>

            <!-- Close Session -->
            <button class="live-icon-btn" onclick="LiveModelSystem.close()" title="Exit Live Mode">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </header>

        <!-- Vision Video PIP Tile -->
        <div id="live-pip-box" class="live-pip-vision-box">
          <video id="live-pip-video" class="live-pip-video" autoplay playsinline muted></video>
          <span class="live-pip-label" id="live-pip-label">Live Vision</span>
        </div>

        <!-- Central Interactive Stage -->
        <main class="live-modal-stage">
          <div class="live-orb-wrapper" onclick="LiveModelSystem.handleOrbClick()" title="Tap orb to trigger or interrupt">
            <canvas id="live-orb-canvas" width="660" height="660"></canvas>
          </div>

          <!-- Status Guidance -->
          <div class="live-stage-state-info">
            <div class="live-stage-state-text" id="live-stage-state-text">Ready to converse</div>
            <div class="live-stage-hint-text" id="live-stage-hint-text">Speak naturally or message below · Tap orb anytime to interrupt</div>
          </div>

          <!-- Live Floating Transcript -->
          <div class="live-subtitle-box" id="live-subtitle-box">
            <div class="live-transcript-user" id="live-transcript-user">User: "Waiting for your voice or message..."</div>
            <div class="live-transcript-assistant" id="live-transcript-assistant">CetinLM: Ready. Say hello or type a prompt below.</div>
          </div>
        </main>

        <!-- Built-in OpenAI Message Composer in Live Voice Mode -->
        <div class="live-fullscreen-composer-wrap">
          <form class="live-fullscreen-composer" onsubmit="LiveModelSystem.handleLiveFormSubmit(event)">
            <input 
              type="text" 
              id="live-voice-text-input" 
              class="live-fullscreen-input" 
              placeholder="Message CetinLM..." 
              autocomplete="off">
            <button type="submit" class="live-fullscreen-send-btn" title="Send message">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </form>
        </div>

        <!-- Floating Controls Dock (OpenAI Style) -->
        <footer class="live-modal-footer">
          <div class="live-footer-left">
            <button class="live-save-chat-btn" onclick="LiveModelSystem.saveSessionToChat()" title="Append conversation to active chat">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Save to Chat</span>
            </button>
          </div>

          <div class="live-footer-dock">
            <!-- Mic Mute Toggle -->
            <button class="live-control-pill-btn" id="live-mic-btn" onclick="LiveModelSystem.toggleMic()" title="Mute/Unmute Microphone">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" id="live-mic-icon-on"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" id="live-mic-icon-off" style="display: none;"><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </button>

            <!-- Vision Camera Toggle -->
            <button class="live-control-pill-btn" id="live-vision-btn" onclick="LiveModelSystem.toggleVision()" title="Toggle Camera Vision">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </button>

            <!-- Screen Share Toggle -->
            <button class="live-control-pill-btn" id="live-screenshare-btn" onclick="LiveModelSystem.toggleScreenShare()" title="Share Screen">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </button>

            <!-- Voice Studio Drawer Toggle -->
            <button class="live-control-pill-btn" onclick="LiveModelSystem.toggleSettingsDrawer()" title="Voice Studio & Presets">
              <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>

            <!-- End Call Button -->
            <button class="live-control-pill-btn danger" onclick="LiveModelSystem.close()" title="End Session">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" y1="2" x2="2" y2="22"/></svg>
            </button>
          </div>

          <div class="live-footer-right">
            <button class="live-save-chat-btn" onclick="LiveModelSystem.minimize()" title="Multitask in Chat">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <span>Keep Floating</span>
            </button>
          </div>
        </footer>

        <!-- Voice Studio Drawer -->
        <aside id="live-settings-drawer" class="live-settings-drawer">
          <div class="live-drawer-header">
            <h3 class="live-drawer-title">Voice Studio & Cloning</h3>
            <button class="live-icon-btn" onclick="LiveModelSystem.toggleSettingsDrawer()">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div class="live-drawer-body">
            <section>
              <div class="voice-section-title">Model Personas</div>
              <div class="voice-cards-grid" id="live-voices-grid"></div>
            </section>

            <section>
              <div class="voice-section-title">Clone Custom Acoustic Voice</div>
              <div class="voice-clone-dropzone" id="voice-clone-dropzone" onclick="document.getElementById('voice-upload-input').click()">
                <div class="clone-icon-wrap">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div style="font-weight: 600; font-size: 0.8125rem; color: var(--text-main);">Upload 5-15s Voice Sample</div>
                <div style="font-size: 0.6875rem; color: var(--text-muted); margin-top: 0.25rem;">WAV, MP3 or M4A · AI extracts acoustic timbre</div>
                <input type="file" id="voice-upload-input" accept="audio/*" style="display: none;" onchange="LiveModelSystem.handleVoiceUpload(event)">
              </div>
            </section>

            <section id="cloned-voices-section" style="display: none;">
              <div class="voice-section-title">Saved Acoustic Clones</div>
              <div class="cloned-voices-list" id="cloned-voices-list"></div>
            </section>
          </div>
        </aside>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.renderVoiceList();
  }

  /* --- Dynamic Island Companion DOM --- */
  renderDynamicIslandDOM() {
    if (document.getElementById('live-dynamic-island')) return;

    const islandHTML = `
      <div id="live-dynamic-island" class="live-dynamic-island" onclick="LiveModelSystem.maximize()">
        <div class="live-island-mini-orb" id="live-island-mini-orb"></div>
        <div class="live-island-info">
          <span class="live-island-title" id="live-island-title">CetinLM Live</span>
          <span class="live-island-subtitle" id="live-island-subtitle">Listening...</span>
        </div>
        <div class="live-island-actions" onclick="event.stopPropagation()">
          <button class="live-island-btn" onclick="LiveModelSystem.toggleMic()" title="Mute/Unmute">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </button>
          <button class="live-island-btn" onclick="LiveModelSystem.maximize()" title="Expand Full Stage">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button class="live-island-btn end" onclick="LiveModelSystem.close()" title="End Session">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', islandHTML);
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.getElementById('live-meet-modal')?.classList.contains('active') || 
            document.getElementById('live-choose-voice-modal')?.classList.contains('active')) {
          this.closeOnboarding();
          return;
        }

        if (this.isOpen) {
          if (this.isMinimized) {
            this.close();
          } else {
            this.minimize();
          }
        }
      }
    });
  }

  /* ==========================================================================
     Onboarding Flow Methods ("Meet Voice" -> "Choose a voice" -> Live Mode)
     ========================================================================== */
  launch() {
    const hasOnboarded = localStorage.getItem('cetinlm_voice_onboarded') === 'true';
    if (!hasOnboarded) {
      this.openMeetModal();
    } else {
      this.open();
    }
  }

  openMeetModal() {
    const meetModal = document.getElementById('live-meet-modal');
    if (meetModal) {
      meetModal.classList.add('active');
    }
  }

  handleMeetBackdropClick(e) {
    if (e.target.id === 'live-meet-modal') {
      this.closeOnboarding();
    }
  }

  proceedToVoiceChooser() {
    const meetModal = document.getElementById('live-meet-modal');
    if (meetModal) meetModal.classList.remove('active');
    this.openVoiceChooser();
  }

  openVoiceChooser() {
    const chooser = document.getElementById('live-choose-voice-modal');
    if (chooser) {
      chooser.classList.add('active');
      this.updateVoiceCarouselUI();
      this.auditionCurrentVoice();
    }
  }

  closeOnboarding() {
    const meetModal = document.getElementById('live-meet-modal');
    const chooser = document.getElementById('live-choose-voice-modal');
    if (meetModal) meetModal.classList.remove('active');
    if (chooser) chooser.classList.remove('active');
    if (this.speechSynth) this.speechSynth.cancel();
  }

  confirmVoiceChoiceAndStart() {
    localStorage.setItem('cetinlm_voice_onboarded', 'true');
    localStorage.setItem('cetinlm_selected_voice_id', this.activeVoice.id);
    this.closeOnboarding();
    this.open();
  }

  prevVoice() {
    this.activeVoiceIndex = (this.activeVoiceIndex - 1 + this.presetVoices.length) % this.presetVoices.length;
    this.updateVoiceCarouselUI();
    this.auditionCurrentVoice();
  }

  nextVoice() {
    this.activeVoiceIndex = (this.activeVoiceIndex + 1) % this.presetVoices.length;
    this.updateVoiceCarouselUI();
    this.auditionCurrentVoice();
  }

  updateVoiceCarouselUI() {
    const total = this.presetVoices.length;
    const prevIndex = (this.activeVoiceIndex - 1 + total) % total;
    const nextIndex = (this.activeVoiceIndex + 1) % total;

    const curr = this.presetVoices[this.activeVoiceIndex];
    const prev = this.presetVoices[prevIndex];
    const next = this.presetVoices[nextIndex];

    const currName = document.getElementById('voice-curr-name');
    const currTag = document.getElementById('voice-curr-tag');
    const prevName = document.getElementById('voice-prev-name');
    const prevTag = document.getElementById('voice-prev-tag');
    const nextName = document.getElementById('voice-next-name');
    const nextTag = document.getElementById('voice-next-tag');
    const orb = document.getElementById('choose-voice-orb');

    if (currName) currName.textContent = curr.name;
    if (currTag) currTag.textContent = curr.tag;
    if (prevName) prevName.textContent = prev.name;
    if (prevTag) prevTag.textContent = prev.tag;
    if (nextName) nextName.textContent = next.name;
    if (nextTag) nextTag.textContent = next.tag;

    if (orb) {
      orb.className = `choose-voice-orb ${curr.colorClass || 'vale'}`;
    }

    const liveActiveName = document.getElementById('live-active-voice-name');
    if (liveActiveName) {
      liveActiveName.textContent = `${curr.name} · Voice`;
    }

    this.renderVoiceList();
  }

  auditionCurrentVoice() {
    const v = this.activeVoice;
    if (!this.speechSynth) return;

    this.speechSynth.cancel();
    const demo = v.lang.startsWith('tr')
      ? `Merhaba! Ben ${v.name}. Canlı ses moduna hazırım, ne konuşmak istersin?`
      : `Hello! I'm ${v.name}. I'm ready to keep our conversation flowing naturally.`;

    const u = new SpeechSynthesisUtterance(demo);
    u.lang = v.lang || 'en-US';
    u.pitch = v.pitch || 1.0;
    u.rate = v.rate || 1.02;
    this.speechSynth.speak(u);
  }

  showPrivacyInfo() {
    if (window.ToastSystem) {
      window.ToastSystem.info('Your voice conversations are private and only stored locally in your current browser session.');
    }
  }

  /* ==========================================================================
     Living Visualizer Canvas Animation (60fps Catmull-Rom Spline)
     ========================================================================== */
  setupOrbCanvas() {
    const canvas = document.getElementById('live-orb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;

    const render = () => {
      if (!this.isOpen && this.shockwaves.length === 0) {
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.025;

      // Extract Audio Volume
      let rawVolume = 0;
      if (this.analyser && this.dataArray && !this.isMuted) {
        try {
          this.analyser.getByteFrequencyData(this.dataArray);
          let sum = 0;
          for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
          }
          rawVolume = sum / (this.dataArray.length * 255);
        } catch {
          rawVolume = 0;
        }
      }

      // State-based dynamic modulation
      if (this.state === 'speaking') {
        rawVolume = Math.max(rawVolume, 0.28 + Math.sin(time * 6) * 0.16 + Math.cos(time * 3.5) * 0.1);
      } else if (this.state === 'thinking') {
        rawVolume = Math.max(rawVolume, 0.15 + Math.sin(time * 9) * 0.08);
      } else if (this.state === 'listening') {
        rawVolume = Math.max(rawVolume, 0.05 + Math.sin(time * 1.5) * 0.02);
      } else {
        rawVolume = 0.04 + Math.sin(time * 0.8) * 0.02;
      }

      this.smoothedVolume += (rawVolume - this.smoothedVolume) * 0.14;
      const vol = this.smoothedVolume;

      // DPI Handling
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width || 330;
      const height = rect.height || 330;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const isDark = document.documentElement.classList.contains('dark');

      let coreColor1 = '#38bdf8';
      let coreColor2 = '#8b5cf6';
      let coreColor3 = '#ec4899';
      let glowColor  = 'rgba(139, 92, 246, 0.35)';

      if (this.state === 'listening') {
        coreColor1 = '#34d399';
        coreColor2 = '#38bdf8';
        coreColor3 = '#6366f1';
        glowColor  = 'rgba(52, 211, 153, 0.4)';
      } else if (this.state === 'thinking') {
        coreColor1 = '#f43f5e';
        coreColor2 = '#a855f7';
        coreColor3 = '#ec4899';
        glowColor  = 'rgba(244, 63, 94, 0.45)';
      } else if (this.state === 'speaking') {
        coreColor1 = '#38bdf8';
        coreColor2 = '#818cf8';
        coreColor3 = '#c084fc';
        glowColor  = 'rgba(56, 189, 248, 0.45)';
      }

      const baseRadius = 84 + vol * 38;

      // 1. Ambient Bloom Halo
      const ambientGrad = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.4,
        centerX, centerY, baseRadius * 1.6
      );
      ambientGrad.addColorStop(0, glowColor);
      ambientGrad.addColorStop(0.5, glowColor.replace(/[\d\.]+\)$/, '0.15)'));
      ambientGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Secondary Harmonic Wave Layer
      const numPts = 32;
      const pts2 = [];
      for (let i = 0; i < numPts; i++) {
        const theta = (i / numPts) * Math.PI * 2;
        const wave = Math.sin(theta * 3 - time * 2) * (10 + vol * 24) +
                     Math.cos(theta * 5 + time * 1.5) * (6 + vol * 16);
        const r = baseRadius * 1.08 + wave;
        pts2.push({
          x: centerX + Math.cos(theta) * r,
          y: centerY + Math.sin(theta) * r
        });
      }

      ctx.beginPath();
      for (let i = 0; i < numPts; i++) {
        const p1 = pts2[i];
        const p2 = pts2[(i + 1) % numPts];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        if (i === 0) ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.08)';
      ctx.fill();

      // 3. Primary Morphing Fluid Core
      const pts = [];
      const harmonicSpeed = this.state === 'thinking' ? 4 : 2;
      for (let i = 0; i < numPts; i++) {
        const theta = (i / numPts) * Math.PI * 2;
        const wave = Math.sin(theta * 4 + time * harmonicSpeed) * (8 + vol * 30) +
                     Math.cos(theta * 2 - time * 1.2) * (6 + vol * 20);
        const r = baseRadius + wave;
        pts.push({
          x: centerX + Math.cos(theta) * r,
          y: centerY + Math.sin(theta) * r
        });
      }

      ctx.beginPath();
      for (let i = 0; i < numPts; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % numPts];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        if (i === 0) ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(
        centerX - baseRadius * 0.25, centerY - baseRadius * 0.28, 8,
        centerX, centerY, baseRadius * 1.15
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.28, coreColor1);
      grad.addColorStop(0.65, coreColor2);
      grad.addColorStop(1, coreColor3);

      ctx.fillStyle = grad;
      ctx.shadowBlur = 32 * (1 + vol * 1.2);
      ctx.shadowColor = coreColor1;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Specular Highlight
      ctx.beginPath();
      ctx.ellipse(
        centerX - baseRadius * 0.32,
        centerY - baseRadius * 0.35,
        baseRadius * 0.42,
        baseRadius * 0.22,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      // 5. Orbiting Cosmic Particles
      this.particles.forEach((p) => {
        p.angle += p.speed * (1 + vol * 2.5);
        const curDist = p.dist + Math.sin(time * 2 + p.angle) * 8 + vol * 30;
        const px = centerX + Math.cos(p.angle) * curDist;
        const py = centerY + Math.sin(p.angle) * curDist;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${p.alpha})`
          : `rgba(139, 92, 246, ${p.alpha * 0.8})`;
        ctx.fill();
      });

      // 6. Shockwave Ripples
      for (let s = this.shockwaves.length - 1; s >= 0; s--) {
        const sw = this.shockwaves[s];
        sw.r += 6;
        sw.alpha -= 0.035;

        if (sw.alpha <= 0) {
          this.shockwaves.splice(s, 1);
        } else {
          ctx.beginPath();
          ctx.arc(centerX, centerY, sw.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      ctx.restore();
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  handleOrbClick() {
    this.shockwaves.push({ r: 60, alpha: 0.85 });

    if (this.state === 'speaking') {
      this.handleBargeIn();
      return;
    }

    if (this.state === 'idle') {
      this.open();
    } else if (this.state === 'listening') {
      this.setState('thinking');
      setTimeout(() => {
        this.simulateAssistantDialogue("Dinliyorum! Bana sormak istediğin konuyu sesle ya da aşağıdaki kutudan yazarak iletebilirsin.");
      }, 700);
    }
  }

  /* --- Text Input Handling Inside Live Voice Mode --- */
  handleLiveFormSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('live-voice-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.updateUserTranscript(text);
    this.handleUserSpeechFinal(text);
  }

  /* --- Fullscreen Session Lifecycle --- */
  async open() {
    this.isOpen = true;
    this.isMinimized = false;

    const modal = document.getElementById('live-model-modal');
    if (modal) {
      modal.classList.add('active');
      modal.classList.remove('minimized');
    }

    const island = document.getElementById('live-dynamic-island');
    if (island) island.classList.remove('visible');

    const liveActiveName = document.getElementById('live-active-voice-name');
    if (liveActiveName) {
      liveActiveName.textContent = `${this.activeVoice.name} · Voice`;
    }

    this.setState('connecting');
    await this.startAudioPipeline();

    this.setState('listening');
    this.startSpeechRecognition();

    this.emit('stateChange', { state: 'listening' });
  }

  minimize() {
    this.isMinimized = true;
    const modal = document.getElementById('live-model-modal');
    if (modal) modal.classList.add('minimized');

    const island = document.getElementById('live-dynamic-island');
    if (island) island.classList.add('visible');

    this.updateIslandUI();
  }

  maximize() {
    this.isMinimized = false;
    const modal = document.getElementById('live-model-modal');
    if (modal) {
      modal.classList.remove('minimized');
      modal.classList.add('active');
    }

    const island = document.getElementById('live-dynamic-island');
    if (island) island.classList.remove('visible');
  }

  close() {
    this.isOpen = false;
    this.isMinimized = false;

    const modal = document.getElementById('live-model-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.classList.remove('minimized');
    }

    const island = document.getElementById('live-dynamic-island');
    if (island) island.classList.remove('visible');

    this.stopAudioPipeline();
    this.stopVisionPipeline();
    this.stopSpeechRecognition();
    if (this.speechSynth) this.speechSynth.cancel();

    if (this.sessionTurns.length > 0) {
      this.saveSessionToChat(false);
    }

    this.setState('idle');
    this.emit('stateChange', { state: 'idle' });
  }

  setState(newState) {
    this.state = newState;
    const label = document.getElementById('live-stage-state-text');
    const hint = document.getElementById('live-stage-hint-text');
    const dot = document.getElementById('live-status-dot');
    const statusLabel = document.getElementById('live-status-label');
    const glow = document.getElementById('live-ambient-glow');

    if (glow) {
      glow.className = `live-ambient-glow ${newState}`;
    }

    if (dot && statusLabel) {
      if (newState === 'listening') {
        dot.style.background = '#10b981';
        statusLabel.textContent = 'Listening';
      } else if (newState === 'thinking') {
        dot.style.background = '#ec4899';
        statusLabel.textContent = 'Thinking';
      } else if (newState === 'speaking') {
        dot.style.background = '#38bdf8';
        statusLabel.textContent = 'Speaking';
      } else {
        dot.style.background = '#71717a';
        statusLabel.textContent = 'Standby';
      }
    }

    if (label) {
      switch (newState) {
        case 'connecting':
          label.textContent = 'Connecting audio & neural graph...';
          if (hint) hint.textContent = 'Initializing microphone and acoustic pipeline';
          break;
        case 'listening':
          label.textContent = 'Listening...';
          if (hint) hint.textContent = 'Speak naturally or type a message · Interrupt anytime';
          break;
        case 'thinking':
          label.textContent = 'CetinLM Thinking...';
          if (hint) hint.textContent = 'Processing neural representation & knowledge';
          break;
        case 'speaking':
          label.textContent = 'CetinLM Speaking...';
          if (hint) hint.textContent = 'Tap orb or speak to interrupt';
          break;
        default:
          label.textContent = 'Ready to converse';
          if (hint) hint.textContent = 'Tap orb or speak to start live voice';
      }
    }

    this.updateIslandUI();
  }

  updateIslandUI() {
    const subtitle = document.getElementById('live-island-subtitle');
    const miniOrb = document.getElementById('live-island-mini-orb');
    if (!subtitle) return;

    if (this.state === 'listening') {
      subtitle.textContent = 'Listening...';
      if (miniOrb) miniOrb.style.background = 'radial-gradient(circle, #34d399, #38bdf8)';
    } else if (this.state === 'thinking') {
      subtitle.textContent = 'Thinking...';
      if (miniOrb) miniOrb.style.background = 'radial-gradient(circle, #f43f5e, #a855f7)';
    } else if (this.state === 'speaking') {
      subtitle.textContent = 'Speaking...';
      if (miniOrb) miniOrb.style.background = 'radial-gradient(circle, #38bdf8, #818cf8)';
    } else {
      subtitle.textContent = 'Standby';
      if (miniOrb) miniOrb.style.background = 'radial-gradient(circle, #a1a1aa, #71717a)';
    }
  }

  /* --- Web Audio API Pipeline --- */
  async startAudioPipeline() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser);
    } catch (err) {
      console.warn('Microphone access unavailable or denied. Running simulated audio.', err);
      this.dataArray = new Uint8Array(32);
    }
  }

  stopAudioPipeline() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  /* --- Speech Recognition Loop --- */
  startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.activeVoice.lang || 'tr-TR';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          if (this.state === 'speaking' && this.interruptAllowed) {
            this.handleBargeIn();
          }

          this.updateUserTranscript(currentText);

          if (finalTranscript) {
            this.handleUserSpeechFinal(finalTranscript);
          }
        }
      };

      this.recognition.onerror = () => {};

      this.recognition.onend = () => {
        if (this.isOpen && !this.isMuted) {
          try { this.recognition.start(); } catch {}
        }
      };

      this.recognition.start();
      this.isRecognizing = true;
    } catch (e) {
      console.warn('SpeechRecognition failed to start', e);
    }
  }

  stopSpeechRecognition() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
      this.recognition = null;
      this.isRecognizing = false;
    }
  }

  /* --- Conversational AI Response Generation --- */
  handleUserSpeechFinal(text) {
    this.setState('thinking');
    this.emit('userSpeech', { text });

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('merhaba') || lower.includes('selam') || lower.includes('hello') || lower.includes('hi')) {
        reply = this.activeVoice.lang.startsWith('tr')
          ? "Merhaba! CetinLM canlı ses moduna hoş geldin. Ses tonum ve yanıtlarım gerçek zamanlı üretiliyor. Bugün hangi konuyu incelemek istersin?"
          : "Hello! Welcome to CetinLM Live Voice mode. I'm streaming real-time acoustic synthesis. What shall we explore today?";
      } else if (lower.includes('kimsin') || lower.includes('who are you')) {
        reply = this.activeVoice.lang.startsWith('tr')
          ? "Ben CetinLM; sıfırdan eğitilmiş bağımsız bir frontier yapay zeka modeliyim. 4.75 milyar işlenmiş token dönüm noktasındayım."
          : "I am CetinLM, an independent frontier AI trained from scratch, verified past 4.75 billion processed tokens.";
      } else {
        reply = this.activeVoice.lang.startsWith('tr')
          ? `"${text}" konusunu analiz ettim. CetinLM mimarisi bu bağlamda yüksek tutarlılık ve optimize edilmiş gecikmeyle sonuç üretir.`
          : `I've analyzed your question regarding "${text}". The CetinLM architecture ensures minimal latency and rich contextual precision.`;
      }

      this.sessionTurns.push({
        user: text,
        assistant: reply,
        timestamp: new Date().toISOString()
      });

      this.simulateAssistantDialogue(reply);
    }, 850);
  }

  simulateAssistantDialogue(text) {
    this.setState('speaking');
    this.updateAssistantTranscript(text);
    this.emit('assistantSpeak', { text });

    if (!this.speechSynth) {
      setTimeout(() => {
        if (this.isOpen && this.state === 'speaking') {
          this.setState('listening');
        }
      }, 4000);
      return;
    }

    this.speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const activeVoice = this.activeVoice;

    utterance.lang = activeVoice.lang || 'tr-TR';
    utterance.pitch = activeVoice.pitch || 1.0;
    utterance.rate = activeVoice.rate || 1.02;

    utterance.onend = () => {
      if (this.isOpen && this.state === 'speaking') {
        this.setState('listening');
      }
    };

    utterance.onerror = () => {
      if (this.isOpen) {
        this.setState('listening');
      }
    };

    this.currentUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  handleBargeIn() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.setState('listening');
  }

  /* --- Sync Live Session to Active Chat --- */
  saveSessionToChat(showToastNotification = true) {
    if (this.sessionTurns.length === 0) {
      if (showToastNotification && window.ToastSystem) {
        window.ToastSystem.info('No dialogue turns to save yet');
      }
      return;
    }

    if (window.state && typeof window.renderChatViewport === 'function') {
      let currentChat = window.state.getCurrentChat();
      if (!currentChat) {
        window.startNewChat();
        currentChat = window.state.getCurrentChat();
      }

      this.sessionTurns.forEach(turn => {
        currentChat.messages.push({
          id: `m-live-u-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          role: 'user',
          content: turn.user,
          timestamp: turn.timestamp
        });

        currentChat.messages.push({
          id: `m-live-a-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          role: 'assistant',
          content: turn.assistant,
          timestamp: turn.timestamp,
          meta: {
            model: 'CetinLM-Live-1B',
            voice: this.activeVoice.name,
            mode: 'Real-time Live Audio'
          }
        });
      });

      currentChat.updatedAt = new Date().toISOString();
      window.state.saveAll();
      window.renderChatViewport();

      if (showToastNotification && window.ToastSystem) {
        window.ToastSystem.success(`${this.sessionTurns.length} live dialogue turns saved to chat`);
      }

      this.sessionTurns = [];
    }
  }

  /* --- Controls & Toggles --- */
  toggleMic() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('live-mic-btn');
    const onIcon = document.getElementById('live-mic-icon-on');
    const offIcon = document.getElementById('live-mic-icon-off');

    if (btn) btn.classList.toggle('muted', this.isMuted);
    if (onIcon) onIcon.style.display = this.isMuted ? 'none' : 'block';
    if (offIcon) offIcon.style.display = this.isMuted ? 'block' : 'none';

    if (this.isMuted) {
      this.stopSpeechRecognition();
      if (window.ToastSystem) window.ToastSystem.info('Microphone muted');
    } else {
      this.startSpeechRecognition();
      if (window.ToastSystem) window.ToastSystem.info('Microphone active');
    }
  }

  toggleSubtitles() {
    this.subtitlesEnabled = !this.subtitlesEnabled;
    const box = document.getElementById('live-subtitle-box');
    const btn = document.getElementById('live-subtitles-btn');

    if (box) box.style.display = this.subtitlesEnabled ? 'flex' : 'none';
    if (btn) btn.classList.toggle('active', this.subtitlesEnabled);
  }

  toggleSettingsDrawer() {
    const drawer = document.getElementById('live-settings-drawer');
    if (drawer) drawer.classList.toggle('open');
  }

  async toggleVision() {
    const pipBox = document.getElementById('live-pip-box');
    const video = document.getElementById('live-pip-video');
    const label = document.getElementById('live-pip-label');
    const btn = document.getElementById('live-vision-btn');

    if (this.isVisionActive) {
      this.stopVisionPipeline();
      this.isVisionActive = false;
      if (pipBox) pipBox.classList.remove('active');
      if (btn) btn.classList.remove('active');
    } else {
      try {
        this.visionStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360, facingMode: 'user' }
        });
        if (video) video.srcObject = this.visionStream;
        if (label) label.textContent = 'Camera Vision';
        if (pipBox) pipBox.classList.add('active');
        if (btn) btn.classList.add('active');
        this.isVisionActive = true;
      } catch (e) {
        console.warn('Camera access denied or unavailable', e);
      }
    }
  }

  async toggleScreenShare() {
    const pipBox = document.getElementById('live-pip-box');
    const video = document.getElementById('live-pip-video');
    const label = document.getElementById('live-pip-label');

    try {
      this.stopVisionPipeline();
      this.visionStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (video) video.srcObject = this.visionStream;
      if (label) label.textContent = 'Shared Screen';
      if (pipBox) pipBox.classList.add('active');
      this.isVisionActive = true;

      this.visionStream.getVideoTracks()[0].onended = () => {
        this.stopVisionPipeline();
        if (pipBox) pipBox.classList.remove('active');
        this.isVisionActive = false;
      };
    } catch (e) {
      console.warn('Screen share cancelled', e);
    }
  }

  stopVisionPipeline() {
    if (this.visionStream) {
      this.visionStream.getTracks().forEach(t => t.stop());
      this.visionStream = null;
    }
    const video = document.getElementById('live-pip-video');
    if (video) video.srcObject = null;
  }

  updateUserTranscript(text) {
    const el = document.getElementById('live-transcript-user');
    if (el) el.textContent = `User: "${text}"`;
  }

  updateAssistantTranscript(text) {
    const el = document.getElementById('live-transcript-assistant');
    if (el) el.textContent = `CetinLM: ${text}`;
  }

  selectVoice(voiceId) {
    const idx = this.presetVoices.findIndex(v => v.id === voiceId);
    if (idx !== -1) {
      this.activeVoiceIndex = idx;
      localStorage.setItem('cetinlm_selected_voice_id', voiceId);
      const label = document.getElementById('live-active-voice-name');
      if (label) {
        label.textContent = `${this.activeVoice.name} · Voice`;
      }
      this.renderVoiceList();
      this.auditionCurrentVoice();
    }
  }

  previewVoice(voiceId) {
    const voice = this.presetVoices.find(v => v.id === voiceId) || this.customVoices.find(v => v.id === voiceId);
    if (!voice || !this.speechSynth) return;

    this.speechSynth.cancel();
    const demo = voice.lang?.startsWith('tr')
      ? `Merhaba! Bu ses "${voice.name}". CetinLM canlı ses moduna hazırım.`
      : `Hello! I am speaking with the "${voice.name}" acoustic persona.`;

    const u = new SpeechSynthesisUtterance(demo);
    u.lang = voice.lang || 'en-US';
    u.pitch = voice.pitch || 1.0;
    u.rate = voice.rate || 1.02;
    this.speechSynth.speak(u);
  }

  renderVoiceList() {
    const grid = document.getElementById('live-voices-grid');
    if (!grid) return;

    grid.innerHTML = this.presetVoices.map(v => `
      <div class="voice-card ${this.activeVoice.id === v.id ? 'active' : ''}" onclick="LiveModelSystem.selectVoice('${v.id}')">
        <div class="voice-card-top">
          <span class="voice-card-name">${v.name}</span>
          <button class="voice-preview-btn" onclick="event.stopPropagation(); LiveModelSystem.previewVoice('${v.id}')" title="Audition sample">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
        <div class="voice-card-tag">${v.tag}</div>
      </div>
    `).join('');

    const clonedSection = document.getElementById('cloned-voices-section');
    const clonedList = document.getElementById('cloned-voices-list');
    if (clonedSection && clonedList) {
      if (this.customVoices.length > 0) {
        clonedSection.style.display = 'block';
        clonedList.innerHTML = this.customVoices.map(cv => `
          <div class="cloned-voice-item ${this.activeVoice.id === cv.id ? 'active' : ''}">
            <div onclick="LiveModelSystem.selectVoice('${cv.id}')" style="cursor: pointer; flex: 1;">
              <div style="font-weight: 600; font-size: 0.8125rem; color: var(--text-main);">${cv.name}</div>
              <div style="font-size: 0.6875rem; color: var(--text-muted);">${cv.tag}</div>
            </div>
            <div style="display: flex; gap: 0.375rem;">
              <button class="voice-preview-btn" onclick="LiveModelSystem.previewVoice('${cv.id}')" title="Audition">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
              <button class="voice-preview-btn" style="color: #ef4444;" onclick="LiveModelSystem.deleteCustomVoice('${cv.id}')" title="Delete">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>
        `).join('');
      } else {
        clonedSection.style.display = 'none';
      }
    }
  }

  handleVoiceUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.ToastSystem) {
      window.ToastSystem.info(`Analyzing acoustic timbre of ${file.name}...`);
    }

    setTimeout(() => {
      const cloneName = file.name.replace(/\.[^/.]+$/, '').slice(0, 16);
      const newClone = {
        id: `clone-${Date.now()}`,
        name: `${cloneName} (Cloned)`,
        tag: 'Custom Acoustic Latent',
        lang: 'tr-TR',
        pitch: 1.05,
        rate: 1.0,
        desc: 'Extracted acoustic clone profile'
      };

      this.customVoices.push(newClone);
      this.saveCustomVoices();
      this.selectVoice(newClone.id);

      if (window.ToastSystem) {
        window.ToastSystem.success(`Voice "${newClone.name}" cloned successfully!`);
      }
    }, 1200);
  }

  deleteCustomVoice(id) {
    this.customVoices = this.customVoices.filter(v => v.id !== id);
    this.saveCustomVoices();
    if (this.activeVoice.id === id) {
      this.selectVoice('alp');
    } else {
      this.renderVoiceList();
    }
    if (window.ToastSystem) {
      window.ToastSystem.info('Custom voice removed');
    }
  }

  /* --- Event Emitter --- */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (err) { console.error('LiveModel listener err:', err); }
      });
    }
  }
}

// Instantiate global singleton
window.LiveModelSystem = new CetinLMLiveModel();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.LiveModelSystem.init());
} else {
  window.LiveModelSystem.init();
}
