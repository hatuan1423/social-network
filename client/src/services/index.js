import { notification } from 'antd';
import axios from 'axios'
import { baseURL } from '~/utils';
import * as UserService from "~/services/UserService"

const token = localStorage.getItem("token")

let instance = axios.create({
    baseURL: baseURL
});

instance.interceptors.request.use(
    async (config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    });


let refreshTokenPromise = null

instance.interceptors.response.use(
    async (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 410 && originalRequest) {
            if (!refreshTokenPromise) {
                refreshTokenPromise = UserService.handleRefreshToken(token)
                    .then(res => {
                        const accessToken = res?.result?.token
                        localStorage.setItem("token", accessToken)
                        instance.defaults.headers["Authorization"] = accessToken
                    })
                    .catch(err => {
                        return Promise.reject(err)
                    })
                    .finally(() => {
                        refreshTokenPromise = null
                    })
            }

            return refreshTokenPromise.then(() => {
                return instance(originalRequest)
            })
        }


        if (error.response?.status !== 410) {
            notification.error({
                placement: "bottomRight",
                message: error.response.data.message,
            });
        }
        return Promise.reject(error);
    }
);

export default instance
