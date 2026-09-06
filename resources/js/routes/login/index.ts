import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see routes/web.php:55
* @route '/login-admin'
*/
export const admin = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(options),
    method: 'get',
})

admin.definition = {
    methods: ["get","head"],
    url: '/login-admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:55
* @route '/login-admin'
*/
admin.url = (options?: RouteQueryOptions) => {
    return admin.definition.url + queryParams(options)
}

/**
* @see routes/web.php:55
* @route '/login-admin'
*/
admin.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: admin.url(options),
    method: 'get',
})

/**
* @see routes/web.php:55
* @route '/login-admin'
*/
admin.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: admin.url(options),
    method: 'head',
})

/**
* @see routes/web.php:59
* @route '/login-cashier'
*/
export const cashier = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cashier.url(options),
    method: 'get',
})

cashier.definition = {
    methods: ["get","head"],
    url: '/login-cashier',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:59
* @route '/login-cashier'
*/
cashier.url = (options?: RouteQueryOptions) => {
    return cashier.definition.url + queryParams(options)
}

/**
* @see routes/web.php:59
* @route '/login-cashier'
*/
cashier.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cashier.url(options),
    method: 'get',
})

/**
* @see routes/web.php:59
* @route '/login-cashier'
*/
cashier.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cashier.url(options),
    method: 'head',
})

