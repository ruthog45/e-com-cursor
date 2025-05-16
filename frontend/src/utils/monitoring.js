import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import newrelic from 'newrelic';

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
};

// Custom error tracking
export const trackError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Performance monitoring
export const trackPerformance = (name, duration, attributes = {}) => {
  newrelic.addPageAction(name, {
    duration,
    ...attributes,
  });
};

// Custom event tracking
export const trackEvent = (category, action, label = null, value = null) => {
  newrelic.addPageAction('custom_event', {
    category,
    action,
    label,
    value,
  });

  // Also track in Sentry for error correlation
  Sentry.addBreadcrumb({
    category,
    message: action,
    level: 'info',
    data: { label, value },
  });
}; 