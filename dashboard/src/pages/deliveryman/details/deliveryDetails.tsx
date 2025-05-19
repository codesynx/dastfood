import LoadingPage from "@/components/shared/LoadingPage";
import TopBar from "@/components/shared/topBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { apiInstance } from "@/lib/axios";
import { Calendar, Clock, PackageCheck, RefreshCw } from "lucide-react";
import TengeSignIcon from "@/components/ui/TengeSignIcon"; // Added TengeSignIcon import
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Area,
    AreaChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// Константы для цветов
const orderColors = ["#6EE7B7", "#EF4444"];

// Константа для стоимости доставки (оплата курьеру за одну доставку)
const DELIVERY_FEE = 1000; // в тенге

// Интерфейсы для типизации
interface OrderStatus {
    name: string;
    value: number;
}

interface MonthlyData {
    month: string;
    orders: number;
    income: number;
}

// Определяем тип Order для использования в типизированных функциях
interface Order {
    id: number;
    status: string;
    totalPrice?: number;
    createdAt: string;
}

export default function DeliveryDetails() {
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);

    // State for delivery man details and statistics
    const [deliveryMan, setDeliveryMan] = useState<DeliveryMan | null>(() => {
        // Проверяем, есть ли кешированные данные
        const cached = localStorage.getItem(`deliveryMan_${id}`);
        return cached ? JSON.parse(cached) : null;
    });
    
    const [stats, setStats] = useState<{
        totalRevenue: number;
        totalOrders: number;
        completedOrders: number;
        completionRate: number;
    } | null>(() => {
        // Проверяем, есть ли кешированные данные
        const cached = localStorage.getItem(`deliveryManStats_${id}`);
        return cached ? JSON.parse(cached) : null;
    });
    
    // Состояния для данных графиков
    const [orderStatusData, setOrderStatusData] = useState<OrderStatus[]>(() => {
        // Проверяем, есть ли кешированные данные
        const cached = localStorage.getItem(`orderStatusData_${id}`);
        return cached ? JSON.parse(cached) : [];
    });
    
    const [monthlyOrdersData, setMonthlyOrdersData] = useState<MonthlyData[]>(() => {
        // Проверяем, есть ли кешированные данные
        const cached = localStorage.getItem(`monthlyOrdersData_${id}`);
        return cached ? JSON.parse(cached) : [];
    });
    
    // Дополнительное состояние для отслеживания обновления данных
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Функция для сохранения данных в localStorage
    const cacheData = (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Обновление локального кеша при изменении состояний
    useEffect(() => {
        if (deliveryMan) {
            cacheData(`deliveryMan_${id}`, deliveryMan);
        }
    }, [deliveryMan, id]);

    useEffect(() => {
        if (stats) {
            cacheData(`deliveryManStats_${id}`, stats);
        }
    }, [stats, id]);

    useEffect(() => {
        if (orderStatusData.length > 0) {
            cacheData(`orderStatusData_${id}`, orderStatusData);
        }
    }, [orderStatusData, id]);

    useEffect(() => {
        if (monthlyOrdersData.length > 0) {
            cacheData(`monthlyOrdersData_${id}`, monthlyOrdersData);
        }
    }, [monthlyOrdersData, id]);

    // Fetch delivery man data and stats
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log("Курьер деректерін жүктеу, ID:", id);
                
                // Fetch delivery man details
                const deliveryManResponse = await apiInstance.get(
                    `/auth/DileveryMan/${id}`
                );
                const deliveryManData = deliveryManResponse.data;
                console.log("Курьер туралы мәліметтер:", deliveryManData);
                setDeliveryMan(deliveryManData);

                // Получаем все заказы, назначенные данному курьеру
                try {
                    const ordersResponse = await apiInstance.get(`/orders/deliveryMan/${id}`);
                    const orders = ordersResponse.data;
                    console.log("Алынған тапсырыстар саны:", orders?.length || 0);
                    
                    if (orders && orders.length > 0) {
                        // Считаем выполненные и невыполненные заказы
                        const completedOrders = orders.filter((order: Order) => order.status === 'DELIVERED').length;
                        const notCompletedOrders = orders.length - completedOrders;
                        console.log("Аяқталған тапсырыстар:", completedOrders);
                        console.log("Аяқталмаған тапсырыстар:", notCompletedOrders);
                        
                        // Обновляем данные о статусах заказов
                        setOrderStatusData([
                            { name: "Аяқталған", value: completedOrders },
                            { name: "Аяқталмаған", value: notCompletedOrders },
                        ]);
                        
                        // Группируем заказы по месяцам для отображения на графике
                        const monthsInKazakh = [
                            'Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 
                            'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'
                        ];
                        
                        const monthlyData = monthsInKazakh.map((month, index) => {
                            const ordersForMonth = orders.filter((order: Order) => {
                                const orderDate = new Date(order.createdAt);
                                return orderDate.getMonth() === index;
                            });
                            
                            // Подсчет только выполненных заказов для расчета дохода
                            const completedOrdersForMonth = ordersForMonth.filter((order: Order) => order.status === 'DELIVERED').length;
                            const incomeForMonth = completedOrdersForMonth * DELIVERY_FEE;
                            
                            return {
                                month,
                                orders: ordersForMonth.length,
                                income: incomeForMonth
                            };
                        });
                        
                        console.log("Ай бойынша деректер:", monthlyData);
                        setMonthlyOrdersData(monthlyData);
                        
                        // Сразу рассчитываем статистику из полученных заказов, чтобы не зависеть от другого API
                        const totalOrdersCount = orders.length;
                        const completedOrdersCount = completedOrders;
                        const completionRateValue = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;
                        const deliveryIncome = completedOrdersCount * DELIVERY_FEE;
                        
                        const calculatedStats = {
                            totalRevenue: deliveryIncome,
                            totalOrders: totalOrdersCount,
                            completedOrders: completedOrdersCount,
                            completionRate: completionRateValue,
                        };
                        
                        console.log("Тапсырыстардан есептелген статистика:", calculatedStats);
                        setStats(calculatedStats);
                    }
                } catch (error) {
                    console.error("Курьер тапсырыстарын алу мүмкін болмады:", error);
                    toast.error("Курьер тапсырыстарын жүктеу мүмкін болмады");
                }

                // Fetch stats via orders-summary endpoint только как резервный вариант
                try {
                    const statsResponse = await apiInstance.get(
                        `/auth/orders-summary/${id}`
                    );
                    const { acceptedOrders, refusedOrders } =
                        statsResponse.data;
                    console.log("API статистикасынан алынған деректер:", statsResponse.data);
                    
                    // Используем эти данные только если у нас еще нет статистики из заказов
                    if (!stats || stats.totalOrders === 0) {
                        const completedOrders = acceptedOrders;
                        const totalOrders = acceptedOrders + refusedOrders;
                        const completionRate =
                            totalOrders > 0 ? (acceptedOrders / totalOrders) * 100 : 0;

                        // Пересчитываем доход курьера: количество выполненных заказов * стоимость доставки
                        const deliveryIncome = completedOrders * DELIVERY_FEE;

                        const apiStats = {
                            totalRevenue: deliveryIncome,
                            totalOrders: totalOrders,
                            completedOrders: completedOrders,
                            completionRate: completionRate,
                        };
                        
                        console.log("API-ден алынған статистика:", apiStats);
                        setStats(apiStats);
                    }
                } catch (error) {
                    console.error("API-ден статистиканы алу мүмкін болмады:", error);
                    // Эту часть мы уже не используем, так как статистика рассчитывается из заказов
                }
            } catch (error) {
                console.error("Деректерді жүктеу кезінде қате туындады:", error);
                toast.error("Курьердің мәліметтері мен статистикасын алу мүмкін болмады");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Функция для ручного обновления данных
    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            console.log("Курьер деректерін қолмен жаңарту, ID:", id);
            
            // Получаем заказы курьера заново
            const ordersResponse = await apiInstance.get(`/orders/deliveryMan/${id}`);
            const orders = ordersResponse.data || [];
            console.log("Жаңартылған тапсырыстар саны:", orders.length);
            
            if (orders.length > 0) {
                // Пересчитываем всю статистику
                const completedOrders = orders.filter((order: Order) => order.status === 'DELIVERED').length;
                const notCompletedOrders = orders.length - completedOrders;
                
                // Обновляем статусы заказов
                const newOrderStatusData = [
                    { name: "Аяқталған", value: completedOrders },
                    { name: "Аяқталмаған", value: notCompletedOrders },
                ];
                setOrderStatusData(newOrderStatusData);
                cacheData(`orderStatusData_${id}`, newOrderStatusData);
                
                // Обновляем статистику
                const totalOrdersCount = orders.length;
                const completedOrdersCount = completedOrders;
                const completionRateValue = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;
                const deliveryIncome = completedOrdersCount * DELIVERY_FEE;
                
                const newStats = {
                    totalRevenue: deliveryIncome,
                    totalOrders: totalOrdersCount,
                    completedOrders: completedOrdersCount,
                    completionRate: completionRateValue,
                };
                setStats(newStats);
                cacheData(`deliveryManStats_${id}`, newStats);
                
                // Обновляем месячные данные
                const monthsInKazakh = [
                    'Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 
                    'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'
                ];
                
                const newMonthlyData = monthsInKazakh.map((month, index) => {
                    const ordersForMonth = orders.filter((order: Order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.getMonth() === index;
                    });
                    
                    const completedOrdersForMonth = ordersForMonth.filter((order: Order) => order.status === 'DELIVERED').length;
                    const incomeForMonth = completedOrdersForMonth * DELIVERY_FEE;
                    
                    return {
                        month,
                        orders: ordersForMonth.length,
                        income: incomeForMonth
                    };
                });
                
                setMonthlyOrdersData(newMonthlyData);
                cacheData(`monthlyOrdersData_${id}`, newMonthlyData);
            }
            
            toast.success("Деректер сәтті жаңартылды");
        } catch (error) {
            console.error("Деректерді жаңарту кезінде қате туындады:", error);
            toast.error("Деректерді жаңарту кезінде қате орын алды");
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <main className="flex p-6 space-y-6">
            <div className="w-full">
                <TopBar text="Курьер туралы мәліметтер">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={refreshData} 
                        disabled={isRefreshing}
                        className="ml-auto"
                    >
                        {isRefreshing ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Жаңарту
                    </Button>
                </TopBar>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 ">
                    <Card>
                        <CardHeader className="flex  flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Жалпы табыс</CardTitle>
                            <TengeSignIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalRevenue.toLocaleString()} ₸
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Жеткізу ақысы ({DELIVERY_FEE} ₸ × {stats?.completedOrders} тапсырыстар)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Жалпы тапсырыстар саны</CardTitle>
                            <PackageCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalOrders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Бекітілген барлық тапсырыстар
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Тапсырыстарды аяқтау көрсеткіші</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.completionRate.toFixed(2)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Жеткізілген тапсырыстар: {stats?.completedOrders}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex w-full px-7  gap-6">
                    {/* Delivery Man Information */}
                    <div className="w-2/3 border  rounded-xl">
                        <div className="container p-6   rounded-lg">
                            <div className="grid grid-cols-1 gap-4">
                                <InfoCard
                                    icon={<Calendar />}
                                    title="Аты-жөні"
                                    value={deliveryMan?.name}
                                />
                                <InfoCard
                                    icon={<Calendar />}
                                    title="Қосылған уақыты"
                                    value={new Date(
                                        deliveryMan?.createdAt!
                                    ).toLocaleDateString()}
                                />
                                <InfoCard
                                    icon={<Calendar />}
                                    title="Телефон номері"
                                    value={deliveryMan?.phone}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Status Chart */}
                    <div className="w-1/3">
                        <Card>
                            <CardHeader className="flex flex-row items-center  justify-between space-y-0 pb-2">
                                <CardTitle>Тапсырыс статусы</CardTitle>
                                <PackageCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pb-5 rounded-xl  relative">
                                <ChartContainer
                                    config={{}}
                                    className="p-0  w-96 h-72 ">
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius="70%"
                                            fill="#8884d8"
                                            dataKey="value">
                                            {orderStatusData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        orderColors[
                                                            index %
                                                                orderColors.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="px-8">
                    <Card className="mt-6 ">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Ай сайынғы тапсырыстар мен табыс</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="h-72">
                            <ChartContainer
                                config={{}}
                                className="h-72 w-[95%]">
                                <AreaChart
                                    className="scale-x-110"
                                    data={monthlyOrdersData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}>
                                    <defs>
                                        <linearGradient
                                            id="orderGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.5}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="incomeGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#4466ef"
                                                stopOpacity={0.5}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#4466ef"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}₸`}
                                    />
                                    <Tooltip />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#ef4444"
                                        fillOpacity={1}
                                        fill="url(#orderGradient)"
                                        strokeWidth={2}
                                        name="Тапсырыстар"
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#4466ef"
                                        fillOpacity={1}
                                        fill="url(#incomeGradient)"
                                        strokeWidth={2}
                                        name="Табыс"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

const InfoCard = ({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode;
    title: string;
    value: string | number | undefined;
}) => (
    <div className="border shadow-[0px_0px_10px] shadow-neutral-50  p-4 rounded-lg">
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="ml-2 font-semibold">{title}</h3>
        </div>
        <p className="text-lg">{value}</p>
    </div>
);

export type DeliveryMan = {
    id: number;
    phone: string;
    name: string;
    password: string;
    salary: string;
    createdAt: string;
};
