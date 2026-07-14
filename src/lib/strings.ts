/**
 * All user-facing UI string literals live here (localization-ready per
 * Founder Decision 11). No inline user-facing text in components.
 * When a second language is scheduled, this module becomes the default
 * message catalog for next-intl.
 */
export const strings = {
  brand: {
    name: "AIQ",
    tagline: "AI Work Style & Readiness Assessment",
  },
  landing: {
    heroTitle: "Discover how you really work with AI",
    heroSubtitle:
      "A 3-minute behavioral assessment that reveals your AI work style — not how much jargon you know.",
    cta: "Start the assessment",
    ctaSecondary: "Sign in",
    noSignupNote: "No account needed to start.",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your AIQ account",
    signupTitle: "Create your account",
    signupSubtitle: "See your results and track your progress",
    resetTitle: "Reset your password",
    resetSubtitle: "We'll email you a reset link",
    emailLabel: "Email",
    passwordLabel: "Password",
    fullNameLabel: "Full name",
    loginAction: "Sign in",
    signupAction: "Create account",
    resetAction: "Send reset link",
    resetSent: "Check your email for a reset link.",
    toSignup: "New to AIQ? Create an account",
    toLogin: "Already have an account? Sign in",
    toReset: "Forgot your password?",
    signOut: "Sign out",
  },
  dashboard: {
    title: "Dashboard",
    emptyTitle: "No assessments yet",
    emptyBody: "Take your first assessment to discover your AI work style.",
    emptyAction: "Start the assessment",
  },
  assessment: {
    placeholderTitle: "The assessment is being built",
    placeholderBody:
      "The assessment engine arrives in Milestone 1. This route is reserved for it.",
  },
  admin: {
    title: "Admin",
  },
  errors: {
    genericTitle: "Something went wrong",
    genericBody: "An unexpected error occurred. Please try again.",
    retry: "Try again",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you're looking for doesn't exist.",
    goHome: "Go home",
    authFailed: "Sign-in failed. Check your email and password.",
    signupFailed: "Could not create your account. Please try again.",
    invalidInput: "Please check the highlighted fields.",
  },
} as const;
