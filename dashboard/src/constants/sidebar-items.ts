import {
    Home,
    Settings,
    ShoppingCart,
    Tags,
    Truck,
    Users2,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
    {
        Icon: Home,
        link: "/dashboard",
        title: "Басқару панелі",
    },
    {
        Icon: Truck,
        link: "/orders",
        title: "Тапсырыстар",
        notifs: 3,
    },
    {
        Icon: ShoppingCart,
        link: "/products",
        title: "Тауарлар",
    },
    {
        Icon: Tags,
        link: "/categories",
        title: "Категориялар",
    },
    {
        Icon: Users2,
        link: "/drivers",
        title: "Курьерлер",
    },
    {
        Icon: Settings,
        link: "/settings",
        title: "Баптаулар",
    },
] as const;
