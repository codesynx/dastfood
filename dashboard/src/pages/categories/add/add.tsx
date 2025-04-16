import SaveAndCancelBtns from "@/components/shared/saveAndCancelBtns";
import TopBar from "@/components/shared/topBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiInstance } from "@/lib/axios";
import { imageUpload } from "@/lib/image-upload";
import { useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "./_components/ImageUploader";

export default function AddCategory() {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File>();
    const [name, setName] = useState("");

    const handleSubmit = async () => {
        if (!file) {
            return toast.error("Сурет таңдалмаған");
        }
        if (!name) {
            return toast.error("Атауы енгізілмеген");
        }
        setIsLoading(true);
        toast.loading("Категория жасалып жатыр.... ");
        try {
            const url = await imageUpload(file);
            if (!url) {
                toast.dismiss();
                toast.error("Суретті жүктеу кезінде қате шықты");
            }
            await apiInstance.post("/categories", {
                name,
                image: url,
            });
            toast.dismiss();
            toast.success("Сәтті жасалды");
        } catch (error) {
            toast.dismiss();
            toast.error("Категория жасау кезінде қате");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex">
            <section className="w-full">
                <TopBar text="Категория қосу">
                    <SaveAndCancelBtns
                        disabled={isLoading}
                        onSaveClick={handleSubmit}
                        className="ml-auto"
                    />
                </TopBar>
                <form
                    className="w-full px-10 pt-5"
                    onSubmit={(e) => e.preventDefault()}>
                    <div className="mt-5">
                        <Label>Категория атауы</Label>
                        <Input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder="Атауы"
                            className="mt-1"
                            type="text"
                        />
                    </div>
                    <div className="mt-4">
                        <Label>Категория суреті</Label>
                        <ImageUploader
                            file={file}
                            setFile={setFile}
                            className="mt-1"
                        />
                    </div>
                </form>
            </section>
        </main>
    );
}
