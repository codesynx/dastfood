import SaveAndCancelBtns from "@/components/shared/saveAndCancelBtns";
import useStore from "../store";
import { z } from "zod";
import toast from "react-hot-toast";
import { apiInstance } from "@/lib/axios";
import { useState } from "react";
import { wait } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type Props = {
    stopPageLoading?: () => void;
};

export default function Buttons({ stopPageLoading }: Props) {
    const data = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSave = async () => {
        const payload: Record<string, any> = {
            name: data.name,
            phone: data.phone,
            salary: data.salary,
        };
        
        if (data.password) {
            payload.password = data.password;
        }
        
        const { error, success } = DeliveryManSchema.safeParse(payload);
        
        if (error) {
            error.errors.forEach((err) =>
                toast.error(`${err.path.join(" / ")} ${err.message}`)
            );
            return;
        }

        if (!success) {
            return;
        }

        toast.loading("Курьердің ақпаратын жаңарту");
        setIsLoading(true);
        
        if (stopPageLoading) {
            stopPageLoading();
        }

        apiInstance
            .put(`/auth/DileveryMan/${data.id}`, payload)
            .then(() => {
                toast.dismiss();
                toast.success("Курьердің ақпараты сәтті жаңартылды");
                wait(100).then(() => navigate("/drivers"));
            })
            .catch((error) => {
                toast.dismiss();
                console.error(error);
                toast.error("Курьердің ақпаратын жаңарту кезінде қате пайда болды");
            })
            .finally(() => setIsLoading(false));
    };

    const handleCancel = () => {
        navigate("/drivers");
    };

    return (
        <SaveAndCancelBtns
            onSaveClick={handleSave}
            onCancel={handleCancel}
            disabled={isLoading}
            className="ml-auto"
        />
    );
}

const DeliveryManSchema = z.object({
    name: z.string().min(1, "Аты-жөні бос болмауы керек"),
    phone: z.string().min(1, "Телефон номері бос болмауы керек"),
    password: z.string().optional(),
    salary: z.number().default(0),
}); 