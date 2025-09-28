import type { UseAuthReturn } from '~/types/use-auth';
import type { AxiosInstance } from 'axios';

declare module '#app' {
  interface NuxtApp {
    $auth: UseAuthReturn;
    $api: AxiosInstance;
  }
}

declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp {
    $auth: UseAuthReturn;
    $api: AxiosInstance;
  }
}

declare module 'nuxt/app' {
  interface NuxtApp {
    $auth: UseAuthReturn;
    $api: AxiosInstance;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: UseAuthReturn;
    $api: AxiosInstance;
  }
}
export {};
