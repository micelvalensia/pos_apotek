import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SettingController::update
* @see app/Http/Controllers/Admin/SettingController.php:36
* @route '/admin/settings/tax'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/admin/settings/tax',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::update
* @see app/Http/Controllers/Admin/SettingController.php:36
* @route '/admin/settings/tax'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::update
* @see app/Http/Controllers/Admin/SettingController.php:36
* @route '/admin/settings/tax'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

const tax = {
    update: Object.assign(update, update),
}

export default tax