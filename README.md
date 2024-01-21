Run "npm install" to install the node modules

Run "brew services start mongodb" to start the mongo server

Run "npm run start" to start the server

Add burritos using the post request in "/api/burrito" using the format {name: "<name>", size: "<size>", price: "<price>"}, eg, {name: "Chicken Burrito", size: "Regular", price: "$3"}

Delete burritos using the delete request in "/api/burrito/<id>"

Fetch all burritos using the get request in "/api/burrito"

Add order using the post request in "/api/order" with body using the format {items: jsonItemsObject} where jsonItemsObject is a JSON object of the format {"<name>, <size>, <add ons>": <quantity>}, eg, {"Lamb Burrito, XL, Olives, Pepper": 2}

Fetch all orders using the get request in "/api/orders"

Fetch order using get request in "/api/order/<id>"

Modify order using put request in "/api/order/<id>" with body using the format {items: jsonModifiedItemsObject} where jsonItemsObject is a JSON object of the format {"<name>, <size>, <add ons>": <quantity>} where the items are the items to be added (was not part of the list), modify (change in quantity), or removed (quantity set to 0)

Delete order using the delete request in "/api/order/<id>"
