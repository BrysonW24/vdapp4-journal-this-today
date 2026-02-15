export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** data-tour-step attribute value of the target element, or null for centered card */
  target: string | null;
  /** Where to position the tooltip relative to the target */
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Emoji icon for the step */
  icon: string;
  /** Alternative target for mobile (if desktop target is hidden) */
  mobileTarget?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to This, Today!',
    description:
      "Let's take a quick tour to help you get started with your journaling journey.",
    target: null,
    position: 'center',
    icon: '👋',
  },
  {
    id: 'new-entry',
    title: 'Create an Entry',
    description:
      'Start journaling by creating your first entry. Tap here anytime to write.',
    target: 'new-entry-button',
    mobileTarget: 'new-entry-button-mobile',
    position: 'bottom',
    icon: '✏️',
  },
  {
    id: 'journal-selector',
    title: 'Your Journals',
    description:
      'Organise entries into different journals. Create separate spaces for work, personal, or travel.',
    target: 'journal-selector',
    position: 'bottom',
    icon: '📚',
  },
  {
    id: 'search',
    title: 'Search Everything',
    description:
      'Find any entry instantly with full-text search across all your journals.',
    target: 'search-button',
    position: 'bottom',
    icon: '🔍',
  },
  {
    id: 'theme-toggle',
    title: 'Light & Dark Mode',
    description: 'Switch between light and dark themes to match your preference.',
    target: 'theme-toggle',
    position: 'bottom',
    icon: '🌙',
  },
  {
    id: 'quick-start',
    title: 'Quick Start',
    description:
      'Use these shortcuts to quickly create entries from prompts, templates, or voice.',
    target: 'quick-start-section',
    position: 'top',
    icon: '⚡',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description:
      "You're ready to start capturing your thoughts. Your journal stays private on this device.",
    target: null,
    position: 'center',
    icon: '🎉',
  },
];
