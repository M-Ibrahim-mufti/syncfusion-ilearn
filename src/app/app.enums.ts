export enum UserRoles {
    Administrator = '2D25EE17-D57D-4236-B9BD-05CF457CDEAC',
    Student = '75F0D29D-2BA4-467D-B878-D942BA5ACB39',
    Teacher = 'DB6E265B-EA3C-4FF3-BF96-23F3562D2DA6',
    Parent = '01E64BE9-5A76-4558-8AB8-F176FBDB2CFD'
}

export enum RefreshTokenRequestSources {
    AppIntializer = 'AppIntializer',
    AdminAppComponent = 'AdminAppComponent',
    ErrorInterceptor = 'ErrorInterceptor'
}

export enum NotificationTypes {
    Success,
    Info,
    Error,
    Alert
}