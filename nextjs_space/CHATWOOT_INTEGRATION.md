# Chatwoot Integration Guide

## Overview

Chatwoot has been integrated into the CUENTY application to provide customer support chat functionality across all pages.

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=your-website-token-here
NEXT_PUBLIC_CHATWOOT_BASE_URL=https://app.chatwoot.com
```

### Getting Your Website Token

1. Log in to your Chatwoot account
2. Go to Settings → Inboxes
3. Select your Website inbox or create a new one
4. Copy the Website Token from the installation instructions
5. Add it to your environment variables

### Self-Hosted Chatwoot

If you're using a self-hosted Chatwoot instance, update the `NEXT_PUBLIC_CHATWOOT_BASE_URL` to your instance URL:

```env
NEXT_PUBLIC_CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
```

## Features

- **Live Chat Widget**: Appears on all pages in the bottom-right corner
- **Spanish Locale**: Default language is set to Spanish (es)
- **Automatic User Identification**: Can be enhanced to automatically identify logged-in users
- **Mobile Responsive**: Works seamlessly on mobile devices
- **Customizable Position**: Can be positioned on left or right side

## Customization

### Widget Settings

You can customize the widget by modifying the settings in `/app/layout.tsx`:

```typescript
<ChatwootWidget 
  websiteToken={process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'your-website-token'}
  baseUrl={process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://app.chatwoot.com'}
  settings={{
    hideMessageBubble: false,  // Set to true to hide the bubble initially
    position: 'right',          // 'left' or 'right'
    locale: 'es',              // Language code
    type: 'standard'           // 'standard' or 'expanded_bubble'
  }}
/>
```

### User Identification

To automatically identify logged-in users, you can enhance the ChatwootWidget component to accept user information:

```typescript
// Example: Pass user data
<ChatwootWidget 
  websiteToken={token}
  baseUrl={baseUrl}
  user={{
    identifier: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone
  }}
/>
```

## Advanced Features

### Custom Attributes

You can set custom attributes for better customer context:

```javascript
window.$chatwoot.setCustomAttributes({
  accountType: 'premium',
  subscriptionPlan: 'monthly',
  registrationDate: '2024-01-01'
});
```

### Toggle Widget Programmatically

```javascript
// Open the widget
window.$chatwoot.toggle('open');

// Close the widget
window.$chatwoot.toggle('close');
```

### Event Listeners

Listen to Chatwoot events:

```javascript
window.addEventListener('chatwoot:ready', () => {
  console.log('Chatwoot is ready');
});

window.addEventListener('chatwoot:open', () => {
  console.log('Chat widget opened');
});

window.addEventListener('chatwoot:close', () => {
  console.log('Chat widget closed');
});
```

## Testing

1. Ensure your environment variables are set correctly
2. Restart your Next.js development server
3. Visit any page on your application
4. Look for the Chatwoot widget in the bottom-right corner
5. Click to open and test the chat functionality

## Troubleshooting

### Widget Not Appearing

1. Verify your website token is correct
2. Check browser console for any errors
3. Ensure the Chatwoot script is loading (check Network tab)
4. Verify your inbox is active in Chatwoot settings

### Widget Position Issues

If the widget conflicts with other elements:

1. Adjust the `position` setting to 'left'
2. Add custom CSS to modify the widget position
3. Check z-index conflicts with other components

### Script Loading Errors

If you see script loading errors:

1. Check your base URL is correct
2. Ensure your Chatwoot instance is accessible
3. Check CORS settings if using a custom domain

## Production Deployment

1. Add environment variables to your production hosting platform
2. Test the widget functionality in production
3. Configure Chatwoot business hours if needed
4. Set up automated responses and canned responses
5. Train your support team on the Chatwoot dashboard

## Support

For more information about Chatwoot:
- Documentation: https://www.chatwoot.com/docs
- GitHub: https://github.com/chatwoot/chatwoot
- Community: https://www.chatwoot.com/community

## Notes

- The widget is loaded asynchronously to avoid blocking page load
- The component automatically cleans up when unmounted
- Multiple instances of the widget on the same page are prevented
- The widget respects user's Do Not Track preferences (if configured)
