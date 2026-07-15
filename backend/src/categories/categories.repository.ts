import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";


@Injectable()
export class CategoriesRepository {


constructor(
private databaseService:DatabaseService
){}



async findAll(){

const result =
await this.databaseService.query(
`
SELECT 
id,
nom

FROM categories

ORDER BY nom
`
);


return result.rows;

}


}