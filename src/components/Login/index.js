import { Button } from "@mui/material"
import { useState } from "react";
import { handleLogin } from "../../gmail"

export default function Login({ onSuccess }) {
    const [authState, setAuthState] = useState();
    async function login() {
        setAuthState({ auth: await handleLogin() });
        console.log('login result', authState);
        onSuccess && onSuccess();
    }

    return !authState && <Button variant="contained" onClick={login}>Login</Button>
}
