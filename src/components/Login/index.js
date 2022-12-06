import { Button } from "@mui/material"
import { useState } from "react";
import { handleLogin } from "../../gmail"

export default function Login() {
    const [getAuthState, setAuthState] = useState();
    async function login() {
        setAuthState({ auth: await handleLogin() });
        console.log('login result', getAuthState);
    }

    return !getAuthState && <Button variant="contained" onClick={login}>Login</Button>
}
