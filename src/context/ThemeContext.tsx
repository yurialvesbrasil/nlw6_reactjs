import { createContext, ReactNode, useEffect, useState } from "react";

type ThemeType = 'light' | 'dark';

type ThemeContextProviderProps ={
    children: ReactNode;
}

type ThemeContextType = {
    theme: ThemeType,
    toggleTheme: () => void
}

export const ThemeContext = createContext({} as ThemeContextType);

export function ThemeContextProvider(props: ThemeContextProviderProps){
    const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
        const storangeTheme = localStorage.getItem('theme');
     
        return (storangeTheme ?? 'light') as ThemeType;
    });

    //Gravar escolha de thema no user storange
    useEffect(() => {
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme])

    function toggleTheme(){
        setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
    }

    return(
        <ThemeContext.Provider value={{theme: currentTheme, toggleTheme}}>
            {props.children}
        </ThemeContext.Provider>
    );
}