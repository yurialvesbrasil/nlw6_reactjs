import firebase from "firebase";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { useHistory } from 'react-router-dom';

type User = {
    id: string,
    name: string,
    avatar: string
}

type AuthContextType = {
    user: User | undefined,
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User>();
    //Identifica se a autenticação está em processamento
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    //Atualiza informações do usuário logado caso
    // a tela é recarregada
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user){
            const { displayName, photoURL, uid} = user;
  
            if(!displayName || !photoURL){
              throw new Error('Missing information from Google Account.');
            }
      
            setUser({
              id: uid,
              name: displayName,
              avatar: photoURL
            })
            
            setLoading(false);
        }
      })
  
      return () => {
        unsubscribe();
      }
    },[])
  
    async function signInWithGoogle(){
      const provider = new firebase.auth.GoogleAuthProvider();
  
      const result = await auth.signInWithPopup(provider);
  
      if (result.user){
        const { displayName, photoURL, uid} = result.user;
        
        if(!displayName || !photoURL){
          throw new Error('Missing information from Google Account.');
        }
  
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    }   

    //Faz o logout do Firebase
    async function signOut(){
      await auth.signOut();
      setUser(undefined);
      history.push('/');
    }

    if(loading){
      return <div className="body-loader"> 
                <span>Loading..</span>
                <div className="c-loader">
                </div>
              </div>
    }

    return (
        <AuthContext.Provider value={{user , signInWithGoogle, signOut}}>
            {props.children}
        </AuthContext.Provider>  
    );
  }