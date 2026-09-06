import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\InventoryController::adjustStock
* @see app/Http/Controllers/Admin/InventoryController.php:87
* @route '/admin/inventory/adjust-stock'
*/
export const adjustStock = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustStock.url(options),
    method: 'post',
})

adjustStock.definition = {
    methods: ["post"],
    url: '/admin/inventory/adjust-stock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::adjustStock
* @see app/Http/Controllers/Admin/InventoryController.php:87
* @route '/admin/inventory/adjust-stock'
*/
adjustStock.url = (options?: RouteQueryOptions) => {
    return adjustStock.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::adjustStock
* @see app/Http/Controllers/Admin/InventoryController.php:87
* @route '/admin/inventory/adjust-stock'
*/
adjustStock.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustStock.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::index
* @see app/Http/Controllers/Admin/InventoryController.php:27
* @route '/admin/inventory'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/inventory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::index
* @see app/Http/Controllers/Admin/InventoryController.php:27
* @route '/admin/inventory'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::index
* @see app/Http/Controllers/Admin/InventoryController.php:27
* @route '/admin/inventory'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::index
* @see app/Http/Controllers/Admin/InventoryController.php:27
* @route '/admin/inventory'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::create
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/inventory/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::create
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::create
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::create
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::store
* @see app/Http/Controllers/Admin/InventoryController.php:53
* @route '/admin/inventory'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/inventory',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::store
* @see app/Http/Controllers/Admin/InventoryController.php:53
* @route '/admin/inventory'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::store
* @see app/Http/Controllers/Admin/InventoryController.php:53
* @route '/admin/inventory'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::show
* @see app/Http/Controllers/Admin/InventoryController.php:63
* @route '/admin/inventory/{inventory}'
*/
export const show = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/inventory/{inventory}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::show
* @see app/Http/Controllers/Admin/InventoryController.php:63
* @route '/admin/inventory/{inventory}'
*/
show.url = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inventory: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inventory: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inventory: typeof args.inventory === 'object'
        ? args.inventory.id
        : args.inventory,
    }

    return show.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::show
* @see app/Http/Controllers/Admin/InventoryController.php:63
* @route '/admin/inventory/{inventory}'
*/
show.get = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::show
* @see app/Http/Controllers/Admin/InventoryController.php:63
* @route '/admin/inventory/{inventory}'
*/
show.head = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/{inventory}/edit'
*/
export const edit = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/inventory/{inventory}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/{inventory}/edit'
*/
edit.url = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    if (Array.isArray(args)) {
        args = {
            inventory: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inventory: args.inventory,
    }

    return edit.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/{inventory}/edit'
*/
edit.get = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
* @see app/Http/Controllers/Admin/InventoryController.php:0
* @route '/admin/inventory/{inventory}/edit'
*/
edit.head = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::update
* @see app/Http/Controllers/Admin/InventoryController.php:77
* @route '/admin/inventory/{inventory}'
*/
export const update = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/inventory/{inventory}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::update
* @see app/Http/Controllers/Admin/InventoryController.php:77
* @route '/admin/inventory/{inventory}'
*/
update.url = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inventory: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inventory: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inventory: typeof args.inventory === 'object'
        ? args.inventory.id
        : args.inventory,
    }

    return update.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::update
* @see app/Http/Controllers/Admin/InventoryController.php:77
* @route '/admin/inventory/{inventory}'
*/
update.put = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::update
* @see app/Http/Controllers/Admin/InventoryController.php:77
* @route '/admin/inventory/{inventory}'
*/
update.patch = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
* @see app/Http/Controllers/Admin/InventoryController.php:97
* @route '/admin/inventory/{inventory}'
*/
export const destroy = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/inventory/{inventory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
* @see app/Http/Controllers/Admin/InventoryController.php:97
* @route '/admin/inventory/{inventory}'
*/
destroy.url = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inventory: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inventory: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inventory: typeof args.inventory === 'object'
        ? args.inventory.id
        : args.inventory,
    }

    return destroy.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
* @see app/Http/Controllers/Admin/InventoryController.php:97
* @route '/admin/inventory/{inventory}'
*/
destroy.delete = (args: { inventory: string | number | { id: string | number } } | [inventory: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const InventoryController = { adjustStock, index, create, store, show, edit, update, destroy }

export default InventoryController