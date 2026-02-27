import { Box, Typography } from "@mui/material";
import { useStatus } from '../../contexts/StatusContext.js'; // Ensure path is correct

/**
 * `SyncStatus` is a React component that displays the current application
 * synchronization or general status message. It consumes `StatusContext`
 * to get the `syncStatusMessage`.
 *
 * @returns {JSX.Element} A Material UI Box containing Typography to display the status message.
 *                        If `syncStatusMessage` is empty or null, it renders a non-breaking space
 *                        to maintain layout consistency.
 */
export default function SyncStatus() {
    const { syncStatusMessage } = useStatus();

    return (
        <Box sx={{ width: '100%', padding: '8px 0', minHeight: '20px' /* Ensure consistent height */ }}>
            <Typography variant="caption" component="div" color="text.secondary">
                {syncStatusMessage || "\u00A0"} {/* Display message or a non-breaking space */}
            </Typography>
            {/*
              Future enhancement: Conditionally render a LinearProgress bar
              based on specific content of syncStatusMessage, for example:
              {syncStatusMessage && syncStatusMessage.toLowerCase().includes("fetching") && (
                <LinearProgress sx={{ marginTop: '4px' }} />
              )}
            */}
        </Box>
    );
}
