/**
 * @module Routes
 *
 *
 */
import { Builder } from './routes/builder';
import { Router } from 'express';
/**
* HTTP method type
*/
export declare type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'LIST';
/**
* Builder Defintion
* @typeparam T schema of the model
*/
interface BuilderConfig<T> {
    /** builder instance */
    builder: Builder<T>;
    /** HTTP method */
    method: Methods;
    /** URL endpoint */
    endpoint: string;
}
/**
* Routes class. This class is responsible for organizing and structuring routers and url endpoints of the model.
* @typeparam T schema of the model
*/
export declare class Routes<T> {
    /** Express router */
    router: Router;
    /** List of builder definitions */
    builders: BuilderConfig<T>[];
    /** Name of the current model. */
    name: string;
    /**
    * @param name pluralized name of the current model
    */
    constructor(name: string);
    /**
    * Registers the current route. Exposes the builders to their endpoints.
    */
    register(): void;
    /**
    * Constructs a new endpoint. Returns the builder.
    * @param endpoint name of the new endpoint
    * @param method HTTP method
    */
    endpoint(endpoint: string, method: Methods): Builder<T>;
    /**
    * Returns the builder of an already defined endpoint in this route.
    * @param endpoint name of the endpoint
    * @param method HTTP method
    */
    builder(endpoint: string, method: Methods): Builder<T>;
    /**
    * Returns an express router.
    */
    expose(): Router;
    /**
     * Creates a new endpoint with predefined middlewares to create a new document. Returns the builder.
     */
    create(): Builder<T>;
    /**
     * Creates a new endpoint with predefined middlewares to update a new document. Returns the builder.
     */
    update(): Builder<T>;
    /**
     * Creates a new endpoint with predefined middlewares to read a new document. Returns the builder.
     */
    read(): Builder<T>;
    /**
     * Creates a new endpoint with predefined middlewares to list a query. Returns the builder.
     */
    list(): Builder<T>;
    /**
     * Creates a new endpoint with predefined middlewares to delete a new document. Returns the builder.
     */
    delete(): Builder<T>;
    /**
     * Creates a new endpoint with predefined middlewares to execute a method of a document. Returns the builder.
     * @param name Name of the method
     * @param requestMethod Request method.
     */
    method(name: string, requestMethod: 'GET' | 'PUT' | 'DELETE'): Builder<T>;
    /**
     * Creates a new endpoint with predefined middlewares to execute a static method of a model. Returns the builder.
     * @param name Name of the static method
     * @param requestMethod Request method.
     */
    static(name: string, requestMethod: 'LIST' | 'POST'): Builder<T>;
}
/**
 * Inserts the tent configuration middleware to an express router. Returns the router.
 */
export declare function RegisterRoute(): Router;
export {};
