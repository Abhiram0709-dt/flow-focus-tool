import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";

export const Turnstile = forwardRef((props, ref) => {
  const {
    siteKey,
    onVerify,
    onError,
    theme = "auto",
    size = "normal",
  } = props;
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // Store callbacks in refs to prevent re-renders from affecting the widget
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
  }, [onVerify, onError]);

  useEffect(() => {
    // Wait for Turnstile script to load
    const checkTurnstileReady = () => {
      if (window.turnstile) {
        console.log("Turnstile script loaded");
        setIsScriptLoaded(true);
      } else {
        console.log("Waiting for Turnstile script...");
        setTimeout(checkTurnstileReady, 100);
      }
    };
    checkTurnstileReady();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isScriptLoaded || !window.turnstile) {
      return;
    }

    // Check if already rendered
    if (widgetIdRef.current) {
      console.log("Widget already rendered, skipping");
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!containerRef.current || widgetIdRef.current) return;

      console.log("Rendering Turnstile with siteKey:", siteKey);

      try {
        // Render Turnstile widget
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            console.log("Turnstile SUCCESS! Token received:", token.substring(0, 20) + "...");
            if (onVerifyRef.current) onVerifyRef.current(token);
          },
          "error-callback": (error) => {
            console.error("Turnstile ERROR:", error);
            if (onErrorRef.current) onErrorRef.current(error);
          },
          theme,
          size,
        });

        console.log("Turnstile widget rendered with ID:", widgetId);
        widgetIdRef.current = widgetId;
      } catch (error) {
        console.error("Exception while rendering Turnstile:", error);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      // Don't remove widget on re-render, only on unmount
    };
  }, [siteKey, isScriptLoaded]); // Remove callbacks from dependencies

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    // Get the current token
    getResponse: () => {
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current);
      }
      return null;
    },

    // Check if widget is expired
    isExpired: () => {
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.isExpired(widgetIdRef.current);
      }
      return true;
    },

    // Reset the widget (clears current state)
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },

    // Execute the challenge manually
    execute: () => {
      if (containerRef.current && window.turnstile) {
        window.turnstile.execute(containerRef.current);
      }
    },

    // Remove the widget completely
    remove: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    },

    // Get widget ID (for advanced use)
    getWidgetId: () => widgetIdRef.current,
  }));

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
});

