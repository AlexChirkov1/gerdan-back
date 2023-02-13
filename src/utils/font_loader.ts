import { readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

export class FontLoader {
    static getRobotoMedium() {
        return readFileSync(join(cwd(), 'fonts', 'Roboto-Medium.ttf'));
    }

    static getRobotoRegular() {
        return readFileSync(join(cwd(), 'fonts', 'Roboto-Regular.ttf'));
    }
}
