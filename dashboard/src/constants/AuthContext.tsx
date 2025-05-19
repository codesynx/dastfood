import React, { createContext, useContext, useState } from "react";
import { apiInstance } from "../lib/axios";

interface AuthContextType {
    user: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<string | null>(localStorage.getItem("token")); 

    const login = async (email: string, password: string) => {
        try {
            const response = await apiInstance.post("/auth/loginAdmin", {
                email,
                password,
            });

            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                setUser(response.data.token);
                console.log("Кіру сәтті өтті:", response.data.token); 
            } else {
                console.error("Жауаптан токен табылмады");
                throw new Error("API-ден токен алынбады");
            }
        } catch (error) {
            console.error("Кіру сәтсіз аяқталды", error);
            throw new Error("Кіру сәтсіз аяқталды"); 
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth тек AuthProvider ішінде қолданылуы керек");
    }
    return context;
};
