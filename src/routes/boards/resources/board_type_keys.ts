import { BoardTypeEnum } from 'src/database/models/board.model';

export const BoardTypeKeys = Object.keys(BoardTypeEnum).filter(key => !+key) as ReadonlyArray<keyof typeof BoardTypeEnum>;
