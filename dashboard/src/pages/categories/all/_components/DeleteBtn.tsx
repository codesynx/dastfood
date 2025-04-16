"use client";
import { Trash2 } from "lucide-react";

import LoadingButton from "@/components/shared/LoadingButton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiInstance } from "@/lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type Props = {
    id: number;
};

export default function DeleteCategoryBtn({ id }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const handleConfirm = async () => {
        setIsLoading(true);
        apiInstance
            .delete(`/categories/${id}`)
            .then(() => {
                toast.success("Категория өшірілді");
                setIsOpen(false);
                setIsLoading(false);
                navigate(0);
            })
            .catch(() => toast.error("Категория өшіру мүмкін болмады"));
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogTrigger onClick={() => setIsOpen(true)}>
                <button className="bg-red-500 ml-2 active:scale-95 transition-all hover:bg-red-600 p-2 text-white rounded-md">
                    <Trash2 className="w-5 h-5" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Сіз нақты сенімдісіз бе?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Бұл әрекетті болдырмау мүмкін емес. Бұл курьер біржола өшіріледі.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isLoading}
                        onClick={() => !isLoading && setIsOpen(false)}
                        className="font-semibold ">
                        Бас тарту
                    </AlertDialogCancel>
                    <AlertDialogAction
                        asChild
                        className="bg-red-500 text-sm font-semibold ">
                        <LoadingButton
                            onClick={handleConfirm}
                            isLoading={isLoading}>
                            Өшіру
                        </LoadingButton>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
