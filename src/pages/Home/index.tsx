import { useHistory } from 'react-router-dom';
import illustrationImg from '../../assets/images/illustration.svg';
import logoImg from '../../assets/images/logo.svg';
import googleIconImg from '../../assets/images/google-icon.svg';
import './styles.scss';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { FormEvent, useState } from 'react';
import { database } from '../../services/firebase';
import { useTheme } from '../../hooks/useTheme';

export function Home() {
    const history = useHistory();
    const { user, signInWithGoogle, signOut } = useAuth();
    const [roomCode, setRoomCode] = useState('');
    const { theme, toggleTheme } = useTheme();

    async function handleSignOut() {
        if (user) {
            await signOut();
        }
    }
    
    async function handleCreateRoom() {
        if (!user) {
            await signInWithGoogle();
        }
        history.push('/rooms/new');
    }

    async function handleJoinRoom(event: FormEvent) {
        event.preventDefault();

        if (roomCode.trim() === '') {
            return;
        }

        const roomRef = await database.ref(`rooms/${roomCode}`).get();

        if (!roomRef.exists()) {
            alert('Room does not exists');
            return;
        }

        if (roomRef.val().endedAt){
            alert('Room already closed.');
            return;
        }

        history.push(`/rooms/${roomCode}`);
    }

    return (
        <div id="page-auth" className={theme}>
            <aside>
                <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas"></img>
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire suas dúvidas da sua audiência em tempo-real</p>
            </aside>
            <main>
                <div className="main-content">

                    <button onClick={toggleTheme}>Toggle</button>
                    <img src={logoImg} alt="Letmeask" />
                    {user ? (
                        <div className="logado-ops">
                            <Button onClick={handleCreateRoom} >Criar sala</Button>
                            <Button isOutline onClick={handleSignOut}>Logoff</Button>
                        </div>
                    ) : (
                        <button onClick={handleCreateRoom} className="create-room">
                            <img src={googleIconImg} alt="Logo do Google" />
                            Crie sua sala com o Goolge
                        </button>
                    )}
                    <div className="separator">ou entre em uma sala</div>
                    <form onSubmit={handleJoinRoom}>
                        <input
                            type="text"
                            placeholder="Digite o código da sala"
                            onChange={event => setRoomCode(event.target.value)}
                            value={roomCode}
                        />
                        <Button type="submit">
                            Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}