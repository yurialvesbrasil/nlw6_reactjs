import logoImg from '../../assets/images/logo.svg';
import { Button } from '../../components/Button';
import { RoomCode } from '../../components/RoomCode';
import './styles.scss';
import { useParams } from 'react-router-dom';
import { Question } from '../../components/Question';
import { useRoom } from '../../hooks/useRoom';
import { database } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { ShowModal } from '../../components/Modal';
import React from 'react';
import deleteImg from '../../assets/images/delete.svg';
import checkImg from '../../assets/images/check.svg';
import answerImg from '../../assets/images/answer.svg';
import { useTheme } from '../../hooks/useTheme';

/*type RoomParams = {
    id: string;
}*/

export function AdminRoom() {
    const { id } = useParams();
    const { title, questions } = useRoom(id ?? "0");
    const navigate = useNavigate();
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [selectedQuestioId, setSelectedQuestioID] = React.useState('');
    const { theme } = useTheme();

    async function handleEndRoom() {
        await database.ref(`rooms/${id}`).update({
            endedAt: new Date()
        })

        navigate('/');
    }

    function handleOpenModal() {
        setIsOpen(true);
    }

    function handleCloseModal() {
        setIsOpen(false);
    }

    function handleOkModal() {
        handleDeleteQuestion();
        setIsOpen(false);
    }

    async function handleDeleteQuestion() {
        await database.ref(`rooms/${id}/questions/${selectedQuestioId}`).remove();
    }

    async function handleCheckQuestionAsAnswered(questioId: string) {
        await database.ref(`rooms/${id}/questions/${questioId}`).update({
            isAnswered: true,
        });
    }

    async function handleHighlightQuestion(questioId: string) {
        await database.ref(`rooms/${id}/questions/${questioId}`).update({
            isHighLighted: true,
        });
    }

    return (
        <div id="page-room" className={theme}>
            <header>
                <div className="content">
                    <img src={logoImg} alt="Logo do site" />
                    <div>
                        <RoomCode code={id ?? "0"} />
                        <Button isOutline onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>
            <main>
                <ShowModal modalIsOpen={modalIsOpen} closeModal={handleCloseModal} okModal={handleOkModal} />
                <div className="room-title">
                    <h1 className={theme}>Sala {title}</h1>
                    {questions.length > 0 ? questions.length === 1 ? <span>{questions.length} pergunta </span> : <span>{questions.length} perguntas </span> : <span>0 perguntas</span>}
                </div>

                <div className="question_list">
                    {questions.map(question => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                                isAnswered={question.isAnswered}
                                isHighLighted={question.isHighLighted}
                            >
                                {!question.isAnswered && (
                                    <React.Fragment>
                                        <button
                                            type="button"
                                            onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                        >
                                            <img src={checkImg} alt="Check pergunta como respondida"></img>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleHighlightQuestion(question.id)}
                                        >
                                            <img src={answerImg} alt="Dar destaque a pergunta"></img>
                                        </button>
                                    </React.Fragment>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedQuestioID(question.id);
                                        return handleOpenModal()
                                    }}
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