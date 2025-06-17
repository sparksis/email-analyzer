import { Button } from "@mui/material";
import { useAuth } from '../../contexts/AuthContext.js'; // Ensure path is correct

/**
 * Login component that displays a "Login" or "Logout" button based on the
 * authentication state from `AuthContext`.
 * The login action is triggered by calling the `onSuccess` prop, which is expected
 * to initiate the full login and data fetching sequence managed by `AppContent`.
 * The logout action directly calls the `logout` function from `AuthContext`.
 *
 * @param {object} props - The component's props.
 * @param {function(): void} props.onSuccess - Callback function executed when the login button is clicked.
 *                                            This function is responsible for initiating the login process
 *                                            (e.g., by calling the login method from `AuthContext`)
 *                                            and any subsequent actions like data fetching.
 * @returns {JSX.Element} A Material UI Button for "Login" or "Logout".
 */
export default function Login({ onSuccess }) {
    const { isLoggedIn, logout: authLogout } = useAuth();

    /**
     * Handles the click event for the "Login" button.
     * It calls the `onSuccess` prop passed from the parent component (`AppContent`),
     * which orchestrates the login flow using `AuthContext` and subsequent data fetching.
     */
    const handleLoginClick = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            console.error("Login component: onSuccess prop is not defined.");
            // Potentially set an error state or show a message to the user
        }
    };

    /**
     * Handles the click event for the "Logout" button.
     * It calls the `authLogout` function from `AuthContext` to log the user out.
     * Errors during logout are caught and logged.
     * @async
     */
    const handleLogoutClick = async () => {
        try {
            await authLogout();
            // UI updates (e.g., button changing from "Logout" to "Login")
            // are driven by the `isLoggedIn` state change in AuthContext.
        } catch (error) {
            console.error("Logout failed from Login component:", error);
            // Optionally, display an error message to the user via StatusContext or local state.
        }
    };

    if (isLoggedIn) {
        return <Button variant="contained" color="secondary" onClick={handleLogoutClick}>Logout</Button>;
    }

    return <Button variant="contained" onClick={handleLoginClick}>Login</Button>;
}
