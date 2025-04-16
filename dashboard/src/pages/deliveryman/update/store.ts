import { create } from "zustand";

type State = {
    id: number | null;
    name: string;
    salary: number;
    phone: string;
    password: string;
    isLoaded: boolean;
};

type Actions = {
    setId: (id: number) => void;
    setName: (name: string) => void;
    setPhone: (phone: string) => void;
    setSalary: (salary: number) => void;
    setPassword: (password: string) => void;
    setIsLoaded: (isLoaded: boolean) => void;
    setDriver: (driver: any) => void;
    reset: () => void;
};

type Store = State & Actions;

const initialState: State = {
    id: null,
    name: "",
    phone: "",
    salary: 0,
    password: "",
    isLoaded: false,
};

const useStore = create<Store>((set) => ({
    ...initialState,
    reset: () => set(initialState),
    setId: (id) => set({ id }),
    setName: (name) => set({ name }),
    setPhone: (phone) => set({ phone }),
    setSalary: (salary) => set({ salary }),
    setPassword: (password) => set({ password }),
    setIsLoaded: (isLoaded) => set({ isLoaded }),
    setDriver: (driver) => set({ 
        id: driver.id,
        name: driver.name || "",
        phone: driver.phone || "",
        salary: Number(driver.salary) || 0,
        isLoaded: true
    }),
}));

export default useStore; 