import LoadingPage from "@/components/shared/LoadingPage";
import TopBar from "@/components/shared/topBar";
import { apiInstance } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Buttons from "./_components/Button";
import GeneralInfo from "./_components/GeneralInfo";
import useStore from "./store";

export default function UpdateDriver() {
    const { id } = useParams<{ id: string }>();
    const { setDriver, isLoaded } = useStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            apiInstance
                .get(`/auth/DileveryMan/${id}`)
                .then((res) => {
                    setDriver(res.data);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Курьердің ақпаратын жүктеу кезінде қате пайда болды");
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, setDriver]);

    if (isLoading || !isLoaded) {
        return <LoadingPage />;
    }

    return (
        <main className="flex">
            <section className="w-full pb-10">
                <TopBar text="Курьердің ақпаратын жаңарту">
                    <Buttons stopPageLoading={() => setIsLoading(false)} />
                </TopBar>
                <section className="grid gap-8 grid-cols-2 h-auto pt-5 px-10 w-full">
                    <GeneralInfo />
                </section>
            </section>
        </main>
    );
} 