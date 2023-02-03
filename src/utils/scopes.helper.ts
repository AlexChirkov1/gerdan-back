import { ScopeOptions } from 'sequelize';

export class ScopesHelper {
    // TODO: this part of code isn't tested yet. Need to verify stability and possibly remove mutation of original array

    static injectCommonScopes(scopes: ScopeOptions[], options: any, filters?: Record<string, any>): void {
        ScopesHelper.injectQueryScopes(scopes, options, filters);
        ScopesHelper.injectOrderScopes(scopes, options);
    }

    static injectQueryScopes(scopes: ScopeOptions[], query: Record<string, unknown>, options: Record<string, ScopeOptions>): void {
        if (!options) return;

        const queryKeys = Object.keys(query);
        for (const key of queryKeys) {
            if (query[key] == null) continue;
            const option = options[key];
            if (option) {
                scopes.push(option);
            }
        }
    }

    static injectOrderScopes(scopes: ScopeOptions[], query: any): void {
        if (query.orderBy || query.orderType) {
            scopes.push({ method: ['order', query] });
        }
    }
}
