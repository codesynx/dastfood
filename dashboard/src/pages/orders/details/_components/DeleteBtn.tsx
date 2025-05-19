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
import { cn } from "@/lib/utils";

type Props = {
    id: number;
    className?: string;
};

export default function DeleteBtn({ id, className }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleConfirm = async () => {
        setIsLoading(true);
        apiInstance
            .delete(`/orders/${id}`)
            .then(() => {
                toast.success("Тапсырыс жойылды");
                setIsOpen(false);
                setIsLoading(false);
                navigate(-1);
            })
            .catch(() => toast.error("Тапсырысты жою мүмкін болмады"));
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogTrigger onClick={() => setIsOpen(true)}>
                <button
                    className={cn(
                        "bg-red-500 ml-2 active:scale-95 transition-all hover:bg-red-600 p-2 text-white rounded-md",
                        className
                    )}>
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
