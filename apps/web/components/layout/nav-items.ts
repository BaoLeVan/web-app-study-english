/** Sidebar navigation — extends the design's 5 items to the full feature set. */
export interface NavItem {
  label: string;
  href: string;
  /** Material Symbols Outlined ligature. */
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Word Sets', href: '/vocabulary', icon: 'menu_book' },
  { label: 'Speaking', href: '/speaking', icon: 'mic' },
  { label: 'Listening', href: '/listening', icon: 'hearing' },
  { label: 'Writing', href: '/writing', icon: 'edit_note' },
  { label: 'My Content', href: '/my-content', icon: 'video_library' },
  { label: 'Progress', href: '/progress', icon: 'query_stats' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];
