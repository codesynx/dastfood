import axios from "axios";

export const apiInstance = axios.create({
    baseURL: "https://dastarkhana-cbe6e361728e.herokuapp.com/api",
    // baseURL: "http://localhost:8000/api",
});
