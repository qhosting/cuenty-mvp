'use client';

import { useEffect } from 'react';

interface ChatwootSettings {
  hideMessageBubble?: boolean;
  position?: 'left' | 'right';
  locale?: string;
  type?: 'standard' | 'expanded_bubble';
}

interface ChatwootWidgetProps {
  websiteToken: string;
  baseUrl?: string;
  settings?: ChatwootSettings;
}

declare global {
  interface Window {
    chatwootSettings?: any;
    $chatwoot?: any;
    chatwootSDK?: any;
  }
}

export default function ChatwootWidget({
  websiteToken,
  baseUrl = 'https://app.chatwoot.com',
  settings = {}
}: ChatwootWidgetProps) {
  useEffect(() => {
    // Configure Chatwoot settings
    window.chatwootSettings = {
      hideMessageBubble: settings.hideMessageBubble || false,
      position: settings.position || 'right',
      locale: settings.locale || 'es',
      type: settings.type || 'standard',
    };

    // Function to load Chatwoot
    const loadChatwoot = () => {
      // Check if script is already loaded
      if (document.getElementById('chatwoot-script')) {
        return;
      }

      // Create and append the script
      const script = document.createElement('script');
      script.id = 'chatwoot-script';
      script.src = `${baseUrl}/packs/js/sdk.js`;
      script.defer = true;
      script.async = true;

      script.onload = () => {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: websiteToken,
            baseUrl: baseUrl,
          });
        }
      };

      script.onerror = () => {
        console.error('Error loading Chatwoot widget');
      };

      document.body.appendChild(script);
    };

    loadChatwoot();

    // Cleanup function
    return () => {
      // Remove the widget when component unmounts
      const script = document.getElementById('chatwoot-script');
      if (script) {
        script.remove();
      }
      
      // Remove Chatwoot bubble
      const chatwootBubble = document.querySelector('.woot-widget-bubble');
      if (chatwootBubble) {
        chatwootBubble.remove();
      }

      // Remove Chatwoot holder
      const chatwootHolder = document.querySelector('.woot--bubble-holder');
      if (chatwootHolder) {
        chatwootHolder.remove();
      }
    };
  }, [websiteToken, baseUrl, settings]);

  return null;
}
