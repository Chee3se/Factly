import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import {PageProps as AppPageProps, User} from './';
import Echo from "laravel-echo";

declare global {
    interface Window {
        axios: AxiosInstance;
        Echo: Echo;
    }

    interface Auth {
        user: User;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
