import LoadingPage from "@/components/shared/LoadingPage";
import SaveAndCancelBtns from "@/components/shared/saveAndCancelBtns";
import TopBar from "@/components/shared/topBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiInstance } from "@/lib/axios";
import { imageUpload } from "@/lib/image-upload";
import { wait } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ImageUploader from "./_components/ImageUploader";

export default function UpdateCategory() {
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [file, setFile] = useState<File>();
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const id = useParams().id;

    useEffect(() => {
        apiInstance
            .get(`/categories/${id}`)
            .then(({ data }) => {
                setImageUrl(data.image);
                setName(data.name);
            })
            .catch(() => toast.error("Қате шықты"))
            .finally(() => setIsLoading(false));
    }, []);
    if (isLoading) {
        return <LoadingPage />;
    }

    const handleSubmit = async () => {
        if (!name) {
            return toast.error("Атауы енгізілмеген");
        }
        setIsUpdating(true);
        toast.loading("Категория жаңартылып жатыр... ");
        try {
            const url = file ? await imageUpload(file) : imageUrl;
            if (!url) {
                toast.dismiss();
                toast.error("Суретті жүктеу кезінде қате болды");
            }
            await apiInstance.put(`/categories/update/${id}`, {
                name,
                image: url,
                id: Number(id),
            });
            toast.dismiss();
            toast.success("Сәтті жаңартылды");
            wait(20).then(location.reload);
        } catch (error) {
            toast.dismiss();
            toast.error("Категория жасау кезінде қате шықты");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <main className="flex">
            <section className="w-full">
                <TopBar text="Жаңа категория қосу">
                    <SaveAndCancelBtns
                        disabled={isUpdating}
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
                            imageUrl={imageUrl}
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
