export const transcriptPanelStyles = {
  // Wide screens: a column on the right, mirroring the sidebar. Narrow screens: a capped block under the controls.
  aside: 'hidden w-80 shrink-0 flex-col border-hairline border-s bg-card/40 lg:flex',
  inline: 'flex max-h-64 w-full max-w-md flex-col rounded-md border border-hairline bg-card shadow-rest-lift lg:hidden',
  // column-reverse keeps the newest line in view without scripted scrolling.
  scroller: 'flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-3 pb-3',
}
