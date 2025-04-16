import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import useStore from "../store"

export default function GeneralInfo() {
    const name = useStore((s) => s.name);
    const setName = useStore((s) => s.setName);
    const phone = useStore((s) => s.phone);
    const setPhone = useStore((s) => s.setPhone);
    const salary = useStore((s) => s.salary);
    const setSalary = useStore((s) => s.setSalary);
    const password = useStore((s) => s.password);
    const setPassword = useStore((s) => s.setPassword);

    return (
        <section className={cn("p-5 w-full border-2  rounded-xl")}>
            <div className="flex items-center text-black pb-3 font-semibold text-[20px] ">
                Ақпарат <Info className="ml-auto opacity-40" />
            </div>
            <div>
                <Label>Аты-жөні</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Аты-жөні"
                />

                <div className="flex space-x-4 mt-3">
                    <div className="flex-1">
                        <Label>Телефон номері</Label>
                        <Input
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value )
                            }
                            type="text"
                            placeholder="Телефон номері"
                        />
                    </div>
                </div>
                <div className="flex space-x-4 mt-3">
                    <div className="flex-1">
                        <Label>Жалақы</Label>
                        <Input
                            max={5}
                            min={0}
                            value={salary}
                            onChange={(e) =>
                                setSalary(e.target.valueAsNumber)
                            }
                            type="number"
                            placeholder="Жалақы"
                        />
                    </div>
                </div>
                <div className="flex space-x-4 mt-3">
                    <div className="flex-1">
                        <Label>Құпиясөз</Label>
                        <Input
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value )
                            }
                            type="text"
                            placeholder="Құпиясөз"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
