import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import '../styles/room.scss';
import { useParams } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

//Record -> cria um objeto
type FirebaseQuestion = Record<string, {
    author:{
        name: string,
        avatar: string
    },
    content: string,
    isHighLighted: boolean,
    isAnswered: boolean
}>

type Question = {
    id: string,
    author:{
        name: string ,
        avatar: string 
    },
    content: string,
    isHighLighted: boolean,
    isAnswered: boolean
}

type RoomParams = {
    id: string;
}

export function Room(){
    const {user, signInWithGoogle} = useAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState<string>('');
    //Função hook que dispara um evento sempre que 
    //uma informação mudar, no caso é o id da sala
    useEffect(() => {
        const roomRef = database.ref(`rooms/${params.id}`);

        //Vai escutar uma unica vez (once)
        //para ficar escutando (on)
        roomRef.on('value', room => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestion = databaseRoom.questions ?? {};
            
            const parsedQuestions:Question[] = Object.entries(firebaseQuestions).map(([key, value]) => {
              return{
                id: key,
                content: value.content,
                author: value.author,
                isHighLighted: value.isHighLighted,
                isAnswered: value.isAnswered
              }
            });
            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
        });

        
    }, [ params.id]);

    async function handleLogin(){
        if(user) return;
        await signInWithGoogle();
    }

    async function handleSendQuestion(event: FormEvent){
       event.preventDefault();

        if(newQuestion.trim() === ''){
            return;
        }

        if(!user){
            await signInWithGoogle();
        }

        const question = {
            content: newQuestion,
            author: {
                name: user?.name,
                avatar: user?.avatar
            },
            isHighLighted: false,
            isAnswered: false
        }

        await database.ref(`rooms/${params.id}/questions`).push(question);

        setNewQuestion('');
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Logo do site"/>
                    <RoomCode code={params.id}/>
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 ? questions.length === 1 ? <span>{questions.length} pergunta </span>:<span>{questions.length} perguntas </span> : <span>0 perguntas</span>}  
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea 
                        placeholder="O que você quer perguntar?"
                        onChange={event => setNewQuestion(event.target.value)}
                        value={newQuestion}
                    />
                    <div className="form-footer">
                        { user ? (
                          <div className="user-info">
                              <img src={user.avatar} alt={user.name} />
                              <span>{user.name}</span>
                          </div>      
                        ):(
                           <span >Para enviar uma pergunta, <button onClick={handleLogin}>faça seu login.</button></span>  
                        )}
                        <Button type="submit">Enviar pergunta</Button>   
                    </div>
                </form>
            </main>
        </div>
    )
}