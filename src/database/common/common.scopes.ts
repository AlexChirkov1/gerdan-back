import { Op } from 'sequelize';
import { base10 } from './base10';

export const commonScopes: any = {
    byId: (id) => ({ where: { id } }),
    pagination: (limit, id) => {
        const scope = { limit: Number(limit), order: [['id', 'desc']] };
        if (id) Object.assign(scope, { where: { id: { [Op.lte]: base10(id) } } });
        return scope;
    },
    prevCursor: (limit, id) => ({ where: { id: { [Op.gte]: id + Number(limit) } }, limit: 1, order: [['id', 'asc']] }),
    nextCursor: (limit, id) => ({ where: { id: { [Op.lte]: id - Number(limit) } }, limit: 1, order: [['id', 'desc']] })
};
