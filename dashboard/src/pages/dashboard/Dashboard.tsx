import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Clock, PackageCheck, Users, RefreshCw } from "lucide-react";
import TengeSignIcon from "@/components/ui/TengeSignIcon"; // Added TengeSignIcon import
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    Tooltip,
    XAxis,
    YAxis,
    Area,
    AreaChart,
    CartesianGrid,
} from "recharts";
import TopBar from "@/components/shared/topBar";
import { useEffect, useState } from "react";
import { apiInstance } from "@/lib/axios";
import LoadingPage from "@/components/shared/LoadingPage";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

// Типы для данных
interface OrderStatus {
    name: string;
    value: number;
}

interface WeeklyOrder {
    day: string;
    orders: number;
}

interface NewUser {
    day: string;
    users: number;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

// Определение типов для получаемых с бэкенда данных
interface Order {
    id: number;
    status: string;
    totalPrice?: number;
    createdAt: string;
}

interface User {
    id: number;
    name: string;
    createdAt: string;
}

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    
    // Утилитарная функция для проверки, относится ли сохраненная дата к текущей неделе
    const isCurrentWeek = (): boolean => {
        // Получаем сохраненную дату обновления или текущую, если нет сохраненной
        const lastUpdated = localStorage.getItem('dashboardLastUpdated');
        if (!lastUpdated) return false;
        
        const savedDate = new Date(JSON.parse(lastUpdated));
        const currentDate = new Date();
        
        // Получаем начало текущей недели
        const startOfWeek = new Date(currentDate);
        const day = currentDate.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(currentDate.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Получаем конец текущей недели
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Проверяем, находится ли сохраненная дата в текущей неделе
        return savedDate >= startOfWeek && savedDate <= endOfWeek;
    };
    
    // Состояния для данных графиков
    const [orderStatusData, setOrderStatusData] = useState<OrderStatus[]>(() => {
        // Проверяем, есть ли кешированные данные и относятся ли они к текущей неделе
        const cached = localStorage.getItem('dashboardOrderStatusData');
        return (cached && isCurrentWeek()) ? JSON.parse(cached) : [
            { name: "Completed", value: 75 },
            { name: "Not Completed", value: 25 },
        ];
    });
    
    const [weeklyOrdersData, setWeeklyOrdersData] = useState<WeeklyOrder[]>(() => {
        // Проверяем, есть ли кешированные данные и относятся ли они к текущей неделе
        const cached = localStorage.getItem('dashboardWeeklyOrdersData');
        return (cached && isCurrentWeek()) ? JSON.parse(cached) : [];
    });

    const [newUsersData, setNewUsersData] = useState<NewUser[]>(() => {
        // Проверяем, есть ли кешированные данные и относятся ли они к текущей неделе
        const cached = localStorage.getItem('dashboardNewUsersData');
        return (cached && isCurrentWeek()) ? JSON.parse(cached) : [];
    });

    const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyRevenue[]>(() => {
        // Проверяем, есть ли кешированные данные
        const cached = localStorage.getItem('dashboardMonthlyRevenueData');
        return cached ? JSON.parse(cached) : [];
    });
    
    // Общие метрики
    const [totalRevenue, setTotalRevenue] = useState(() => {
        const cached = localStorage.getItem('dashboardTotalRevenue');
        return cached ? JSON.parse(cached) : 0;
    });

    const [totalOrders, setTotalOrders] = useState(() => {
        const cached = localStorage.getItem('dashboardTotalOrders');
        return cached ? JSON.parse(cached) : 0;
    });

    const [totalNewUsers, setTotalNewUsers] = useState(() => {
        const cached = localStorage.getItem('dashboardTotalNewUsers');
        return cached ? JSON.parse(cached) : 0;
    });

    const [completionRate, setCompletionRate] = useState(() => {
        const cached = localStorage.getItem('dashboardCompletionRate');
        return cached ? JSON.parse(cached) : 0;
    });
    
    // Состояние для отслеживания обновления данных
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const orderColors = ["#6EE7B7", "#EF4444"];

    // Функция для загрузки данных дэшборда
    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            console.log("Дэшборд деректерін жүктеу");
            
            // Сохраняем текущую дату и время обновления данных
            const currentDateTime = new Date();
            localStorage.setItem('dashboardLastUpdated', JSON.stringify(currentDateTime));
            console.log("Первоначальная загрузка данных:", currentDateTime);
            
            // 1. Получаем статусы заказов
            const ordersResponse = await apiInstance.get('/orders');
            const orders = ordersResponse.data;
            
            if (orders && orders.length > 0) {
                // Считаем выполненные и невыполненные заказы
                const completedOrders = orders.filter((order: Order) => order.status === 'DELIVERED').length;
                const notCompletedOrders = orders.length - completedOrders;
                
                // Обновляем данные о статусах заказов
                const newOrderStatusData = [
                    { name: "Аяқталған", value: completedOrders },
                    { name: "Аяқталмаған", value: notCompletedOrders },
                ];
                setOrderStatusData(newOrderStatusData);
                localStorage.setItem('dashboardOrderStatusData', JSON.stringify(newOrderStatusData));
                
                // Устанавливаем процент выполнения
                const newCompletionRate = Math.round((completedOrders / orders.length) * 100);
                setCompletionRate(newCompletionRate);
                localStorage.setItem('dashboardCompletionRate', JSON.stringify(newCompletionRate));
                
                // Устанавливаем общее количество заказов
                setTotalOrders(orders.length);
                localStorage.setItem('dashboardTotalOrders', JSON.stringify(orders.length));
                
                // Считаем общую выручку - преобразуем строки в числа для корректных расчетов
                const revenue = orders.reduce((sum: number, order: Order) => {
                    // Убедимся, что totalPrice обрабатывается как число
                    const price = typeof order.totalPrice === 'string' 
                        ? parseInt(order.totalPrice, 10) 
                        : (order.totalPrice || 0);
                    return sum + price;
                }, 0);
                setTotalRevenue(revenue);
                localStorage.setItem('dashboardTotalRevenue', JSON.stringify(revenue));
                
                // Группируем заказы по дням недели
                const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const daysInKazakh = ['Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен', 'Жек'];
                
                // Получаем дату начала текущей недели (понедельник)
                const currentDate = new Date();
                const startOfWeek = new Date(currentDate);
                const day = currentDate.getDay();
                // Учитываем, что в JS воскресенье - 0, а нам нужно, чтобы понедельник был началом недели
                const diff = day === 0 ? 6 : day - 1;
                startOfWeek.setDate(currentDate.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);
                
                // Получаем дату конца текущей недели (воскресенье)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                console.log("Фильтрация заказов только за текущую неделю:", startOfWeek, " до ", endOfWeek);
                
                const weeklyData = daysOfWeek.map((_, index) => {
                    // Создаем дату для конкретного дня текущей недели
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    
                    const ordersForDay = orders.filter((order: Order) => {
                        const orderDate = new Date(order.createdAt);
                        // Проверяем, что дата заказа - это конкретный день текущей недели
                        return orderDate.getDate() === dayDate.getDate() && 
                               orderDate.getMonth() === dayDate.getMonth() && 
                               orderDate.getFullYear() === dayDate.getFullYear();
                    });
                    
                    return {
                        day: daysInKazakh[index],
                        orders: ordersForDay.length
                    };
                });
                
                setWeeklyOrdersData(weeklyData);
                localStorage.setItem('dashboardWeeklyOrdersData', JSON.stringify(weeklyData));
                
                // Группируем заказы по месяцам для отображения выручки
                const monthsInKazakh = [
                    'Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 
                    'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'
                ];
                
                const monthlyData = monthsInKazakh.map((month, index) => {
                    const ordersForMonth = orders.filter((order: Order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.getMonth() === index;
                    });
                    
                    const revenueForMonth = ordersForMonth.reduce((sum: number, order: Order) => {
                        // Убедимся, что totalPrice обрабатывается как число
                        const price = typeof order.totalPrice === 'string' 
                            ? parseInt(order.totalPrice, 10) 
                            : (order.totalPrice || 0);
                        return sum + price;
                    }, 0);
                    
                    return {
                        month,
                        revenue: revenueForMonth
                    };
                });
                
                setMonthlyRevenueData(monthlyData);
                localStorage.setItem('dashboardMonthlyRevenueData', JSON.stringify(monthlyData));
            }
            
            // 2. Получаем данные о пользователях
            const usersResponse = await apiInstance.get('/auth/customers');
            const users = usersResponse.data;
            
            if (users && users.length > 0) {
                setTotalNewUsers(users.length);
                localStorage.setItem('dashboardTotalNewUsers', JSON.stringify(users.length));
                
                // Группируем пользователей по дням регистрации за последнюю неделю
                const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const daysInKazakh = ['Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен', 'Жек'];
                
                // Получаем дату начала текущей недели (понедельник)
                const currentDate = new Date();
                const startOfWeek = new Date(currentDate);
                const day = currentDate.getDay();
                // Учитываем, что в JS воскресенье - 0, а нам нужно, чтобы понедельник был началом недели
                const diff = day === 0 ? 6 : day - 1;
                startOfWeek.setDate(currentDate.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);
                
                // Получаем дату конца текущей недели (воскресенье)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                console.log("Фильтрация пользователей только за текущую неделю:", startOfWeek, " до ", endOfWeek);
                
                const weeklyUsers = daysOfWeek.map((_, index) => {
                    // Создаем дату для конкретного дня текущей недели
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    
                    const usersForDay = users.filter((user: User) => {
                        const registrationDate = new Date(user.createdAt);
                        // Проверяем, что дата регистрации - это конкретный день текущей недели
                        return registrationDate.getDate() === dayDate.getDate() && 
                               registrationDate.getMonth() === dayDate.getMonth() && 
                               registrationDate.getFullYear() === dayDate.getFullYear();
                    });
                    
                    return {
                        day: daysInKazakh[index],
                        users: usersForDay.length
                    };
                });
                
                setNewUsersData(weeklyUsers);
                localStorage.setItem('dashboardNewUsersData', JSON.stringify(weeklyUsers));
            }
            
            toast.success("Деректер сәтті жаңартылды");
            console.log("Дэшборд деректері сәтті жаңартылды");
        } catch (error) {
            console.error("Деректерді жүктеу кезінде қате туындады", error);
            toast.error("Басқару панелі үшін деректерді жүктеу мүмкін болмады");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Функция для ручного обновления данных
    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            console.log("Дэшборд деректерін қолмен жаңарту");
            
            // Сохраняем текущую дату и время обновления данных
            const currentDateTime = new Date();
            localStorage.setItem('dashboardLastUpdated', JSON.stringify(currentDateTime));
            console.log("Обновление данных:", currentDateTime);
            
            // 1. Получаем данные о заказах
            const ordersResponse = await apiInstance.get('/orders');
            const orders = ordersResponse.data || [];
            console.log("Жаңартылған тапсырыстар саны:", orders.length);
            
            if (orders && orders.length > 0) {
                // Считаем выполненные и невыполненные заказы
                const completedOrders = orders.filter((order: Order) => order.status === 'DELIVERED').length;
                const notCompletedOrders = orders.length - completedOrders;
                
                // Обновляем данные о статусах заказов
                const newOrderStatusData = [
                    { name: "Аяқталған", value: completedOrders },
                    { name: "Аяқталмаған", value: notCompletedOrders },
                ];
                setOrderStatusData(newOrderStatusData);
                // Сохраняем в localStorage
                localStorage.setItem('dashboardOrderStatusData', JSON.stringify(newOrderStatusData));
                
                // Устанавливаем процент выполнения
                const newCompletionRate = Math.round((completedOrders / orders.length) * 100);
                setCompletionRate(newCompletionRate);
                localStorage.setItem('dashboardCompletionRate', JSON.stringify(newCompletionRate));
                
                // Устанавливаем общее количество заказов
                setTotalOrders(orders.length);
                localStorage.setItem('dashboardTotalOrders', JSON.stringify(orders.length));
                
                // Считаем общую выручку - преобразуем строки в числа для корректных расчетов
                const revenue = orders.reduce((sum: number, order: Order) => {
                    // Убедимся, что totalPrice обрабатывается как число
                    const price = typeof order.totalPrice === 'string' 
                        ? parseInt(order.totalPrice, 10) 
                        : (order.totalPrice || 0);
                    return sum + price;
                }, 0);
                setTotalRevenue(revenue);
                localStorage.setItem('dashboardTotalRevenue', JSON.stringify(revenue));
                
                // Группируем заказы по дням недели
                const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const daysInKazakh = ['Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен', 'Жек'];
                
                // Получаем дату начала текущей недели (понедельник)
                const currentDate = new Date();
                const startOfWeek = new Date(currentDate);
                const day = currentDate.getDay();
                // Учитываем, что в JS воскресенье - 0, а нам нужно, чтобы понедельник был началом недели
                const diff = day === 0 ? 6 : day - 1;
                startOfWeek.setDate(currentDate.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);
                
                // Получаем дату конца текущей недели (воскресенье)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                console.log("Фильтрация заказов только за текущую неделю:", startOfWeek, " до ", endOfWeek);
                
                const newWeeklyData = daysOfWeek.map((_, index) => {
                    // Создаем дату для конкретного дня текущей недели
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    
                    const ordersForDay = orders.filter((order: Order) => {
                        const orderDate = new Date(order.createdAt);
                        // Проверяем, что дата заказа - это конкретный день текущей недели
                        return orderDate.getDate() === dayDate.getDate() && 
                               orderDate.getMonth() === dayDate.getMonth() && 
                               orderDate.getFullYear() === dayDate.getFullYear();
                    });
                    
                    return {
                        day: daysInKazakh[index],
                        orders: ordersForDay.length
                    };
                });
                
                setWeeklyOrdersData(newWeeklyData);
                localStorage.setItem('dashboardWeeklyOrdersData', JSON.stringify(newWeeklyData));
                
                // Группируем заказы по месяцам для отображения выручки
                const monthsInKazakh = [
                    'Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 
                    'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'
                ];
                
                const newMonthlyData = monthsInKazakh.map((month, index) => {
                    const ordersForMonth = orders.filter((order: Order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.getMonth() === index;
                    });
                    
                    const revenueForMonth = ordersForMonth.reduce((sum: number, order: Order) => {
                        // Убедимся, что totalPrice обрабатывается как число
                        const price = typeof order.totalPrice === 'string' 
                            ? parseInt(order.totalPrice, 10) 
                            : (order.totalPrice || 0);
                        return sum + price;
                    }, 0);
                    
                    return {
                        month,
                        revenue: revenueForMonth
                    };
                });
                
                setMonthlyRevenueData(newMonthlyData);
                localStorage.setItem('dashboardMonthlyRevenueData', JSON.stringify(newMonthlyData));
            }
            
            // 2. Получаем данные о пользователях
            const usersResponse = await apiInstance.get('/auth/customers');
            const users = usersResponse.data || [];
            console.log("Жаңартылған пайдаланушылар саны:", users.length);
            
            if (users && users.length > 0) {
                setTotalNewUsers(users.length);
                localStorage.setItem('dashboardTotalNewUsers', JSON.stringify(users.length));
                
                // Группируем пользователей по дням регистрации за последнюю неделю
                const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const daysInKazakh = ['Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен', 'Жек'];
                
                // Получаем дату начала текущей недели (понедельник)
                const currentDate = new Date();
                const startOfWeek = new Date(currentDate);
                const day = currentDate.getDay();
                // Учитываем, что в JS воскресенье - 0, а нам нужно, чтобы понедельник был началом недели
                const diff = day === 0 ? 6 : day - 1;
                startOfWeek.setDate(currentDate.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);
                
                // Получаем дату конца текущей недели (воскресенье)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                console.log("Фильтрация пользователей только за текущую неделю:", startOfWeek, " до ", endOfWeek);
                
                const newWeeklyUsers = daysOfWeek.map((_, index) => {
                    // Создаем дату для конкретного дня текущей недели
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    
                    const usersForDay = users.filter((user: User) => {
                        const registrationDate = new Date(user.createdAt);
                        // Проверяем, что дата регистрации - это конкретный день текущей недели
                        return registrationDate.getDate() === dayDate.getDate() && 
                               registrationDate.getMonth() === dayDate.getMonth() && 
                               registrationDate.getFullYear() === dayDate.getFullYear();
                    });
                    
                    return {
                        day: daysInKazakh[index],
                        users: usersForDay.length
                    };
                });
                
                setNewUsersData(newWeeklyUsers);
                localStorage.setItem('dashboardNewUsersData', JSON.stringify(newWeeklyUsers));
            }
            
            toast.success("Деректер сәтті жаңартылды");
            console.log("Дэшборд деректері сәтті жаңартылды");
        } catch (error) {
            console.error("Деректерді жаңарту кезінде қате туындады:", error);
            toast.error("Деректерді жаңарту кезінде қате орын алды");
        } finally {
            setIsRefreshing(false);
        }
    };
    
    // Загрузка данных при монтировании компонента
    useEffect(() => {
        // Проверяем, актуальны ли сохраненные данные для текущей недели
        if (!isCurrentWeek()) {
            console.log("Сохраненные данные относятся к другой неделе, принудительное обновление...");
            // Если данные относятся к прошлой неделе, очищаем кеш по недельным данным
            localStorage.removeItem('dashboardWeeklyOrdersData');
            localStorage.removeItem('dashboardNewUsersData');
        }
        
        fetchDashboardData();
    }, []);
    
    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <main className="p-6 space-y-6">
            <TopBar text="Dashboard">
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

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Жалпы табыс</CardTitle>
                        <TengeSignIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Number(totalRevenue).toLocaleString()} ₸
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Барлық тапсырыстардан түскен табыс
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Жалпы тапсырыстар</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Барлық тіркелген тапсырыстар
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Жаңа қолданушылар</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalNewUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Барлық тіркелген қолданушылар
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Тапсырыстың орындалуы</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completionRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Орындалған тапсырыстар
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Тапсырыс күйі</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius="90%"
                                    fill="#8884d8"
                                    dataKey="value">
                                    {orderStatusData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                orderColors[
                                                    index % orderColors.length
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
                {/* New Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Жаңа қолданушылар</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}}>
                            <AreaChart data={newUsersData}>
                                <defs>
                                    <linearGradient
                                        id="userGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="#6EE7B7"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#6EE7B7"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#6EE7B7"
                                    fillOpacity={1}
                                    fill="url(#userGradient)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Weekly Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Апталық тапсырыстар</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}}>
                            <BarChart
                                className=" scale-x-110"
                                data={weeklyOrdersData}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    barSize={40}
                                    dataKey="orders"
                                    fill="#2196F3"
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Monthly Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Айлық табыс</CardTitle>
                        <TengeSignIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}}>
                            <AreaChart data={monthlyRevenueData}>
                                <defs>
                                    <linearGradient
                                        id="revenueGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="#FF9800"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#FF9800"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => value.toLocaleString() + " ₸"} />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#FF9800"
                                    fillOpacity={1}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
