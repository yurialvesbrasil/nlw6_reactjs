import logoImg from '../../assets/images/logo.svg';
import { Button } from '../../components/Button';
import { RoomCode } from '../../components/RoomCode';
import './styles.scss';
import { useParams } from 'react-router-dom';
import deleteImg from '../../assets/images/delete.svg';
import { Question } from '../../components/Question';
import { useRoom } from '../../hooks/useRoom';
import { database } from '../../services/firebase';
import { useHistory } from 'react-router-dom';

type RoomParams = {
    id: string;
}

export function AdminRoom(){
    const params = useParams<RoomParams>();
    const { title, questions } = useRoom(params.id);
    const history = useHistory();

    async function handleEndRoom(){
        await database.ref(`rooms/${params.id}`).update({
            endedAt: new Date()
        })

        history.push('/');
    }

    async function handleDeleteQuestion(questionId: string){
        if(window.confirm('Tem certeza que você deseja excluir esta pergunta?')){
            await database.ref(`rooms/${params.id}/questions/${questionId}`).remove();
        }
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Logo do site"/>
                    <div>
                        <RoomCode code={params.id}/>
                        <Button isOutline onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 ? questions.length === 1 ? <span>{questions.length} pergunta </span>:<span>{questions.length} perguntas </span> : <span>0 perguntas</span>}  
                </div>

                <div className="question_list">
                    {questions.map(question => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Remover pergunta"></img>
                                </button>
                            </Question>    
                        );
                    })}
                </div>
            </main>
        </div>
    )
}