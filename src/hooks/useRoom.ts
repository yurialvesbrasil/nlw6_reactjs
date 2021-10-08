import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../services/firebase";
import { useAuth } from '../hooks/useAuth';

//Record -> cria um objeto
type FirebaseQuestion = Record<string, {
    author:{
        name: string;
        avatar: string;
    },
    content: string;
    isHighLighted: boolean;
    isAnswered: boolean;
    likes: Record<string, {
        authorId: string
    }>
}>

type QuestionType = {
    id: string;
    author:{
        name: string;
        avatar: string; 
    },
    content: string;
    isHighLighted: boolean;
    isAnswered: boolean;
    likeCount: number;
    likeId: string | undefined;
}

export function useRoom(roomId: string){
    const {user} = useAuth();
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [title, setTitle] = useState<string>('');
    const navigate = useNavigate();
    
        //Só usuários logado pode ver essa página
        useEffect(() => {
            if(!user){
                navigate('/');
            }
        } ,[user, navigate]);
    
        //Função hook que dispara um evento sempre que 
        //uma informação mudar, no caso é o id da sala
        useEffect(() => {
            const roomRef = database.ref(`rooms/${roomId}`);
    
            //Vai escutar uma unica vez (once)
            //para ficar escutando (on)
            roomRef.on('value', room => {
                const databaseRoom = room.val();
                const firebaseQuestions: FirebaseQuestion = databaseRoom.questions ?? {};
                
                const parsedQuestions:QuestionType[] = Object.entries(firebaseQuestions).map(([key, value]) => {
                  return{
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighLighted: value.isHighLighted,
                    isAnswered: value.isAnswered,
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0]
                  }
                });
                const questionSorted = parsedQuestions.sort((a,b) => a.likeCount - b.likeCount);
                setTitle(databaseRoom.title);
                setQuestions(questionSorted.reverse());
            });
            
            return () =>{
                roomRef.off('value');
            }
        }, [ roomId, user?.id ]);

        return { questions, title}
}