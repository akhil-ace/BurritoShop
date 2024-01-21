const { beforeEach, afterEach } = require('node:test');
const {Burrito, Order, app} = require('./index')
const request = require('supertest')
jest.setTimeout(30 * 1000)

describe("BurritoShopTest", () => {
    test("should be", () => {
        expect(new Burrito()).toBeInstanceOf(Burrito);
    });

    const burrito1 = {
        name: "Chicken Burrito",
        price: "$3",
        size: "Regular"
    }
    const burrito2 = {
        name: "Lamb Burrito",
        price: "$7",
        size: "XL"
    }
    test("Get list of all burritos", async() => {
        const currentLength = (await request(app).get("/api/burrito")).body.length;
        const response1 = await request(app).post("/api/burrito").send(burrito1);
        const response2 = await request(app).post("/api/burrito").send(burrito2);
        const response = await request(app).get("/api/burrito");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(currentLength+2);
        await request(app).delete(`/api/burrito/${response1.body._id}`)
        await request(app).delete(`/api/burrito/${response2.body._id}`)
    });
    test("Post list of all burritos (error)", async() => {
        const response = await request(app).post("/api/burrito");
        expect(response.statusCode).toBe(500);
    });
    test("Put list of all burritos (error)", async() => {
        const response = await request(app).put("/api/burrito");
        expect(response.statusCode).toBe(404);
    });
    test("Delete list of all burritos (error)", async() => {
        const response = await request(app).delete("/api/burrito");
        expect(response.statusCode).toBe(404);
    });
    const order1 = {
        items: JSON.stringify({
            "Chicken Burrito, Regular": 2,
            "Lamb Burrito, XL": 1
        })
    }
    const order2 = {
        items: JSON.stringify({
            "Chicken Burrito, Regular": 1
        })
    }
    test("Get list of all orders", async() => {
        const currentLength = (await request(app).get("/api/orders")).body.length;
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse1 = await request(app).post("/api/order").send(order1);
        const oResponse2 = await request(app).post("/api/order").send(order2);
        const response = await request(app).get("/api/orders");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(currentLength+2);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${oResponse1.body._id}`)
        await request(app).delete(`/api/order/${oResponse2.body._id}`)
    });
    test("Post list of all orders (error)", async() => {
        const response = await request(app).post("/api/orders");
        expect(response.statusCode).toBe(404);
    });
    test("Put list of all orders (error)", async() => {
        const response = await request(app).put("/api/orders");
        expect(response.statusCode).toBe(404);
    });
    test("Delete list of all orders (error)", async() => {
        const response = await request(app).delete("/api/orders");
        expect(response.statusCode).toBe(404);
    });
    test("Get order", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse = await request(app).post("/api/order").send(order1);
        const orderId = oResponse.body._id;
        const response = await request(app).get(`/api/order/${orderId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual(oResponse.body);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${oResponse.body._id}`)
    });
    test("Get order that does not exist (message)", async() => {
        const orderId = "12345";
        const response = await request(app).get(`/api/order/${orderId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Invalid id");
    });
    test("Post order", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const response = await request(app).post("/api/order").send(order1);
        const orderId = response.body._id;
        expect(response.statusCode).toBe(200);
        expect(response.body.burritoItems).toStrictEqual(JSON.parse(order1.items));
        expect(response.body.total).toStrictEqual(13);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${response.body._id}`)
    });
    test("Post order with non existing item (message)", async() => {
        const response = await request(app).post("/api/order").send({
            items: JSON.stringify({
                "Vegan Burrito, Regular": 1
            })
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Invalid item");
    });
    test("Put order, add item", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse = await request(app).post("/api/order").send(order2);
        const orderId = oResponse.body._id;
        const response = await request(app).put(`/api/order/${orderId}`).send({ items: JSON.stringify({"Lamb Burrito, XL": 1})});
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(`New total is 10`);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${oResponse.body._id}`)
    });
    test("Put order, modify item", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse = await request(app).post("/api/order").send(order1);
        const orderId = oResponse.body._id;
        const response = await request(app).put(`/api/order/${orderId}`).send({ items: JSON.stringify({"Chicken Burrito, Regular": 3})});
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(`New total is 16`);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${oResponse.body._id}`)
    });
    test("Put order, remove item", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse = await request(app).post("/api/order").send(order1);
        const orderId = oResponse.body._id;
        const response = await request(app).put(`/api/order/${orderId}`).send({ items: JSON.stringify({"Chicken Burrito, Regular": 0})});
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(`New total is 7`);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${oResponse.body._id}`)
    });
    test("Put order, non existing item (message)", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse = await request(app).post("/api/order").send(order1);
        const orderId = oResponse.body._id;
        const response = await request(app).put(`/api/order/${orderId}`).send({ items: JSON.stringify({"Vegan Burrito, Regular": 0})});
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Invalid item");
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
        await request(app).delete(`/api/order/${oResponse.body._id}`)
    });
    test("Put order, non existing order (message)", async() => {
        const orderId = "1234";
        const response = await request(app).put(`/api/order/${orderId}`).send({ items: JSON.stringify({"Vegan Burrito, Regular": 0})});
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Invalid order");
    });
    test("Delete order", async() => {
        const bResponse1 = await request(app).post("/api/burrito").send(burrito1);
        const bResponse2 = await request(app).post("/api/burrito").send(burrito2);
        const oResponse = await request(app).post("/api/order").send(order1);
        const orderId = oResponse.body._id;
        const response = await request(app).delete(`/api/order/${orderId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(`Successfully deleted!`);
        await request(app).delete(`/api/burrito/${bResponse1.body._id}`)
        await request(app).delete(`/api/burrito/${bResponse2.body._id}`)
    });
    test("Delete non existing order", async() => {
        const orderId = "1234";
        const response = await request(app).delete(`/api/order/${orderId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Invalid order");
    });
});