import { Box, LinearProgress } from "@mui/material";
import { useState } from "react";
import { authContext } from "../../gmail";

export default function SyncStatus() {
    const [isReady, setReady] = useState();
    authContext.then(() => setReady(true));
    return isReady && <Box sx={{ width: '100%' }} data-testid="sync-status"> <LinearProgress /></Box >;
}
