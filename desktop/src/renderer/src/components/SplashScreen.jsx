import LoadingIcon from "../assets/5.svg";
import { useTranslation } from 'react-i18next';

/**
 * SplashScreen (SplashScreen) - Schermata di transizione generica
 *
 * Usata per:
 * - Avvio applicazione (Splash Screen)
 * - Logout / Reload
 * - Attesa backend
 *
 * @param {string} message - Messaggio da mostrare sotto lo spinner
 */
export default function SplashScreen({ message }) {
    const { t } = useTranslation();
    const displayMessage = message || t("Loading...");

    return (
        <div className="logout-screen">
            <div className="logout-content text-center">
                <img
                    src={LoadingIcon}
                    alt="AssociaGo Loading"
                    className="logout-logo mb-4"
                    style={{ width: "500px", height: "500px" }}
                />
                <h4 className="fw-bold mb-3">AssociaGo</h4>
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span>{displayMessage}</span>
                </div>
            </div>

            <style>{`
                .logout-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #f5f7fa; /* Colore neutro */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999; /* Sopra tutto */
                }

                .logout-content {
                    animation: fadeIn 0.5s ease-in-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
