import { useEffect, useRef, useState } from "react";
import { useTVDisplay } from "@/hooks/useTVDisplay";
import NoSleep from 'nosleep.js';

const KeepAwake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTV = useTVDisplay();
  const [keepAwakeActive, setKeepAwakeActive] = useState(false);

  // Method 1: Canvas-based animation that keeps the screen awake (MORE AGGRESSIVE)
  useEffect(() => {
    if (!isTV || !canvasRef.current) return;

    console.log("Initializing canvas-based keep-awake system");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    // Set small canvas size (2x2 pixels)
    canvas.width = 4; // Slightly larger
    canvas.height = 4;

    // Animation function that draws a tiny changing pattern
    // This forces screen refresh without visible changes
    let frameCount = 0;
    let lastDrawTime = 0;
    let animationId: number;

    const animate = (timestamp: number) => {
      // Request next frame to keep animation loop going
      animationId = requestAnimationFrame(animate);

      // Throttle to roughly 5 FPS to avoid burning TV CPU
      if (timestamp - lastDrawTime < 200) return;
      lastDrawTime = timestamp;

      frameCount++;

      // More aggressive pixel color changes (still visually subtle)
      const color1 = frameCount % 2 === 0 ? 'rgba(0,0,0,0.005)' : 'rgba(0,0,0,0.006)';
      const color2 = frameCount % 2 === 0 ? 'rgba(0,0,0,0.006)' : 'rgba(0,0,0,0.007)';

      // Create a pattern with alternating pixels for more reliable screen refresh
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, 2, 2);
      ctx.fillRect(2, 2, 2, 2);

      ctx.fillStyle = color2;
      ctx.fillRect(2, 0, 2, 2);
      ctx.fillRect(0, 2, 2, 2);
    };

    // Start animation
    animationId = requestAnimationFrame(animate);
    setKeepAwakeActive(true);
    console.log("Canvas animation started to prevent sleep (aggressive mode)");

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      setKeepAwakeActive(false);
    };
  }, [isTV]);

  // Method 2: CSS Animation to keep display active (MORE AGGRESSIVE)
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing CSS animation-based keep-awake system");

    // Create a style element for our animation with more frequent changes
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes keepAwakeAnimation {
        0% { opacity: 0.998; }
        20% { opacity: 0.9985; }
        40% { opacity: 0.999; }
        60% { opacity: 0.9995; }
        80% { opacity: 0.998; }
        100% { opacity: 1; }
      }
      
      .keep-awake-element {
        position: fixed;
        width: 2px;
        height: 2px;
        bottom: 0;
        right: 0;
        opacity: 0.003; /* Slightly more visible but still practically invisible */
        z-index: -1;
        animation: keepAwakeAnimation 3s infinite; /* Faster animation */
        pointer-events: none;
      }
    `;

    document.head.appendChild(styleElement);

    // Create multiple elements that use this animation
    const elements = [];
    for (let i = 0; i < 5; i++) { // More elements
      const animatedElement = document.createElement('div');
      animatedElement.className = 'keep-awake-element';
      animatedElement.style.right = `${i * 2}px`;
      document.body.appendChild(animatedElement);
      elements.push(animatedElement);
    }

    console.log("CSS animation method initialized for keep-awake (aggressive mode)");

    return () => {
      document.head.removeChild(styleElement);
      elements.forEach(el => document.body.removeChild(el));
    };
  }, [isTV]);

  // Method 3: Periodic visibility changes and focus events (MORE AGGRESSIVE)
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing visibility/focus-based keep-awake system");

    const focusInterval = setInterval(() => {
      // Force focus cycle (removed aggressive 'blur' which breaks active dropdowns/UI)
      window.dispatchEvent(new Event('focus'));

      // Force visibility state check
      if (document.hidden) {
        console.log("Document appears hidden, triggering visibility change");
      }

      // Update document title more aggressively
      const currentTitle = document.title;
      document.title = currentTitle + " ";
      setTimeout(() => {
        document.title = currentTitle;
      }, 200);

      // Force a layout recalculation
      document.body.getBoundingClientRect();

    }, 15000); // Every 15 seconds

    console.log("Visibility/focus-based keep-awake method initialized (aggressive mode)");

    return () => {
      clearInterval(focusInterval);
    };
  }, [isTV]);

  // Method 4: Simulate DOM interactions to keep the device awake (MORE AGGRESSIVE)
  useEffect(() => {
    if (!isTV) return;

    console.log("KeepAwake DOM interaction method activated");

    const activityInterval = setInterval(() => {
      // Create a single temporary element to force layout calculation (reduced from 5)
      // Throwing 5 elements into the DOM every 5s causes UI jitter on cheap TV processors
      const tempElement = document.createElement('div');
      tempElement.style.position = 'fixed';
      tempElement.style.left = `-9999px`;
      tempElement.style.width = '1px';
      tempElement.style.height = '1px';
      document.body.appendChild(tempElement);

      // Force layout calculation
      tempElement.getBoundingClientRect();

      setTimeout(() => {
        document.body.removeChild(tempElement);
      }, 50);

      // Trigger a subtle repaint cycle instead of full opacity drops to avoid flickering
      document.body.style.opacity = "0.999";
      setTimeout(() => {
        document.body.style.opacity = "1";
      }, 30);

      // Don't log this too often to avoid console spam
      if (Math.random() < 0.1) { // Only log approximately 10% of the time
        console.log("Keep awake: DOM activity simulated at", new Date().toISOString());
      }
    }, 30000); // Throttled to every 30 seconds to prevent timetable scrolling lag

    return () => {
      clearInterval(activityInterval);
    };
  }, [isTV]);

  // Method 5: HTML5 Page Visibility API manipulation (MORE AGGRESSIVE)
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing Page Visibility API keep-awake system");

    // Create multiple hidden iframes that we can manipulate
    const iframes = [];
    for (let i = 0; i < 3; i++) { // More iframes
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = `-${9999 + i}px`;
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0.001';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-1';
      document.body.appendChild(iframe);
      iframes.push(iframe);
    }

    // Access iframe documents periodically
    const iframeVisibilityInterval = setInterval(() => {
      iframes.forEach((iframe, idx) => {
        try {
          if (iframe.contentWindow && iframe.contentWindow.document) {
            // Change something in the iframe to trigger visibility processing
            iframe.contentWindow.document.title = "keepAwake" + new Date().getTime() + idx;

            // Create and remove elements in the iframe
            const div = iframe.contentWindow.document.createElement('div');
            iframe.contentWindow.document.body.appendChild(div);
            setTimeout(() => {
              try {
                iframe.contentWindow.document.body.removeChild(div);
              } catch (e) {
                // Silent catch
              }
            }, 50);
          }
        } catch (e) {
          // Silent catch to avoid console spam
        }
      });
    }, 8000); // Every 8 seconds (more frequent)

    console.log("Page Visibility API keep-awake method initialized (aggressive mode)");

    return () => {
      clearInterval(iframeVisibilityInterval);
      iframes.forEach(iframe => document.body.removeChild(iframe));
    };
  }, [isTV]);

  // Method 6: Wake Lock API - modern method to prevent device sleep (MORE AGGRESSIVE)
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing Wake Lock API keep-awake system");

    let wakeLock: any = null;

    // Function to request a wake lock
    const requestWakeLock = async () => {
      try {
        // Check if the Wake Lock API is supported
        if ('wakeLock' in navigator) {
          // Request a screen wake lock
          wakeLock = await (navigator as any).wakeLock.request('screen');

          console.log('Wake Lock is active!');

          // Listen for wake lock release
          wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
            // Try to re-acquire the wake lock immediately
            setTimeout(() => requestWakeLock(), 100);
          });
        } else {
          console.log('Wake Lock API not supported on this device');
        }
      } catch (err) {
        console.error(`Failed to get wake lock: ${err}`);
        // Try again after a short delay
        setTimeout(() => requestWakeLock(), 1000);
      }
    };

    // Function to handle visibility change events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // The page has become visible, try to request a wake lock
        requestWakeLock();
      }
    };

    // Add an event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Request a wake lock immediately and retry on an interval
    requestWakeLock();

    // Also set up a periodic wake lock refresh
    const wakeLockInterval = setInterval(() => {
      if (wakeLock === null) {
        requestWakeLock();
      }
    }, 15000); // Try to reacquire every 15 seconds if needed

    // Cleanup function
    return () => {
      // Remove the event listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(wakeLockInterval);

      // Release the wake lock if it's active
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            console.log('Wake Lock released by cleanup');
            wakeLock = null;
          })
          .catch((err: any) => {
            console.error(`Failed to release Wake Lock: ${err}`);
          });
      }
    };
  }, [isTV]);

  // Method 7: Silent audio pings (ultra low volume, won't interfere with alerts)
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing silent audio pings keep-awake system");

    // Create an audio element for ultra-quiet pings
    const audio = new Audio();
    audioRef.current = audio;

    // Set up audio with extremely low volume
    audio.volume = 0.001; // Ultra low volume, practically silent

    // Create an oscillator to generate a super quiet tone
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1, audioCtx.currentTime); // Very low frequency
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime); // Ultra low gain

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Schedule periodic silent audio pings
    const playTone = () => {
      // Don't interfere with alert beeps by checking if they're playing
      const alertAudio = document.querySelector('audio[src*="alert-beep.mp3"]') as HTMLAudioElement;

      if (alertAudio && !alertAudio.paused) {
        console.log("Alert sound playing, skipping silent audio ping");
        return;
      }

      // Create a very short and quiet sound to keep the device awake
      try {
        // Start oscillator for very brief period
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.01); // Stop after 10ms

        // Create a new oscillator for next time
        const newOscillator = audioCtx.createOscillator();
        newOscillator.type = 'sine';
        newOscillator.frequency.setValueAtTime(1, audioCtx.currentTime);
        newOscillator.connect(gainNode);
        oscillator.disconnect();

        if (Math.random() < 0.05) { // Log only occasionally
          console.log("Silent audio ping played to prevent sleep");
        }
      } catch (e) {
        // Silent error handling
      }
    };

    const audioInterval = setInterval(playTone, 300000); // Every 5 minutes

    return () => {
      clearInterval(audioInterval);
      if (audioCtx.state !== 'closed') {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
          audioCtx.close();
        } catch (e) {
          // Silent catch
        }
      }
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [isTV]);

  // Method 8 removed: Fetching file:/// URLs in WebOS causes Error -10

  // Method 9: Native JSX Fullscreen Video (Highly effective for LG WebOS)
  useEffect(() => {
    if (!isTV || !videoRef.current) return;

    console.log("Initializing native JSX video keep-awake system");

    const playVideo = async () => {
      try {
        if (videoRef.current && videoRef.current.paused) {
          await videoRef.current.play();
          console.log("Fullscreen video is playing successfully to prevent sleep");
        }
      } catch (e) {
        // Autoplay policy might block it, will retry on interaction
      }
    };

    playVideo();

    // Ensure we start playing as soon as possible if blocked by autoplay policies
    const playOnInteraction = () => {
      playVideo();
    };

    document.addEventListener("click", playOnInteraction);
    document.addEventListener("touchstart", playOnInteraction);
    document.addEventListener("keydown", playOnInteraction);

    // Periodically make sure it hasn't paused for some reason
    const checkInterval = setInterval(() => {
      playVideo();

      if (videoRef.current) {
        // We can also adjust playback rate slightly to force the browser to know it's active
        if (videoRef.current.playbackRate === 1) {
          videoRef.current.playbackRate = 1.01;
        } else {
          videoRef.current.playbackRate = 1.0;
        }
      }
    }, 15000);

    return () => {
      document.removeEventListener("click", playOnInteraction);
      document.removeEventListener("touchstart", playOnInteraction);
      document.removeEventListener("keydown", playOnInteraction);
      clearInterval(checkInterval);
    };
  }, [isTV]);

  // Method 10: NoSleep.js library (Provides reliable wake lock across many browsers)
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing NoSleep.js system");
    const noSleep = new NoSleep();

    // Enable wake lock on user interaction
    const enableNoSleep = () => {
      document.removeEventListener('click', enableNoSleep, false);
      document.removeEventListener('touchstart', enableNoSleep, false);
      document.removeEventListener('keydown', enableNoSleep, false);
      noSleep.enable();
      console.log('NoSleep.js is enabled');
    };

    document.addEventListener('click', enableNoSleep, false);
    document.addEventListener('touchstart', enableNoSleep, false);
    document.addEventListener('keydown', enableNoSleep, false);

    // Some TVs might allow programmatic trigger if interaction has occurred previously
    try {
      noSleep.enable();
    } catch (e) {
      // expected on first load, must wait for interaction
    }

    return () => {
      document.removeEventListener('click', enableNoSleep, false);
      document.removeEventListener('touchstart', enableNoSleep, false);
      document.removeEventListener('keydown', enableNoSleep, false);
      noSleep.disable();
    };
  }, [isTV]);

  // Method 11 removed: Hash changing conflicts with HashRouter

  // Method 12: Reloading Hidden Iframe
  // The TV OS might monitor actual page navigations. If a single page stays open for hours,
  // it assumes inactivity. Reloading a hidden iframe simulates true page navigation to the OS.
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing Iframe Reloader keep-awake");

    // We only want to trigger actual navigations gracefully without visual lag
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0.01';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    const reloadInterval = setInterval(() => {
      try {
        // Change src to trigger a real navigation event in the browser engine
        // which resets the system-level sleep timer on many basic Smart OS boards
        iframe.src = 'about:blank?timestamp=' + new Date().getTime();
      } catch (e) {
        // Silent catch
      }
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(reloadInterval);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
  }, [isTV]);

  // Method 13: WebGL Context rendering
  // Forces the GPU to stay awake. Basic 2D canvas might be optimized out 
  // by LG TVs when there is no visual change, but a WebGL context holds the GPU open.
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing WebGL keep-awake");
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    canvas.style.position = 'fixed';
    canvas.style.opacity = '0.01';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-9999';
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    let animationId: number;

    if (gl) {
      const glContext = gl as WebGLRenderingContext;
      let frame = 0;
      let lastRenderTime = 0;

      const render = (timestamp: number) => {
        animationId = requestAnimationFrame(render);

        // Throttle WebGL context to ~5fps to save TV GPU/CPU
        if (timestamp - lastRenderTime < 200) return;
        lastRenderTime = timestamp;

        frame++;
        // Very subtle changing intensity to prevent WebGL pipeline from pausing
        const intensity = (frame % 100) / 10000;
        glContext.clearColor(intensity, 0, 0, 1);
        glContext.clear(glContext.COLOR_BUFFER_BIT);
      };

      animationId = requestAnimationFrame(render);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [isTV]);

  // Method 14: Simulated User Input Events
  // Dispatching trusted-like events periodically to mimic a user physically 
  // sitting in front of the TV and pressing arrows or moving a magic remote.
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing Input Event Simulation keep-awake");

    const eventInterval = setInterval(() => {
      try {
        // Simulate a Shift key press
        const keyEvent = new KeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          keyCode: 16,
          which: 16,
          bubbles: true,
          cancelable: true,
          composed: true
        });
        document.dispatchEvent(keyEvent);

        // Simulate a slight mouse movement
        const mouseEvent = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: Math.random() * window.innerWidth,
          clientY: Math.random() * window.innerHeight
        });
        document.dispatchEvent(mouseEvent);

      } catch (e) {
        // Ignore errors if browser blocks synthetic events
      }
    }, 45000); // Every 45 seconds

    return () => clearInterval(eventInterval);
  }, [isTV]);

  // Method 15: Speech Synthesis Engine
  // On some Smart TVs, the media audio track can sleep if it's identical (like our silent beep).
  // The speech synthesis API hooks into a completely different layer of the OS text-to-speech engine.
  // Speaking an empty string holds the TTS engine open invisibly.
  useEffect(() => {
    if (!isTV) return;

    console.log("Initializing Speech Synthesis keep-awake");

    const speechInterval = setInterval(() => {
      try {
        if ('speechSynthesis' in window) {
          // Create an utterance with no actual text, zero volume, and massive speed
          const utterance = new SpeechSynthesisUtterance(' ');
          utterance.volume = 0;
          utterance.rate = 10;
          utterance.pitch = 0;

          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        // Ignore if unsupported or blocked
      }
    }, 180000); // Every 3 minutes

    return () => {
      clearInterval(speechInterval);
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {
        // Silent catch
      }
    };
  }, [isTV]);

  // Only render elements on TV displays
  if (!isTV) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: '2px',
          height: '2px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      {/* 
        This is the most crucial part for LG WebOS.
        The OS checks for a "fullscreen playing video" to suppress screensavers.
        Opacity MUST be > 0 (0.01 works) so the compositor doesn't strip it from rendering.
      */}
      <video
        ref={videoRef}
        src="/blank.mp4"
        loop
        muted
        playsInline // Required for iOS/WebOS
        autoPlay
        onPause={(e) => {
          // If the TV remote tries to pause the video globally, instantly force it to play again
          e.currentTarget.play().catch(() => { });
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 0.01, /* Crucial: MUST be > 0 so WebOS renderer considers it visible */
          pointerEvents: 'none', /* Prevent interfering with standard clicks */
          zIndex: -9998 /* Sit carefully behind the main UI */
        }}
        {...{ 'webkit-playsinline': 'true' }} // For older WebOS rendering engines
      />
    </>
  );
};

export default KeepAwake;
