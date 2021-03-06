import * as React from 'react';
import { MdSettings } from 'react-icons/md';
import { Box, Overlay } from 'reakit';
import { SettingsDialog } from './SettingsDialog';
import { ToolbarButton } from './ToolbarButton';

export function SettingsButton() {
  return (
    <SettingsDialog>
      {(overlay) => (
        <Overlay.Show
          data-test-button="neo-one-settings-button"
          data-test-tooltip="neo-one-settings-tooltip"
          as={ToolbarButton}
          help="Open Settings..."
          {...overlay}
        >
          <Box>
            <MdSettings />
          </Box>
        </Overlay.Show>
      )}
    </SettingsDialog>
  );
}
