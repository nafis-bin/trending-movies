import { Client, Query, ID, TablesDB, Role, Permission } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)

const tables = new TablesDB(client)


export const updateSearchCount = async (searchTerm,  movie) => {
    // see if it exists already
    try {
        const resultList = await tables.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [Query.equal('searchTerm', searchTerm)],
            limit: 1
        });
        
        if (resultList.rows.length > 0) {
            const row = resultList.rows[0];
            console.log(row.count)

            await tables.incrementRowColumn({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: row.$id,
                column: 'count',
                value: 1
            });

           

        } else {
            await tables.createRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: ID.unique(),
                data: { searchTerm, count: 1, movie_id: movie.id, poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`},
                permissions: [
                    Permission.read(Role.any()), 
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            })

        }

    } catch (error) {
        console.error(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await tables.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [
                Query.limit(5),
                Query.orderDesc('count')
            ]
        })

        console.table(result.rows[0])

        return result.rows;
    } catch(err) {
        console.error(err)
    }
}