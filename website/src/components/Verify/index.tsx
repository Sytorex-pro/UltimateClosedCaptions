import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from "../../context/AuthContext";

// Redirect url from twitch
function Verify() {
    const { login, error } = useContext(AuthContext);
    const ran = useRef<boolean>(false);

    useEffect(()=>{
        // Avoid running twice
        if(!ran.current) {
            ran.current = true;
            // Get code from url
            const code = new URLSearchParams(location.search).get('code');
            if(code) {
                login(code);
            }
        }
    }, [login]);
    
    return (
        <section id="error" className="theme-box padtop">
            <h2>{ error ? 'Error' : 'Redirecting' }</h2>
        </section>
    );
}

export default Verify;