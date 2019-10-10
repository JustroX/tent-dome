# Tent
> REST API Framework

Tent-Dome automatically creates REST API endpoints from model definitions.

## Installation

`tent-dome` is currently at `v0.0.1` things won't get published on `npm` until `v1.0.0`.
For the meantime you can install directly from the repository.

```
npm install https://github.com/JustroX/tent-dome.git
```



## Quickstart - Tent application in 26 lines.
```js
import { Tent } from "tent-dome";

//1. Initialize Tent
Tent.init({
	"mongoose uri": "URI TO DATABASE"
});

//2. Define entity.
var BooksEntity = tent.Entity("Book",{
	name : String,
	date : { type: Date, default: Date.now }
});

//3. Assign CRUD(+L) routes on entity
BooksEntity.Routes.create();
BooksEntity.Routes.update();
BooksEntity.Routes.read();
BooksEntity.Routes.list();
BooksEntity.Routes.delete();

//Register entity
BooksEntity.register()

//Start app at port 3000.
Tent.register();
Tent.start(3000);
```
And that's it!
You can now access your REST API server on port 3000 via the following HTTP requests:

1. Create a new document
```
POST :3000/api/books { name : "Harry Potter" }
```
2. Read a document
```
GET :3000/api/books/{id}
```
3. Update a document
```
PUT :3000/api/books/{id} { name : "Harry Potter - Edited" }
```
4. List all documents
```
GET :3000/api/books
```
5. Delete a document
```
DELETE :3000/api/books/{id}
```

## Documentation
See this [link](https://justrox.github.io/tent-dome/) for the documentation.

## Usage
1. [Models](modules/model.html)
 - Expand
2. REST URLs
 - CRUD operations
 - LIST operations
  - Pagination
  - Filters
  - Sorting
  - Advanced queries
3. Routes
 - Builders
 - Accessors
 - Dispatchers
 - Prebuilt Middlewares
4. [Plugins](modules/plugin.html)
 - [Sanitation Plugin](modules/sanitationplugin.html) 

## Core Roadmap
- [x] Sanitation
- [x] Validation
- [x] Expand Query
- [x] Virtual fields
- [x] Methods and Statics
- [x] Authentication Plugin
- [x] Permissions Plugin
- [ ] Rate Limiting
- [ ] Decorator Functions

## Fun features
- [ ] Cloudinary Schema Type
- [ ] Redis Plugin
- [ ] Websocket Plugin

## Testing

```
npm test
```

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request ❤

## License
[GNU General Public License](./LICENSE)
