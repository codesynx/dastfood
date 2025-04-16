import { Input } from "@/components/ui/input";
import { useAuth } from "@/constants/AuthContext";
import { Eye, Loader2, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [input, setInput] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.email && input.password.length >= 6) {
            try {
                setIsLoading(true);
                await login(input.email, input.password);
                navigate("/dashboard");
            } catch (err) {
                setError("Login failed. Please check your credentials.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setError(
                "Please provide a valid email and a password with at least 6 characters."
            );
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left side with wave design */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-white overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        alt=""
                        src="/login-bg.svg"
                        className="h-full object-cover border-2"
                    />
                </div>
            </div>

            {/* Right side with login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Dastarkhana басқару панелі 
                        </h1>
                        <p className="text-gray-500 text-sm">
                        Бұл бөлім тек әкімшілерге арналған. Жүйеге кіру үшін өз деректеріңізді енгізіңіз.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={handleInput}
                                    placeholder="admin@dastarkhana.kz"
                                    className="w-full bg-white border-gray-200 text-gray-900 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>

                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={input.password}
                                    onChange={handleInput}
                                    placeholder="Құпия сөз"
                                    className="w-full bg-white border-gray-200 text-gray-900 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer" />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        <div className="space-y-3 pt-2">
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full active:scale-95 transition-all disabled:opacity-80 hover:bg-stone-900 flex items-center justify-center bg-stone-800  text-white py-[10px] rounded-md ">
                                Кіру{" "}
                                {isLoading && (
                                    <span className="scale-75 ml-1">
                                        <Loader2 className="animate-spin " />
                                    </span>
                                )}
                            </button>

                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
