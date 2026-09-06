import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SettingController::update
* @see app/Http/Controllers/Admin/SettingController.php:49
* @route '/admin/settings/store'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/admin/settings/store',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::update
* @see app/Http/Controllers/Admin/SettingController.php:49
* @route '/admin/settings/store'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::update
* @see app/Http/Controllers/Admin/SettingController.php:49
* @route '/admin/settings/store'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

const store = {
    update: Object.assign(update, update),
}

export default store