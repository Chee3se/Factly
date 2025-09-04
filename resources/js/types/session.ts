export interface Session {
    id: string;
    ip_address: string;
    is_current: boolean;
    device: 'Desktop Computer' | 'Mobile Device' | 'Tablet';
    browser: string;
    platform: string;
    location: string | null;
    last_active: string;
}

export interface SessionWithStrictTypes {
    id: string;
    ip_address: string;
    is_current: boolean;
    device: DeviceType;
    browser: BrowserType;
    platform: PlatformType;
    location: string | null;
    last_active: string;
}

export type DeviceType =
    | 'Desktop Computer'
    | 'Mobile Device'
    | 'Tablet';

export type BrowserType =
    | 'Firefox'
    | 'Chrome'
    | 'Safari'
    | 'Edge'
    | 'Opera'
    | 'Internet Explorer'
    | 'Unknown'
    | string;

export type PlatformType =
    | 'OS X'
    | 'Windows'
    | 'Linux'
    | 'iOS'
    | 'Android'
    | 'Unknown'
    | string;
