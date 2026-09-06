import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PosController::index
* @see app/Http/Controllers/PosController.php:25
* @route '/pos'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/pos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::index
* @see app/Http/Controllers/PosController.php:25
* @route '/pos'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::index
* @see app/Http/Controllers/PosController.php:25
* @route '/pos'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PosController::index
* @see app/Http/Controllers/PosController.php:25
* @route '/pos'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosController::barcodeLookup
* @see app/Http/Controllers/PosController.php:46
* @route '/pos/barcode-lookup'
*/
export const barcodeLookup = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barcodeLookup.url(options),
    method: 'get',
})

barcodeLookup.definition = {
    methods: ["get","head"],
    url: '/pos/barcode-lookup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::barcodeLookup
* @see app/Http/Controllers/PosController.php:46
* @route '/pos/barcode-lookup'
*/
barcodeLookup.url = (options?: RouteQueryOptions) => {
    return barcodeLookup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::barcodeLookup
* @see app/Http/Controllers/PosController.php:46
* @route '/pos/barcode-lookup'
*/
barcodeLookup.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barcodeLookup.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PosController::barcodeLookup
* @see app/Http/Controllers/PosController.php:46
* @route '/pos/barcode-lookup'
*/
barcodeLookup.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: barcodeLookup.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosController::checkout
* @see app/Http/Controllers/PosController.php:60
* @route '/pos/checkout'
*/
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

checkout.definition = {
    methods: ["post"],
    url: '/pos/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosController::checkout
* @see app/Http/Controllers/PosController.php:60
* @route '/pos/checkout'
*/
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::checkout
* @see app/Http/Controllers/PosController.php:60
* @route '/pos/checkout'
*/
checkout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

const pos = {
    index: Object.assign(index, index),
    barcodeLookup: Object.assign(barcodeLookup, barcodeLookup),
    checkout: Object.assign(checkout, checkout),
}

export default pos