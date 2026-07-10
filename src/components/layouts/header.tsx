import { authClient } from '@/lib/auth-client'
import { Link, useNavigate } from '@tanstack/react-router'

export function Header() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await authClient.signOut()

        navigate({
            to: '/auth/login',
        })
    }

    return (
        <header>
            <nav>
                <Link to="/console">Console</Link>
                <Link to="/console/asterisk">Asterisk</Link>
                <Link to="/console/events">Events</Link>
                <Link to="/console/channels">Channels</Link>
                <Link to="/console/device-states">Device States</Link>
            </nav>
            <button onClick={handleLogout}>Logout</button>
        </header>
    )
}