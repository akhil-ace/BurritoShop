const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = 4567;
const URI = 'mongodb://burritoshopdb:27017/burrito-shop';
mongoose.connect(URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const burritoSchema = new mongoose.Schema({
    name: String,
    sizes: {}
});
const Burrito = mongoose.model("Burrito", burritoSchema);

const orderSchema = new mongoose.Schema({
    burritoItems: {},
    total: Number
})
const Order = mongoose.model("Order", orderSchema);


app.get("/api/burrito", (req, res) => {
    Burrito.find().then((burritos) => {
        res.json(burritos);
    });
})

app.post("/api/burrito", (req, res) => {
    const name = req.body.name;
    const size = req.body.size;
    const price = req.body.price;
    if (price[0] != "$") {
        res.json({message:"Price should be of the format $3"})
    }
    const sizes = {}
    sizes[size] = price;
    const burrito = new Burrito({
        name: name,
        sizes: sizes
    })
    burrito.save().then((err) => {
        res.json(burrito);
    });
});

app.delete("/api/burrito/:id", (req, res) => {
    Burrito.findByIdAndDelete(req.params.id).then((burrito) => {
        res.json({message:"Successfully deleted!"});
    });
})

app.get("/api/orders", (req, res) => {
    Order.find().then((orders) => {
        res.json(orders);
    });
})

app.get("/api/order/:id", (req, res) => {
    Order.findById(req.params.id).then((order) => {
        res.json(order);
    }).catch(function(e) {
        res.json({message: "Invalid id"})
    });
})

app.post("/api/order/", (req, res) => {
    const items = JSON.parse(req.body.items);
    const itemCount = Object.keys(items).length;
    let itemsCounted = 0;
    let total = 0;
    const quantities = {}
    const burritoItems = {}
    for ([item, quantity] of Object.entries(items)) {
        const itemArray = item.split(", ");
        quantities[item] = quantity
        if (itemArray.length > 1) {
            const burrito = Burrito.findOne({name:itemArray[0]}).then((burrito) => {
                const price = burrito.sizes[itemArray[1]];
                if (!price || price[0] != "$") {
                    res.json({message:`Invalid menu item ${itemArray[0]} of size ${itemArray[1]}`})
                    return
                }
                const itemKey = itemArray.join(", ");
                burritoItems[itemKey] = quantities[itemKey];
                total += quantities[itemKey] * parseInt(price.replace("$", ""));
                itemsCounted += 1;
                if (itemsCounted == itemCount) {
                    const order = new Order({
                        burritoItems: burritoItems,
                        total: total
                    })
                    order.save().then((err) => {
                        res.json(order);
                    })
                }
            }).catch(function(e) {
                res.json({message: "Invalid item"});
            });
        } else {
            res.json({message:`Invalid item ${item}`})
        }
    }
})

app.put("/api/order/:id", (req, res) => {
    Order.findById(req.params.id).then((order) => {
        const items = JSON.parse(req.body.items);
        const itemCount = Object.keys(items).length;
        let itemsCounted = 0;
        const quantities = {}
        const burritoItems = order.burritoItems;
        for ([item, quantity] of Object.entries(items)) {
            const itemArray = item.split(", ");
            quantities[item] = quantity
            if (itemArray.length > 1) {
                const burrito = Burrito.findOne({name:itemArray[0]}).then((burrito) => {
                    const price = burrito.sizes[itemArray[1]];
                    if (!price || price[0] != "$") {
                        res.json({message:`Invalid menu item ${itemArray[0]} of size ${itemArray[1]}`})
                        return
                    }
                    const itemKey = itemArray.join(", ");
                    if (!!burritoItems[itemKey]) {
                        order.total -= burritoItems[itemKey] * parseInt(price.replace("$", ""))
                    }
                    burritoItems[itemKey] = quantities[itemKey];
                    order.total += quantities[itemKey] * parseInt(price.replace("$", ""))
                    itemsCounted += 1
                    if (quantities[itemKey] == 0) {
                        delete burritoItems[itemKey];
                    }
                    if (itemsCounted == itemCount) {
                        Order.findByIdAndUpdate(req.params.id, {burritoItems:burritoItems, total: order.total}).then((neworder) => {
                            res.json({message: `New total is ${order.total}`});
                        });
                    }
                }).catch(function(e) {
                    res.json({message: "Invalid item"});
                })
            }
        }
        // res.json(order);
    }).catch(function(e) {
        res.json({message: "Invalid order"});
    });
})

app.delete("/api/order/:id", (req, res) => {
    Order.findByIdAndDelete(req.params.id).then((order) => {
        res.json({message:"Successfully deleted!"});
    }).catch(function(e) {
        res.json({message: "Invalid order"});
    });
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

module.exports = {Burrito, Order, app}