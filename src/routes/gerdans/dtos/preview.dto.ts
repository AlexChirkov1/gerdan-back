import { Expose } from 'class-transformer';
import { base64 } from 'src/database/common/base64';
import { getFileType } from 'src/database/file_types';
import { File } from 'src/database/models/file.model';

export class PreviewDto {
    @Expose()
    id: string;
    @Expose()
    url: string;
    constructor(file: Partial<File>) {
        this.id = base64(file.id);
        this.url = process.env.EXPOSE_URL + '/bucket/' + this.id + '.' + getFileType(file.type);
    }
}
