import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SettingController::index
* @see app/Http/Controllers/Admin/SettingController.php:22
* @route '/admin/settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::index
* @see app/Http/Controllers/Admin/SettingController.php:22
* @route '/admin/settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::index
* @see app/Http/Controllers/Admin/SettingController.php:22
* @route '/admin/settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::index
* @see app/Http/Controllers/Admin/SettingController.php:22
* @route '/admin/settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::updateTax
* @see app/Http/Controllers/Admin/SettingController.php:36
* @route '/admin/settings/tax'
*/
export const updateTax = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateTax.url(options),
    method: 'post',
})

updateTax.definition = {
    methods: ["post"],
    url: '/admin/settings/tax',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::updateTax
* @see app/Http/Controllers/Admin/SettingController.php:36
* @route '/admin/settings/tax'
*/
updateTax.url = (options?: RouteQueryOptions) => {
    return updateTax.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::updateTax
* @see app/Http/Controllers/Admin/SettingController.php:36
* @route '/admin/settings/tax'
*/
updateTax.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateTax.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::updateStore
* @see app/Http/Controllers/Admin/SettingController.php:49
* @route '/admin/settings/store'
*/
export const updateStore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateStore.url(options),
    method: 'post',
})

updateStore.definition = {
    methods: ["post"],
    url: '/admin/settings/store',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::updateStore
* @see app/Http/Controllers/Admin/SettingController.php:49
* @route '/admin/settings/store'
*/
updateStore.url = (options?: RouteQueryOptions) => {
    return updateStore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::updateStore
* @see app/Http/Controllers/Admin/SettingController.php:49
* @route '/admin/settings/store'
*/
updateStore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateStore.url(options),
    method: 'post',
})

const SettingController = { index, updateTax, updateStore }

export default SettingController